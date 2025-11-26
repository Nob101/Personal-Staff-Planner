// functions/dienstplanGenerator.js
const dienstplanRepo = require('../repositories/dienstplan.repo.pg');
const filialenRepo = require('../repositories/filialen.repo.pg');
const algorithmenRepo = require('../repositories/algorithmen.repo.pg');
const mitarbeiterRepo = require('../repositories/mitarbeiter.repo.pg');
const { getAllDatesOfMonth, getMonthlyHours } = require('./dateUtils');
const { setCounterForMitarbeiter } = require('./setCounter');

/**
 * Generiert den Dienstplan für alle Filialen und speichert ihn als JSON in der DB.
 */
async function generateDienstplan(year, month) {
  const jahr = Number(year);
  const monat = Number(month);

  // Monatsstunden laut Werktage (Mo–Fr)
  const { monatsstunden } = getMonthlyHours(jahr, monat);

  // Stammdaten aus der Datenbank
  const filialen = await filialenRepo.getAll();
  const algorithmen = await algorithmenRepo.getAll();
  const alleMitarbeiter = await mitarbeiterRepo.getAll();

  if (!Array.isArray(filialen) || filialen.length === 0) {
    return { jahr, monat, tageImMonat: 0, filialen: [], info: 'Keine Filialen gefunden' };
  }

  // Counter pro Filiale aktualisieren
  for (const filiale of filialen) {
    await setCounterForMitarbeiter(filiale.id);
  }

  const dates = getAllDatesOfMonth(jahr, monat);
  const resultFilialen = [];

  // -----------------------------------------------------------
  // Dienstplan pro Filiale erzeugen
  // -----------------------------------------------------------
  for (const filiale of filialen) {
    const algorithm = algorithmen.find(a => a.id === filiale.algorithmid);

    if (!algorithm) {
      resultFilialen.push({
        filiale: { id: filiale.id, standort: filiale.standort, farbe: filiale.farbe },
        arbeitstage: dates.length,
        plan: [],
        error: 'Kein Algorithmus gefunden'
      });
      continue;
    }

    const pattern = algorithm.algorythmus || algorithm.pattern;
    const patternLen = Array.isArray(pattern) ? pattern.length : 0;

    if (patternLen === 0) {
      resultFilialen.push({
        filiale: { id: filiale.id, standort: filiale.standort, farbe: filiale.farbe },
        arbeitstage: dates.length,
        plan: [],
        error: 'Ungültiges Pattern'
      });
      continue;
    }

    const stundenProDienst = Number(algorithm.stunden) || 9;
    const mitarbeiter = alleMitarbeiter.filter(m => m.hauptfilialeid === filiale.id);

    const stundenProMitarbeiter = new Map();
    mitarbeiter.forEach(m => stundenProMitarbeiter.set(m.id, 0));

    const dienstAbdeckung = {};
    for (const d of dates) dienstAbdeckung[d] = { A: [], E: [] };

    const plan = [];

    // -----------------------------------------------------------
    // Tages-Schichten
    // -----------------------------------------------------------
    for (const datum of dates) {
      const einsatzHeute = [];

      for (const m of mitarbeiter) {
        if (m.counter == null) m.counter = 0;

        const faktor = getFaktorFuerMitarbeiter(m);
        const zielStunden = monatsstunden * faktor;
        const limit = zielStunden + 20;

        const schichtPattern = pattern;
        const schichtRoh = schichtPattern[m.counter % patternLen];
        let schicht = schichtRoh;

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

      plan.push({ datum, einsatz: einsatzHeute });
    }

    kürzeStunden(plan, dienstAbdeckung, stundenProMitarbeiter, monatsstunden, mitarbeiter, stundenProDienst);

    for (const m of mitarbeiter) {
    await mitarbeiterRepo.updateCounter(m.id, m.counter);
  }

    resultFilialen.push({
      filiale: { id: filiale.id, standort: filiale.standort, farbe: filiale.farbe },
      arbeitstage: dates.length,
      plan,
      stundenProMitarbeiter: Object.fromEntries(stundenProMitarbeiter)
    });
  }

  // -----------------------------------------------------------
  // Dienstplan in der DB speichern
  // -----------------------------------------------------------
  const planObjekt = {
    jahr,
    monat,
    tageImMonat: dates.length,
    monatsstunden,
    filialen: resultFilialen
  };

  await dienstplanRepo.save({
  jahr: jahr,
  monat: monat,
  ...planObjekt
  });

return planObjekt;
}
// -----------------------------------------------------------
// Hilfsfunktionen
// -----------------------------------------------------------
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

      const rnd = Math.floor(Math.random() * kandidaten.length);
      const { tag, idx, schicht } = kandidaten[rnd];
      tag.einsatz[idx].schicht = 'F';
      dienstAbdeckung[tag.datum][schicht] =
        dienstAbdeckung[tag.datum][schicht].filter(mid => mid !== m.id);

      hours -= stundenProDienst;
      if (hours < 0) hours = 0;
      stundenProMitarbeiter.set(m.id, hours);
    }
  }
}

function getFaktorFuerMitarbeiter(m) {
  const typ = Number(m.arbeitnehmer_typ || 40);
  return typ / 40;
}

module.exports = { generateDienstplan };



/*
CREATE TABLE dienstplaene (
  id SERIAL PRIMARY KEY,
  jahr INT NOT NULL,
  monat INT NOT NULL,
  plan_json JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (jahr, monat)
);
*/