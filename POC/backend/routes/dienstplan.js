// routes/dienstplan.js
// REST-Endpunkte rund um den Dienstplan (Generierung, Schichtänderungen, Krank/Urlaub, Ersatz)

const express = require('express');
const router = express.Router();

const { readJson, writeJson }   = require('../functions/fileStore');
const { generateDienstplan }    = require('../functions/dienstplanGenerator');


// ---------------------------------------------------------------------------
// Hilfsfunktion: Pfad zur Dienstplan-Datei für ein bestimmtes Jahr/Monat
// ---------------------------------------------------------------------------
function dienstplanStoreName(jahr, monat) {
  return `dienstplaene/dienstplan_${jahr}_${String(monat).padStart(2, '0')}.json`;
}


// ---------------------------------------------------------------------------
// GET /api/dienstplan?jahr=YYYY&monat=MM[&force=1]
//  - Lädt existierenden Plan aus JSON
//  - oder generiert einen neuen (bei force=1 oder wenn Datei fehlt)
// ---------------------------------------------------------------------------
router.get('/', async (req, res) => {
  const jahr  = Number(req.query.jahr);
  const monat = Number(req.query.monat);
  const force = req.query.force === '1';

  if (!jahr || !monat) {
    return res.status(400).json({ error: 'jahr und monat sind Pflicht' });
  }

  const storeName = dienstplanStoreName(jahr, monat);

  try {
    // 1) Versuchen, bestehenden Plan zu laden (wenn nicht force)
    if (!force) {
      const existingPlan = await readJson(storeName);
      // readJson gibt [] zurück, wenn Datei nicht existiert -> das ignorieren wir
      if (existingPlan &&
          typeof existingPlan === 'object' &&
          Array.isArray(existingPlan.filialen)) {
        return res.json(existingPlan);
      }
    }

    // 2) Neu generieren
    const neuerPlan = await generateDienstplan(jahr, monat);

    // 3) Speichern
    await writeJson(storeName, neuerPlan);

    return res.json(neuerPlan);

  } catch (err) {
    console.error('Dienstplan Fehler:', err);
    res.status(500).json({ error: 'Fehler beim Erzeugen oder Lesen des Dienstplans' });
  }
});


// ---------------------------------------------------------------------------
// PATCH /api/dienstplan/shift
//  - Schiebt einen Dienst auf einen anderen Mitarbeiter
//  - oder setzt ihn auf F (frei)
//  - kümmert sich um StundenProMitarbeiter in der Heimatfiliale
//
// Body:
// {
//   jahr,
//   monat,
//   dienstId,
//   neuerMitarbeiterId: number | null,
//   neueSchicht: 'A'|'E'|'F'|'U'|'K' | undefined
// }
// ---------------------------------------------------------------------------
router.patch('/shift', async (req, res) => {
  const { jahr, monat, dienstId, neuerMitarbeiterId, neueSchicht } = req.body || {};

  const year  = Number(jahr);
  const month = Number(monat);

  if (!year || !month || !dienstId) {
    return res.status(400).json({ error: 'jahr, monat und dienstId sind Pflicht' });
  }

  const storeName = dienstplanStoreName(year, month);

  try {
    const planData = await readJson(storeName);

    if (!planData || !Array.isArray(planData.filialen)) {
      return res.status(404).json({ error: 'Dienstplan für dieses Monat nicht gefunden' });
    }

    // Hilfsfunktion: Stunden-Map für eine Heimatfiliale holen
    function getStundenMapForHeimat(heimatFilialeId) {
      if (!heimatFilialeId) return null;
      const block = planData.filialen.find(
        fb => fb.filiale && Number(fb.filiale.id) === Number(heimatFilialeId)
      );
      if (!block) return null;
      if (!block.stundenProMitarbeiter) {
        block.stundenProMitarbeiter = {};
      }
      return block.stundenProMitarbeiter;
    }

    // ---------------- Dienst anhand dienstId suchen ----------------
    let found = null;

    for (const filialeBlock of planData.filialen) {
      for (const tag of filialeBlock.plan || []) {
        const idx = (tag.einsatz || []).findIndex(e => e.dienstId === dienstId);
        if (idx !== -1) {
          found = { filialeBlock, tag, idx };
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      return res.status(404).json({ error: 'Dienst mit dieser dienstId nicht gefunden' });
    }

    const { filialeBlock, tag, idx } = found;
    const einsatz = tag.einsatz[idx];

    const alterMitarbeiterId = einsatz.mitarbeiterId;
    const alteSchicht        = einsatz.schicht;
    const alteHeimatId       = einsatz.hauptfilialeId; // vor Änderung merken

    const istArbeitsDienst = sch => ['A', 'E', 'U', 'K'].includes(sch);

    const alteStunden = istArbeitsDienst(alteSchicht) ? 9 : 0;
    const zielSchicht = neueSchicht ?? alteSchicht;
    const neueStunden = istArbeitsDienst(zielSchicht) ? 9 : 0;

    // 1) Stunden beim ALTEN Mitarbeiter in seiner HEIMATFILIALE abziehen
    if (alteStunden > 0 && alterMitarbeiterId != null && alteHeimatId != null) {
      const altMap = getStundenMapForHeimat(alteHeimatId);
      if (altMap) {
        altMap[alterMitarbeiterId] = (altMap[alterMitarbeiterId] || 0) - alteStunden;
        if (altMap[alterMitarbeiterId] < 0) altMap[alterMitarbeiterId] = 0;
      }
    }

    // 2) Dienst auf FREI setzen -> keine neuen Stunden
    if (neuerMitarbeiterId === null || neuerMitarbeiterId === undefined) {
      einsatz.schicht = 'F';
      // mitarbeiterId / hauptfilialeId lassen wir, sind bei F nur für Anzeige relevant

    } else {
      // 3) Dienst auf anderen (oder gleichen) Mitarbeiter umhängen
      const alleMitarbeiter = await readJson('mitarbeiter.json');
      const neuerMitarbeiter = alleMitarbeiter.find(
        m => Number(m.id) === Number(neuerMitarbeiterId)
      );

      if (!neuerMitarbeiter) {
        return res.status(400).json({ error: 'neuerMitarbeiterId existiert nicht' });
      }

      const neueHeimatId = neuerMitarbeiter.hauptfilialeId;

      einsatz.mitarbeiterId  = neuerMitarbeiter.id;
      einsatz.vorname        = neuerMitarbeiter.vorname;
      einsatz.nachname       = neuerMitarbeiter.nachname;
      einsatz.hauptfilialeId = neueHeimatId;
      einsatz.schicht        = zielSchicht;

      // Stunden beim NEUEN Mitarbeiter in seiner HEIMATFILIALE dazuzählen
      if (neueStunden > 0 && neueHeimatId != null) {
        const neuMap = getStundenMapForHeimat(neueHeimatId);
        if (neuMap) {
          neuMap[neuerMitarbeiter.id] =
            (neuMap[neuerMitarbeiter.id] || 0) + neueStunden;
        }
      }
    }

    await writeJson(storeName, planData);
    res.json(planData);

  } catch (err) {
    console.error('Fehler beim Aktualisieren eines Dienstes:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Dienstes' });
  }
});


// ---------------------------------------------------------------------------
// POST /api/dienstplan/krank-mit-ersatz
//  - setzt einen A/E-Dienst auf K oder U
//  - optional mit zusätzlichem Ersatz-Mitarbeiter (zweiter Einsatz)
//  - Stunden beim Ersatz in seiner Heimatfiliale werden angerechnet
//
// Body:
// {
//   jahr,
//   monat,
//   dienstId,
//   ersatzMitarbeiterId?: number,
//   art: 'K' | 'U'
// }
// ---------------------------------------------------------------------------
router.post('/krank-mit-ersatz', async (req, res) => {
  const { jahr, monat, dienstId, ersatzMitarbeiterId, art } = req.body || {};
  // art: 'K' oder 'U'

  const year  = Number(jahr);
  const month = Number(monat);

  if (!year || !month || !dienstId || !art || !['K', 'U'].includes(art)) {
    return res.status(400).json({ error: 'jahr, monat, dienstId und art (K/U) sind Pflicht' });
  }

  const storeName = dienstplanStoreName(year, month);

  try {
    const planData = await readJson(storeName);

    if (!planData || !Array.isArray(planData.filialen)) {
      return res.status(404).json({ error: 'Dienstplan für dieses Monat nicht gefunden' });
    }

    // Hilfsfunktion: Stunden-Map für Heimatfiliale holen
    function getStundenMapForHeimat(heimatFilialeId) {
      if (!heimatFilialeId) return null;
      const block = planData.filialen.find(
        fb => fb.filiale && Number(fb.filiale.id) === Number(heimatFilialeId)
      );
      if (!block) return null;
      if (!block.stundenProMitarbeiter) {
        block.stundenProMitarbeiter = {};
      }
      return block.stundenProMitarbeiter;
    }

    // ---------------- Dienst suchen ----------------
    let found = null;

    for (const filialeBlock of planData.filialen) {
      for (const tag of filialeBlock.plan || []) {
        const idx = (tag.einsatz || []).findIndex(e => e.dienstId === dienstId);
        if (idx !== -1) {
          found = { filialeBlock, tag, idx };
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      return res.status(404).json({ error: 'Dienst mit dieser dienstId nicht gefunden' });
    }

    const { filialeBlock, tag, idx } = found;
    const einsatz = tag.einsatz[idx];

    const alteSchicht = einsatz.schicht;

    // Nur sinnvoll, wenn das ein Arbeitsdienst ist
    if (!['A', 'E'].includes(alteSchicht)) {
      return res.status(400).json({ error: 'Krank/Urlaub mit Ersatz gilt nur für A/E-Dienste' });
    }

    // 2) Abdeckung prüfen: gibt es außer diesem MA noch jemanden mit derselben Schicht A/E?
    const andereMitGleicherSchicht = (tag.einsatz || []).filter(e =>
      e !== einsatz &&
      e.schicht === alteSchicht &&
      e.filialeId === einsatz.filialeId      // gleiche Filiale
    );

    const abdeckungIstTrotzdemOK = andereMitGleicherSchicht.length >= 1;

    // 3) Wenn Abdeckung NICHT ok und kein Ersatz angegeben -> Fehler
    if (!abdeckungIstTrotzdemOK && !ersatzMitarbeiterId) {
      return res.status(400).json({
        error: 'Für diesen Dienst wird ein Ersatz benötigt, sonst ist die Schicht unbesetzt.'
      });
    }

    // 4) Original-Mitarbeiter auf K/U setzen
    einsatz.schicht = art;     // 'K' oder 'U'
    // Stunden ändern sich nicht: A/E und K/U zählen alle als 9h

    // 5) Wenn Abdeckung okay ODER kein Ersatz gewünscht -> fertig
    if (!ersatzMitarbeiterId) {
      await writeJson(storeName, planData);
      return res.json(planData);
    }

    // 6) Ersatz-Mitarbeiter eintragen (zusätzlicher Einsatz an diesem Tag)
    const alleMitarbeiter = await readJson('mitarbeiter.json');
    const ersatz = alleMitarbeiter.find(m => m.id === Number(ersatzMitarbeiterId));

    if (!ersatz) {
      return res.status(400).json({ error: 'ersatzMitarbeiterId existiert nicht' });
    }

    // neuen Einsatz für den Ersatz anlegen
    const neueDienstId = `${einsatz.filialeId}-${tag.datum}-${alteSchicht}-${ersatz.id}`;

    const neuerEinsatz = {
      dienstId:       neueDienstId,
      mitarbeiterId:  ersatz.id,
      vorname:        ersatz.vorname,
      nachname:       ersatz.nachname,
      schicht:        alteSchicht,              // A oder E wie vorher
      farbe:          einsatz.farbe,           // Filialfarbe
      filialeId:      einsatz.filialeId,
      hauptfilialeId: ersatz.hauptfilialeId,
      istErsatz:      true                     // Marker (optional)
    };

    tag.einsatz.push(neuerEinsatz);

    // 7) Stunden beim Ersatz-MA in seiner Heimatfiliale erhöhen
    const stundenMapErsatz = getStundenMapForHeimat(ersatz.hauptfilialeId);
    if (stundenMapErsatz) {
      const STUNDEN_PRO_DIENST = 9;  // im Generator auch so
      stundenMapErsatz[ersatz.id] =
        (stundenMapErsatz[ersatz.id] || 0) + STUNDEN_PRO_DIENST;
    }

    // 8) Speichern & Plan zurückgeben
    await writeJson(storeName, planData);
    res.json(planData);

  } catch (err) {
    console.error('Fehler bei /krank-mit-ersatz:', err);
    res.status(500).json({ error: 'Fehler beim Setzen von Krank/Urlaub mit Ersatz' });
  }
});


// ---------------------------------------------------------------------------
// GET /api/dienstplan/check-ersatz?jahr=YYYY&monat=MM&dienstId=...
//  - prüft, ob eine Schicht A/E nur von genau 1 Mitarbeiter besetzt ist
//  - Antwort: { ersatzNoetig: boolean, datum, schicht, anzahl }
// ---------------------------------------------------------------------------
router.get('/check-ersatz', async (req, res) => {
  const jahr     = Number(req.query.jahr);
  const monat    = Number(req.query.monat);
  const dienstId = req.query.dienstId;

  if (!jahr || !monat || !dienstId) {
    return res.status(400).json({ error: 'jahr, monat und dienstId sind Pflicht' });
  }

  const storeName = dienstplanStoreName(jahr, monat);

  try {
    const planData = await readJson(storeName);

    if (!planData || !Array.isArray(planData.filialen)) {
      return res.status(404).json({ error: 'Dienstplan für dieses Monat nicht gefunden' });
    }

    // Dienst suchen
    let found = null;

    for (const filialeBlock of planData.filialen) {
      for (const tag of filialeBlock.plan || []) {
        const idx = (tag.einsatz || []).findIndex(e => e.dienstId === dienstId);
        if (idx !== -1) {
          found = { filialeBlock, tag, idx };
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      return res.status(404).json({ error: 'Dienst mit dieser dienstId nicht gefunden' });
    }

    const { filialeBlock, tag, idx } = found;
    const einsatz = tag.einsatz[idx];

    const schicht = einsatz.schicht;

    // Nur A/E sind "arbeitsrelevante" Dienste für die Abdeckung
    if (schicht !== 'A' && schicht !== 'E') {
      return res.json({
        ersatzNoetig: false,
        grund: 'Kein A/E-Dienst, daher keine Mindestabdeckung geprüft.'
      });
    }

    const datum = tag.datum;

    // alle Einsätze an diesem Tag in dieser Filiale
    const alleHeute = (filialeBlock.plan || [])
      .find(t => t.datum === datum)?.einsatz || [];

    // Anzahl MA, die dieselbe Schicht (A oder E) haben
    const arbeiter = alleHeute.filter(e =>
      e.schicht === schicht &&
      e.mitarbeiterId != null
    );

    const anzahl       = arbeiter.length;
    const ersatzNoetig = (anzahl <= 1);  // nur 1 Person -> ohne Ersatz wäre Schicht leer

    return res.json({
      ersatzNoetig,
      datum,
      schicht,
      anzahl
    });

  } catch (err) {
    console.error('Fehler bei /dienstplan/check-ersatz:', err);
    res.status(500).json({ error: 'Fehler beim Prüfen der Ersatznotwendigkeit' });
  }
});


module.exports = router;
