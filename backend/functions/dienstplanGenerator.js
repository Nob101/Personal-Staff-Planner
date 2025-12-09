// ============================================================================
// 🧩 dienstplanGenerator.js (DB-Version, Minimal-Schema für Einsätze)
// ----------------------------------------------------------------------------
// Features:
// - berücksichtigt Hauptfilialen
// - Algorithmus/Pattern pro Filiale (A/E/F…)
// - individueller Counter pro Mitarbeiter (rotierender Startpunkt)
// - 20h / 30h / 40h (arbeitnehmertyp)
// - Springer mit eigenem Algorithmus (springeralgorithmid)
// - A und E pro Tag garantiert
// - Stundenkürzung mit Puffer, ohne letzte A/E wegzunehmen
// - speichert NUR {dienstId, mitarbeiterId, schicht} in einsatz
//   (alle Namen/Farben holt das Frontend extra)
// ============================================================================

const filialenRepo    = require('../repositories/filialen.repo.pg');
const algorithmenRepo = require('../repositories/algorithmen.repo.pg');
const mitarbeiterRepo = require('../repositories/mitarbeiter.repo.pg');

const { getAllDatesOfMonth, getMonthlyHours } = require('./dateUtils');
const { setCounterForMitarbeiter }           = require('./setCounter');

// kleiner Puffer über den Sollstunden
const LIMIT_PUFFER_STUNDEN = 20;

// Faktor aus arbeitnehmertyp (20 / 30 / 40)
function getFaktorFuerMitarbeiter(m) {
  const typNum = Number(m.arbeitnehmertyp ?? 40) || 40; // DB-Spalte: arbeitnehmertyp
  return typNum / 40;
}

// Pattern aus Algorithmus holen, egal ob JSON oder String
function parsePattern(algorithm) {
  let pattern = algorithm.algorythmus || algorithm.pattern;

  if (typeof pattern === 'string') {
    try {
      pattern = JSON.parse(pattern);
    } catch {
      pattern = [];
    }
  }

  if (!Array.isArray(pattern) || pattern.length === 0) {
    pattern = ['F']; // Fallback
  }

  return pattern;
}

// ============================================================================
// 🔹 generateDienstplan
// ============================================================================
async function generateDienstplan(year, month) {
  const jahr  = Number(year);
  const monat = Number(month);

  const { monatsstunden } = getMonthlyHours(jahr, monat);
  const dates             = getAllDatesOfMonth(jahr, monat);

  const filialen    = await filialenRepo.getAll();
  const algorithmen = await algorithmenRepo.getAll();

  if (!Array.isArray(filialen) || filialen.length === 0) {
    return {
      jahr,
      monat,
      tageImMonat: 0,
      monatsstunden,
      filialen: [],
      info: 'Keine Filialen vorhanden'
    };
  }

  
  for (const filiale of filialen) {
    await setCounterForMitarbeiter(filiale.id);
  }

  // Mitarbeiter NACH dem Counter-Setup laden
  const alleMitarbeiter = await mitarbeiterRepo.getAll();

  const resultFilialen = [];

  // ========================================================================
  // PLAN PRO FILIALE
  // ========================================================================
  for (const filiale of filialen) {
    const algorithm = algorithmen.find(a => a.id === filiale.algorithmid);

    if (!algorithm) {
      resultFilialen.push({
        filiale: {
          id: filiale.id,
          standort:  filiale.filialname || filiale.ort || "Unbekannt",
          farbe: filiale.farbe
        },
        arbeitstage: dates.length,
        plan: [],
        springer: [],
        offeneDienste: [],
        stundenProMitarbeiter: {},
        error: 'Kein Algorithmus gefunden'
      });
      continue;
    }

    const defaultPattern = parsePattern(algorithm);
    if (!defaultPattern.length) {
      resultFilialen.push({
        filiale: {
          id: filiale.id,
          standort: filiale.filialname || filiale.ort || "Unbekannt",
          farbe: filiale.farbe
        },
        arbeitstage: dates.length,
        plan: [],
        springer: [],
        offeneDienste: [],
        stundenProMitarbeiter: {},
        error: 'Ungültiges Pattern'
      });
      continue;
    }

    const stundenProDienst = Number(algorithm.stunden) || 9;

    // Mitarbeiter dieser Filiale (nur Hauptfiliale)
    const mitarbeiter = alleMitarbeiter.filter(
      m => m.hauptfilialeid === filiale.id
    );

    if (!mitarbeiter.length) {
      resultFilialen.push({
        filiale: {
          id: filiale.id,
          standort: filiale.filialname || filiale.ort || "Unbekannt",
          farbe: filiale.farbe
        },
        arbeitstage: dates.length,
        plan: [],
        springer: [],
        offeneDienste: [],
        stundenProMitarbeiter: {},
        info: 'Keine Mitarbeiter für diese Filiale'
      });
      continue;
    }

    // Stunden-Tracking
    const stundenProMitarbeiter = new Map();
    mitarbeiter.forEach(m => stundenProMitarbeiter.set(m.id, 0));

    // Abdeckung A/E pro Tag
    const dienstAbdeckung = {};
    for (const d of dates) {
      dienstAbdeckung[d] = { A: [], E: [] };
    }

    const plan = [];

    // ==================================================
    // PHASE 1: Grundplan mit Pattern & Stundenlimit
    // ==================================================
    for (const datum of dates) {
      const einsatzHeute = [];

      for (const m of mitarbeiter) {
        if (m.counter == null) m.counter = 0;

        const faktor       = getFaktorFuerMitarbeiter(m);
        const zielStunden  = monatsstunden * faktor;
        const limitStunden = zielStunden + LIMIT_PUFFER_STUNDEN;

        // Algorithmus pro Mitarbeiter (Springer?)
        const algoIdFuerM =
          m.springer && m.springeralgorithmid
            ? m.springeralgorithmid
            : filiale.algorithmid;

        const algoFuerM    = algorithmen.find(a => a.id === algoIdFuerM) || algorithm;
        let patternFuerM   = parsePattern(algoFuerM);

        if (!patternFuerM.length) {
          patternFuerM = ['F'];
        }

        // Schicht aus Pattern
        let schicht = patternFuerM[m.counter % patternFuerM.length];

        // Stundenprüfung
        let bereits = stundenProMitarbeiter.get(m.id) || 0;
        if (schicht !== 'F') {
          if (bereits >= limitStunden) {
            schicht = 'F';
          } else {
            bereits += stundenProDienst;
            stundenProMitarbeiter.set(m.id, bereits);
          }
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


        if (schicht === 'A' || schicht === 'E') {
          dienstAbdeckung[datum][schicht].push(m.id);
        }

        // Counter weiterdrehen
        m.counter = (m.counter + 1) % patternFuerM.length;
      }

      // Sicherstellen: pro Tag mindestens 1x A und 1x E
      let hatA = einsatzHeute.some(e => e.schicht === 'A');
      let hatE = einsatzHeute.some(e => e.schicht === 'E');

      if (!hatA && einsatzHeute.length > 0) {
        const e0 = einsatzHeute[0];
        if (e0.schicht === 'F') {
          const cur = stundenProMitarbeiter.get(e0.mitarbeiterId) || 0;
          stundenProMitarbeiter.set(e0.mitarbeiterId, cur + stundenProDienst);
        }
        e0.schicht = 'A';
        dienstAbdeckung[datum].A.push(e0.mitarbeiterId);
      }

      if (!hatE && einsatzHeute.length > 1) {
        const e1 = einsatzHeute[1];
        if (e1.schicht === 'F') {
          const cur = stundenProMitarbeiter.get(e1.mitarbeiterId) || 0;
          stundenProMitarbeiter.set(e1.mitarbeiterId, cur + stundenProDienst);
        }
        e1.schicht = 'E';
        dienstAbdeckung[datum].E.push(e1.mitarbeiterId);
      }

      plan.push({ datum, einsatz: einsatzHeute });
    }

    // ==================================================
    // PHASE 2: Stunden-Kürzung pro Mitarbeiter
    // ==================================================
    const minWorkersProSchicht = 1;

    for (const m of mitarbeiter) {
      const id   = m.id;
      const ziel = monatsstunden * getFaktorFuerMitarbeiter(m);
      let hours  = stundenProMitarbeiter.get(id) || 0;

      while (hours > ziel) {
        const kandidaten = [];

        for (const tag of plan) {
          const idx = tag.einsatz.findIndex(
            e => e.mitarbeiterId === id && (e.schicht === 'A' || e.schicht === 'E')
          );
          if (idx === -1) continue;

          const schicht = tag.einsatz[idx].schicht;
          const abdeckung = dienstAbdeckung[tag.datum][schicht];

          // nie letzte A/E-Schicht des Tages löschen
          if (!abdeckung || abdeckung.length <= minWorkersProSchicht) continue;

          kandidaten.push({ tag, idx, schicht });
        }

        if (kandidaten.length === 0) break;

        const { tag, idx, schicht } =
          kandidaten[Math.floor(Math.random() * kandidaten.length)];

        // Dienst auf F setzen
        tag.einsatz[idx].schicht = 'F';
        dienstAbdeckung[tag.datum][schicht] =
          dienstAbdeckung[tag.datum][schicht].filter(mid => mid !== id);

        hours -= stundenProDienst;
        stundenProMitarbeiter.set(id, Math.max(0, hours));
      }
    }

    // ==================================================
    // PHASE 3: Endkontrolle – A/E trotzdem pro Tag
    // ==================================================
    for (const tag of plan) {
      let hatA = tag.einsatz.some(e => e.schicht === 'A');
      let hatE = tag.einsatz.some(e => e.schicht === 'E');

      if (!hatA && tag.einsatz.length > 0) {
        const e0 = tag.einsatz[0];
        if (e0.schicht === 'F') {
          const cur = stundenProMitarbeiter.get(e0.mitarbeiterId) || 0;
          stundenProMitarbeiter.set(e0.mitarbeiterId, cur + stundenProDienst);
        }
        e0.schicht = 'A';
      }

      if (!hatE && tag.einsatz.length > 1) {
        const e1 = tag.einsatz[1];
        if (e1.schicht === 'F') {
          const cur = stundenProMitarbeiter.get(e1.mitarbeiterId) || 0;
          stundenProMitarbeiter.set(e1.mitarbeiterId, cur + stundenProDienst);
        }
        e1.schicht = 'E';
      }
    }

    
    for (const m of mitarbeiter) {
      await mitarbeiterRepo.updateCounter(m.id, m.counter);
    }

    // Ergebnis für diese Filiale einsammeln
    resultFilialen.push({
      filiale: {
        id: filiale.id,
        standort: filiale.filialname || filiale.ort || "Unbekannt",
        farbe: filiale.farbe
      },
      arbeitstage: dates.length,
      plan,
      springer: [],
      offeneDienste: [],
      stundenProMitarbeiter: Object.fromEntries(stundenProMitarbeiter)
    });
  }
  

  // Gesamter Monatsplan
  return {
    jahr,
    monat,
    tageImMonat: dates.length,
    monatsstunden,
    filialen: resultFilialen
  };
}

module.exports = { generateDienstplan };
