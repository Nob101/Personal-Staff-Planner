// functions/dienstplanGenerator.js
const dienstplanRepo = require('../repositories/dienstplan.repo.pg');
const filialenRepo = require('../repositories/filialen.repo.pg');
const algorithmenRepo = require('../repositories/algorithmen.repo.pg');
const mitarbeiterRepo = require('../repositories/mitarbeiter.repo.pg');
const { getAllDatesOfMonth, getMonthlyHours } = require('./dateUtils');
const { setCounterForMitarbeiter } = require('./setCounter');

async function generateDienstplan(year, month) {
  const jahr = Number(year);
  const monat = Number(month);

  const { monatsstunden } = getMonthlyHours(jahr, monat);
  const filialen = await filialenRepo.getAll();
  const algorithmen = await algorithmenRepo.getAll();
  const alleMitarbeiter = await mitarbeiterRepo.getAll();

  if (!Array.isArray(filialen) || filialen.length === 0) {
    return { jahr, monat, tageImMonat: 0, filialen: [], info: 'Keine Filialen gefunden' };
  }

  // Counter initialisieren
  for (const filiale of filialen) {
    await setCounterForMitarbeiter(filiale.id);
  }

  const dates = getAllDatesOfMonth(jahr, monat);
  const resultFilialen = [];

  // ---------------------------------------------------------------------------
  // PLAN PRO FILIALE
  // ---------------------------------------------------------------------------
  for (const filiale of filialen) {
    const algorithm = algorithmen.find(a => a.id === filiale.algorithmid);
    if (!algorithm) continue;

    let pattern = algorithm.algorythmus || algorithm.pattern;

    // Wenn aus DB (string), dann parsen
    if (typeof pattern === 'string') {
      try {
        pattern = JSON.parse(pattern);
      } catch {
        console.warn(`⚠️  Pattern von ${algorithm.name} konnte nicht geparst werden.`);
        pattern = [];
      }
    }

    // Fallback
    if (!Array.isArray(pattern) || pattern.length === 0) {
      console.warn(`⚠️  Ungültiges Pattern für ${algorithm.name}, Fallback A/E/F verwendet.`);
      pattern = ['A', 'E', 'F'];
    }

    console.log(`✅ Algorithmus ${algorithm.name} verwendet Pattern:`, pattern);

    const patternLen = pattern.length;
    const stundenProDienst = Number(algorithm.stunden) || 9;

    const mitarbeiter = alleMitarbeiter.filter(m => m.hauptfilialeid === filiale.id);
    if (mitarbeiter.length === 0) continue;

    const stundenProMitarbeiter = new Map();
    mitarbeiter.forEach(m => stundenProMitarbeiter.set(m.id, 0));

    const dienstAbdeckung = {};
    for (const d of dates) dienstAbdeckung[d] = { A: [], E: [] };

    const plan = [];

    // -------------------------------------------------------------------------
    // 🔹 TAGES-SCHICHTEN
    // -------------------------------------------------------------------------
    for (const datum of dates) {
      const einsatzHeute = [];

      for (const m of mitarbeiter) {
        if (m.counter == null) m.counter = 0;

        const faktor = getFaktorFuerMitarbeiter(m);
        const zielStunden = monatsstunden * faktor;
        const limit = zielStunden + 20;

        // Wichtig: individueller Startversatz pro Mitarbeiter
        let schicht = pattern[(m.counter + m.id) % patternLen];
        let aktuelleStunden = stundenProMitarbeiter.get(m.id) || 0;

        if (schicht !== 'F') {
          if (aktuelleStunden >= limit) schicht = 'F';
          else aktuelleStunden += stundenProDienst;
          stundenProMitarbeiter.set(m.id, aktuelleStunden);
        }

        const eintrag = {
          dienstId: `${filiale.id}-${datum}-${schicht}-${m.id}`,
          mitarbeiterId: m.id,
          vorname: m.vorname,
          nachname: m.nachname,
          schicht,
          farbe: filiale.farbe,
          filialeId: filiale.id,
          hauptfilialeId: m.hauptfilialeid
        };

        einsatzHeute.push(eintrag);

        if (['A', 'E'].includes(schicht))
          dienstAbdeckung[datum][schicht].push(m.id);

        m.counter = (m.counter + 1) % patternLen;
      }

      // ✅ Sicherstellen, dass mind. A + E abgedeckt ist
      if (einsatzHeute.length > 1) {
        const hatA = einsatzHeute.some(e => e.schicht === 'A');
        const hatE = einsatzHeute.some(e => e.schicht === 'E');
        if (!hatA) einsatzHeute[0].schicht = 'A';
        if (!hatE) einsatzHeute[1].schicht = 'E';
      }

      plan.push({ datum, einsatz: einsatzHeute });
    }

    // -------------------------------------------------------------------------
    // 🔹 STUNDENKÜRZUNG
    // -------------------------------------------------------------------------
    kürzeStunden(plan, dienstAbdeckung, stundenProMitarbeiter, monatsstunden, mitarbeiter, stundenProDienst);

    // Doppelte Sicherheit: A/E prüfen
    for (const tag of plan) {
      const hatA = tag.einsatz.some(e => e.schicht === 'A');
      const hatE = tag.einsatz.some(e => e.schicht === 'E');
      if (!hatA && tag.einsatz.length > 0) tag.einsatz[0].schicht = 'A';
      if (!hatE && tag.einsatz.length > 1) tag.einsatz[1].schicht = 'E';
    }

    // Counter speichern
    for (const m of mitarbeiter) {
      await mitarbeiterRepo.updateCounter(m.id, m.counter);
    }

    resultFilialen.push({
      filiale: { id: filiale.id, ort: filiale.ort, farbe: filiale.farbe },
      arbeitstage: dates.length,
      plan,
      stundenProMitarbeiter: Object.fromEntries(stundenProMitarbeiter)
    });
  }

  // ---------------------------------------------------------------------------
  // PLAN SPEICHERN
  // ---------------------------------------------------------------------------
  const planObjekt = {
    jahr,
    monat,
    tageImMonat: dates.length,
    monatsstunden,
    filialen: resultFilialen
  };

  await dienstplanRepo.save({
    jahr,
    monat,
    ...planObjekt
  });

  console.log(`✅ Dienstplan ${monat}/${jahr} erfolgreich generiert.`);
  return planObjekt;
}

// -----------------------------------------------------------------------------
// 🔧 HILFSFUNKTIONEN
// -----------------------------------------------------------------------------
function kürzeStunden(plan, dienstAbdeckung, stundenProMitarbeiter, monatsstunden, mitarbeiter, stundenProDienst) {
  const minWorkersProSchicht = 1;
  for (const m of mitarbeiter) {
    const faktor = getFaktorFuerMitarbeiter(m);
    const ziel = monatsstunden * faktor;
    let hours = stundenProMitarbeiter.get(m.id) || 0;

    while (hours > ziel) {
      const kandidaten = [];
      for (const tag of plan) {
        const idx = tag.einsatz.findIndex(e => e.mitarbeiterId === m.id && e.schicht !== 'F');
        if (idx === -1) continue;
        const eins = tag.einsatz[idx];
        const abdeckung = dienstAbdeckung[tag.datum][eins.schicht];
        if (!abdeckung || abdeckung.length <= minWorkersProSchicht) continue;
        kandidaten.push({ tag, idx, schicht: eins.schicht });
      }
      if (kandidaten.length === 0) break;
      const { tag, idx, schicht } = kandidaten[Math.floor(Math.random() * kandidaten.length)];
      tag.einsatz[idx].schicht = 'F';
      dienstAbdeckung[tag.datum][schicht] =
        dienstAbdeckung[tag.datum][schicht].filter(mid => mid !== m.id);
      hours -= stundenProDienst;
      stundenProMitarbeiter.set(m.id, Math.max(0, hours));
    }
  }
}

function getFaktorFuerMitarbeiter(m) {
  const typ = Number(m.arbeitnehmertyp || 40);
  return typ / 40;
}

module.exports = { generateDienstplan };
