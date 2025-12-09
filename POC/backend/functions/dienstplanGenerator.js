// ============================================================================
// 🧩 dienstplanGenerator.js
// ---------------------------------------------------------------------------
// Hauptmodul zur automatischen Generierung des Dienstplans.
// Enthält die gesamte Logik für:
//   - Tages- und Mitarbeiterverteilung
//   - Arbeitszeitbegrenzungen (20/30/40h)
//   - Muster (Pattern) basierend auf Algorithmus
//   - Stundenkorrektur & Verteilung
// ============================================================================

const { readJson, writeJson } = require('./fileStore');
const { getAllDatesOfMonth, getMonthlyHours } = require('./dateUtils');
const { setCounterForMitarbeiter } = require('./setCounter');


// ============================================================================
// 🔹 generateDienstplan(year, month)
// ---------------------------------------------------------------------------
// Hauptfunktion, die den Plan für alle Filialen eines Monats generiert.
//
// Features:
// ✅ Berücksichtigt Hauptfilialen
// ✅ Verwendet pro Filiale einen Algorithmus (Pattern A/E/F)
// ✅ Mitarbeiter haben individuelle Counter (rotierende Startpunkte)
// ✅ Unterstützt 20h-, 30h- und 40h-Kräfte
// ✅ Kürzt Stunden nachträglich, um Zielstunden zu treffen
// ============================================================================
async function generateDienstplan(year, month) {
  const jahr  = Number(year);
  const monat = Number(month);

  // Monatsstunden für Vollzeit (z. B. ~160h)
  const { monatsstunden } = getMonthlyHours(jahr, monat);

  // Stammdaten laden
  const filialen    = await readJson('filialen.json');
  const algorithmen = await readJson('algorithmen.json');

  if (!Array.isArray(filialen) || filialen.length === 0) {
    return {
      jahr,
      monat,
      tageImMonat: 0,
      filialen: [],
      info: 'Keine Filialen vorhanden'
    };
  }

  // Counter initialisieren – sorgt für versetzte Startpunkte im Muster
  for (const filiale of filialen) {
    await setCounterForMitarbeiter(filiale.id);
  }

  // Mitarbeiter neu laden (mit aktualisierten Countern)
  const alleMitarbeiter = await readJson('mitarbeiter.json');

  // Alle Tage des Monats berechnen (nur Arbeitstage)
  const dates = getAllDatesOfMonth(jahr, monat);
  const resultFilialen = [];

  // ==================================================
  // PLAN PRO FILIALE ERZEUGEN
  // ==================================================
  for (const filiale of filialen) {
    const algorithm = algorithmen.find(a => a.id === filiale.algorithmId);

    if (!algorithm) {
      resultFilialen.push({
        filiale: { id: filiale.id, standort: filiale.standort, farbe: filiale.farbe },
        arbeitstage: dates.length,
        plan: [],
        error: 'Kein Algorithmus gefunden'
      });
      continue;
    }

    // Sicherheits-Check für Algorithmus-Pattern
    const defaultPattern = algorithm.algorythmus || algorithm.pattern;
    if (!Array.isArray(defaultPattern) || defaultPattern.length === 0) {
      resultFilialen.push({
        filiale: { id: filiale.id, standort: filiale.standort, farbe: filiale.farbe },
        arbeitstage: dates.length,
        plan: [],
        error: 'Ungültiges Pattern für diese Filiale'
      });
      continue;
    }

    const stundenProDienst = Number(algorithm.stunden) || 9;

    // Mitarbeiter dieser Filiale (Hauptfiliale)
    const mitarbeiter = alleMitarbeiter.filter(m => m.hauptfilialeId === filiale.id);

    // Stunden-Tracking
    const stundenProMitarbeiter = new Map();
    mitarbeiter.forEach(m => stundenProMitarbeiter.set(m.id, 0));

    // Tagesstruktur (A/E/F)
    const dienstAbdeckung = {};
    for (const d of dates) {
      dienstAbdeckung[d] = { A: [], E: [], F: [] };
    }

    const plan = [];

    // ==================================================
    // TAGE-LOOP – GRUNDPLAN ERZEUGEN
    // ==================================================
    for (const datum of dates) {
      const einsatzHeute = [];

      for (const m of mitarbeiter) {
        if (m.counter == null) m.counter = 0;

        // 20h = 0.5 | 30h = 0.75 | 40h = 1.0
        const faktor        = getFaktorFuerMitarbeiter(m);
        const zielStunden   = monatsstunden * faktor;
        const limitStunden  = zielStunden + 20; // Puffer, damit Monatsende nicht abbricht

        // Algorithmus bestimmen (Springer → eigener Algorithmus)
        const algoIdFuerM =
          m.springer && m.springerAlgorithmId
            ? m.springerAlgorithmId
            : filiale.algorithmId;

        let algoFuerM = algorithmen.find(a => a.id === algoIdFuerM) || algorithm;
        let patternFuerM = algoFuerM.algorythmus || algoFuerM.pattern;
        if (!Array.isArray(patternFuerM) || patternFuerM.length === 0) {
          patternFuerM = ['F']; // Sicherheitsfallback
        }

        // Schicht aus Muster entnehmen
        let schicht = patternFuerM[m.counter % patternFuerM.length];

        // Stundenprüfung
        let bereits = stundenProMitarbeiter.get(m.id) || 0;
        if (schicht !== 'F') {
          if (bereits >= limitStunden) {
            schicht = 'F'; // über Limit → frei
          } else {
            bereits += stundenProDienst;
            stundenProMitarbeiter.set(m.id, bereits);
          }
        }

        // Einsatz speichern
        const eintrag = {
          dienstId: `${filiale.id}-${datum}-${schicht}-${m.id}`,
          mitarbeiterId: m.id,
          vorname: m.vorname,
          nachname: m.nachname,
          schicht,
          farbe: filiale.farbe,
          filialeId: filiale.id,
          hauptfilialeId: m.hauptfilialeId
        };
        einsatzHeute.push(eintrag);

        // Abdeckung zählen
        if (['A', 'E'].includes(schicht)) {
          dienstAbdeckung[datum][schicht].push(m.id);
        }

        // Counter hochzählen
        m.counter = (m.counter + 1) % patternFuerM.length;
      }

      plan.push({ datum, einsatz: einsatzHeute });
    }

    // ==================================================
    // STUNDEN-KÜRZUNG (ÜBERARBEITUNG NACH LIMIT)
    // ==================================================
    const minWorkersProSchicht = 1;

    for (const m of mitarbeiter) {
      const id = m.id;
      const ziel = monatsstunden * getFaktorFuerMitarbeiter(m);
      let hours = stundenProMitarbeiter.get(id) || 0;

      // Kürzen bis Ziel erreicht oder keine Dienste mehr entfernbar
      while (hours > ziel) {
        const kandidaten = [];

        for (const tag of plan) {
          const idx = tag.einsatz.findIndex(e => e.mitarbeiterId === id && e.schicht !== 'F');
          if (idx === -1) continue;

          const eins = tag.einsatz[idx];
          const schicht = eins.schicht;
          if (!['A', 'E'].includes(schicht)) continue;

          const abdeckung = dienstAbdeckung[tag.datum][schicht];
          if (!abdeckung || abdeckung.length <= minWorkersProSchicht) continue;

          kandidaten.push({ tag, idx, schicht });
        }

        if (kandidaten.length === 0) break;

        // Zufällig einen Dienst streichen
        const { tag, idx, schicht } = kandidaten[Math.floor(Math.random() * kandidaten.length)];
        tag.einsatz[idx].schicht = 'F';
        dienstAbdeckung[tag.datum][schicht] =
          dienstAbdeckung[tag.datum][schicht].filter(mid => mid !== id);

        hours -= stundenProDienst;
        stundenProMitarbeiter.set(id, Math.max(0, hours));
      }
    }

    // ==================================================
    // RESULTATE SAMMELN
    // ==================================================
    resultFilialen.push({
      filiale: {
        id: filiale.id,
        standort: filiale.standort,
        farbe: filiale.farbe
      },
      arbeitstage: dates.length,
      plan,
      springer: [],        // optional: später nutzbar
      offeneDienste: [],   // optional: spätere Erweiterung
      stundenProMitarbeiter: Object.fromEntries(stundenProMitarbeiter)
    });
  }

  // Counter speichern (damit im nächsten Monat weitergezählt wird)
  await writeJson('mitarbeiter.json', alleMitarbeiter);

  // Ergebnis-Objekt
  return {
    jahr,
    monat,
    tageImMonat: dates.length,
    monatsstunden,
    filialen: resultFilialen
  };
}


// ============================================================================
// 🔹 getFaktorFuerMitarbeiter(m)
// ---------------------------------------------------------------------------
// Gibt den Faktor für die Sollstunden zurück:
// - arbeitnehmerTyp "20" => 0.5
// - "30" => 0.75
// - sonst => 1.0
// ============================================================================
function getFaktorFuerMitarbeiter(m) {
  const typNum = Number(m.arbeitnehmerTyp ?? 40) || 40;
  return typNum / 40;
}

// ============================================================================
// EXPORT
// ============================================================================
module.exports = { generateDienstplan };
