// backend/routes/dienstplan.routes.js
// ============================================================================
// 📅 Dienstplan-Routen (DB-Version, Schema B)
// ============================================================================

const express = require('express');
const router = express.Router();

const dienstplanRepo   = require('../repositories/dienstplan.repo.pg');
const { generateDienstplan } = require('../functions/dienstplanGenerator');
const mitarbeiterRepo  = require('../repositories/mitarbeiter.repo.pg');

// -------------------------------------------------------------
// Hilfsfunktionen
// -------------------------------------------------------------
async function loadPlan(jahr, monat) {
  const row = await dienstplanRepo.getByDate(jahr, monat);
  return row ? row.plan_data : null;
}

async function savePlan(jahr, monat, plan) {
  await dienstplanRepo.save(jahr, monat, plan);
}

// ============================================================================
// GET /api/dienstplan?jahr=2025&monat=5&force=1   (von dir aktuell nicht benutzt)
// ============================================================================
router.get('/', async (req, res) => {
  const jahr  = Number(req.query.jahr);
  const monat = Number(req.query.monat);
  const force = Number(req.query.force || 0);

  if (!jahr || !monat) {
    return res.status(400).json({ error: 'jahr und monat Pflicht.' });
  }

  try {
    // Force → immer neu erzeugen
    if (force === 1) {
      const plan = await generateDienstplan(jahr, monat);
      await savePlan(jahr, monat, plan);
      return res.json(plan);
    }

    // aus DB
    let plan = await loadPlan(jahr, monat);

    // falls noch keiner existiert → neu erzeugen
    if (!plan) {
      plan = await generateDienstplan(jahr, monat);
      await savePlan(jahr, monat, plan);
    }

    if (!plan.jahr)  plan.jahr  = jahr;
    if (!plan.monat) plan.monat = monat;

    res.json(plan);
  } catch (err) {
    console.error('GET /dienstplan', err);
    res.status(500).json({ error: 'Fehler beim Laden/Erzeugen.' });
  }
});

// ============================================================================
// POST /api/dienstplan/generate   (Button "neu generieren")
// Body: { jahr, monat }
// ============================================================================
router.post('/generate', async (req, res) => {
  const { jahr, monat } = req.body;

  if (!jahr || !monat) {
    return res.status(400).json({ error: 'jahr und monat Pflicht.' });
  }

  try {
    const j = Number(jahr);
    const m = Number(monat);

    const plan = await generateDienstplan(j, m);
    await savePlan(j, m, plan);

    res.json(plan); // direkt der Plan fürs Frontend
  } catch (err) {
    console.error('POST /dienstplan/generate', err);
    res.status(500).json({ error: 'Fehler beim Generieren.' });
  }
});

// ============================================================================
// GET /api/dienstplan/:jahr/:monat   (Button "Dienstplan laden")
// ============================================================================
router.get('/:jahr/:monat', async (req, res) => {
  const jahr  = Number(req.params.jahr);
  const monat = Number(req.params.monat);

  if (!jahr || !monat) {
    return res.status(400).json({ error: 'jahr und monat Pflicht.' });
  }

  try {
    const row = await dienstplanRepo.getByDate(jahr, monat);
    if (!row) {
      return res.status(404).json({ error: 'Kein Plan gefunden.' });
    }

    const plan = row.plan_data || {};

    if (!plan.jahr)  plan.jahr  = jahr;
    if (!plan.monat) plan.monat = monat;

    res.json(plan);
  } catch (err) {
    console.error('GET /dienstplan/:jahr/:monat', err);
    res.status(500).json({ error: 'Fehler beim Laden.' });
  }
});

// ============================================================================
// PATCH /api/dienstplan/shift
// Body: { jahr, monat, dienstId, neuerMitarbeiterId, neueSchicht }
// ============================================================================
router.patch('/shift', async (req, res) => {
  try {
    const { jahr, monat, dienstId, neuerMitarbeiterId, neueSchicht } = req.body;

    const year  = Number(jahr);
    const month = Number(monat);

    if (!year || !month || !dienstId) {
      return res.status(400).json({ error: 'jahr, monat und dienstId sind Pflicht' });
    }

    // 1) Plan + Mitarbeiter laden
    const row = await dienstplanRepo.getByDate(year, month);
    if (!row || !row.plan_data) {
      return res.status(404).json({ error: 'Dienstplan nicht gefunden' });
    }

    const planData = row.plan_data;
    if (!Array.isArray(planData.filialen)) {
      return res.status(500).json({ error: 'Dienstplan-Daten beschädigt' });
    }

    const alleMA = await mitarbeiterRepo.getAll();

    // 2) Dienst suchen
    let gefunden = null;

    for (const filialeBlock of planData.filialen) {
      for (const tag of filialeBlock.plan || []) {
        const idx = (tag.einsatz || []).findIndex(e => e.dienstId === dienstId);
        if (idx !== -1) {
          gefunden = { filialeBlock, tag, idx };
          break;
        }
      }
      if (gefunden) break;
    }

    if (!gefunden) {
      return res.status(404).json({ error: 'Dienst nicht gefunden' });
    }

    const { filialeBlock, tag, idx } = gefunden;
    const einsatz = tag.einsatz[idx];

    const alterMA      = einsatz.mitarbeiterId;
    const alteSchicht  = einsatz.schicht;
    const alteHeimatId = einsatz.hauptfilialeId;

    const istArbeitsdienst = s => ['A', 'E', 'U', 'K'].includes(s);
    const STUNDEN_PRO_DIENST = 9;

    const alteStunden = istArbeitsdienst(alteSchicht) ? STUNDEN_PRO_DIENST : 0;
    const neueStunden = istArbeitsdienst(neueSchicht) ? STUNDEN_PRO_DIENST : 0;

    // 3) Stunden beim alten MA abziehen (in seiner Heimatfiliale)
    if (alterMA != null && alteHeimatId != null && alteStunden > 0) {
      const heimatBlock = planData.filialen.find(
        b => Number(b.filiale.id) === Number(alteHeimatId)
      );
      if (heimatBlock) {
        if (!heimatBlock.stundenProMitarbeiter) {
          heimatBlock.stundenProMitarbeiter = {};
        }
        heimatBlock.stundenProMitarbeiter[alterMA] =
          (heimatBlock.stundenProMitarbeiter[alterMA] || 0) - alteStunden;

        if (heimatBlock.stundenProMitarbeiter[alterMA] < 0) {
          heimatBlock.stundenProMitarbeiter[alterMA] = 0;
        }
      }
    }

    // 4) Fall "Frei" → Dienst leeren
    if (neuerMitarbeiterId == null) {
      einsatz.schicht       = 'F';
      einsatz.mitarbeiterId = null;

      await dienstplanRepo.updatePlan(year, month, planData);
      return res.json(planData);
    }

    // 5) neuen Mitarbeiter holen
    const neuerMA = alleMA.find(
      m => Number(m.id) === Number(neuerMitarbeiterId)
    );
    if (!neuerMA) {
      return res.status(400).json({ error: 'Neuer Mitarbeiter existiert nicht' });
    }

    const neueHeimatId = neuerMA.hauptfilialeid;

    // 6) Stunden beim neuen MA in seiner Heimatfiliale erhöhen
    if (neueHeimatId != null && neueStunden > 0) {
      const blockNeu = planData.filialen.find(
        b => Number(b.filiale.id) === Number(neueHeimatId)
      );
      if (blockNeu) {
        if (!blockNeu.stundenProMitarbeiter) {
          blockNeu.stundenProMitarbeiter = {};
        }
        blockNeu.stundenProMitarbeiter[neuerMA.id] =
          (blockNeu.stundenProMitarbeiter[neuerMA.id] || 0) + neueStunden;
      }
    }

    // 7) Einsatz aktualisieren
    einsatz.mitarbeiterId  = neuerMA.id;
    einsatz.vorname        = neuerMA.vorname;
    einsatz.nachname       = neuerMA.nachname;
    einsatz.hauptfilialeId = neueHeimatId;
    einsatz.schicht        = neueSchicht;

    // neue dienstId
    const filId = einsatz.filialeId;
    einsatz.dienstId = `${filId}-${tag.datum}-${neueSchicht}-${neuerMA.id}`;

    // 8) speichern
    await dienstplanRepo.updatePlan(year, month, planData);
    res.json(planData);

  } catch (err) {
    console.error('Fehler PATCH /shift:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Dienstes' });
  }
});

// ============================================================================
// POST /api/dienstplan/krank-mit-ersatz
// Body: { jahr, monat, dienstId, ersatzMitarbeiterId, art ('K'|'U') }
// → hier können wir später noch feinjustieren, aktuell lasse ich deinen alten
//   einfachen Stand so wie er war, nur mit savePlan(loadPlan)
// ============================================================================
router.post('/krank-mit-ersatz', async (req, res) => {
  try {
    const { jahr, monat, dienstId, ersatzMitarbeiterId, art } = req.body;

    if (!jahr || !monat || !dienstId || !ersatzMitarbeiterId || !['K','U'].includes(art)) {
      return res.status(400).json({ error: "Pflichtfelder fehlen." });
    }

    const year  = Number(jahr);
    const month = Number(monat);

    // 1) Plan laden
    const row = await dienstplanRepo.getByDate(year, month);
    if (!row || !row.plan_data || !Array.isArray(row.plan_data.filialen)) {
      return res.status(404).json({ error: "Dienstplan nicht gefunden oder beschädigt." });
    }

    const plan = row.plan_data;

    // 2) Mitarbeiter laden
    const alleMA = await mitarbeiterRepo.getAll();

    // 3) Schicht suchen
    let altBlock = null;
    let altTag = null;
    let altIdx = -1;

    for (const fb of plan.filialen) {
      for (const tag of fb.plan) {
        const idx = tag.einsatz.findIndex(e => e.dienstId === dienstId);
        if (idx !== -1) {
          altBlock = fb;
          altTag = tag;
          altIdx = idx;
          break;
        }
      }
      if (altIdx !== -1) break;
    }

    if (altIdx === -1)
      return res.status(404).json({ error: "Dienst nicht gefunden." });

    const altEinsatz = altTag.einsatz[altIdx];

    const originalSchicht = altEinsatz.schicht;
    const originalMA = altEinsatz.mitarbeiterId;
    const originalHeimat = altEinsatz.hauptfilialeId;

    const STUNDEN = s => ['A','E','U','K'].includes(s) ? 9 : 0;

    // 4) Stunden alten MA zurücknehmen
    if (originalMA && originalHeimat) {
      const block = plan.filialen.find(b => b.filiale.id === originalHeimat);
      if (block) {
        block.stundenProMitarbeiter[originalMA] =
          (block.stundenProMitarbeiter[originalMA] || 0) - STUNDEN(originalSchicht);

        if (block.stundenProMitarbeiter[originalMA] < 0)
          block.stundenProMitarbeiter[originalMA] = 0;
      }
    }

    // 5) alten Einsatz auf Krank/U setzen
    altEinsatz.schicht = art;

    // Achtung: Ein Krank/Urlaub-Tag zählt als arbeitsfrei (0 Stunden)
    // → passt.

    // 6) Ersatz-MA Daten holen
    const ersatzMA = alleMA.find(m => Number(m.id) === Number(ersatzMitarbeiterId));
    if (!ersatzMA) return res.status(400).json({ error: "Ersatzmitarbeiter existiert nicht." });

    const ersatzHeimat = ersatzMA.hauptfilialeid;

    // 7) Stunden Ersatz-MA addieren
    const ersatzBlock = plan.filialen.find(b => b.filiale.id === ersatzHeimat);
    if (ersatzBlock) {
      ersatzBlock.stundenProMitarbeiter[ersatzMA.id] =
        (ersatzBlock.stundenProMitarbeiter[ersatzMA.id] || 0) + STUNDEN(originalSchicht);
    }

    // 8) Neuen Einsatz hinzufügen
    const filialeId = altEinsatz.filialeId;
    const datum = altTag.datum;

    const neuerDienstId = `${filialeId}-${datum}-${originalSchicht}-${ersatzMA.id}`;

    const neuerEinsatz = {
      dienstId: neuerDienstId,
      mitarbeiterId: ersatzMA.id,
      vorname: ersatzMA.vorname,
      nachname: ersatzMA.nachname,
      hauptfilialeId: ersatzHeimat,
      filialeId: filialeId,
      schicht: originalSchicht
    };

    altTag.einsatz.push(neuerEinsatz);

    // 9) speichern
    await dienstplanRepo.updatePlan(year, month, plan);

    res.json(plan);

  } catch (err) {
    console.error("Fehler POST /dienstplan/krank-mit-ersatz:", err);
    res.status(500).json({ error: "Fehler bei Krank/Urlaub mit Ersatz." });
  }
});

// ============================================================================
// DELETE /api/dienstplan/:jahr/:monat
// ============================================================================
router.delete('/:jahr/:monat', async (req, res) => {
  const jahr  = Number(req.params.jahr);
  const monat = Number(req.params.monat);

  try {
    const ok = await dienstplanRepo.remove(jahr, monat);
    if (!ok) return res.status(404).json({ error: "Kein Plan gefunden." });
    res.json({ message: "Dienstplan gelöscht." });
  } catch (err) {
    console.error("DELETE /dienstplan", err);
    res.status(500).json({ error: "Fehler beim Löschen." });
  }
});


// ============================================================================
// GET /api/dienstplan/check-ersatz
// prüft, ob eine A/E-Schicht nur 1x besetzt ist
// -> { ersatzNoetig: boolean, datum, schicht, anzahl }
// ============================================================================
router.get('/check-ersatz', async (req, res) => {
  try {
    const jahr = Number(req.query.jahr);
    const monat = Number(req.query.monat);
    const dienstId = req.query.dienstId;

    if (!jahr || !monat || !dienstId) {
      return res.status(400).json({ error: 'jahr, monat und dienstId sind Pflicht' });
    }

    // Plan laden
    const row = await dienstplanRepo.getByDate(jahr, monat);
    if (!row || !row.plan_data || !row.plan_data.filialen) {
      return res.status(404).json({ error: 'Dienstplan nicht gefunden oder beschädigt' });
    }

    const plan = row.plan_data;

    // Dienst suchen
    let found = null;

    for (const filialeBlock of plan.filialen) {
      for (const tag of filialeBlock.plan) {
        const idx = tag.einsatz.findIndex(e => e.dienstId === dienstId);
        if (idx !== -1) {
          found = { filialeBlock, tag, idx };
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      return res.status(404).json({ error: 'Dienst nicht gefunden' });
    }

    const { tag, idx } = found;
    const einsatz = tag.einsatz[idx];

    const schicht = einsatz.schicht;
    const datum = tag.datum;

    // nur A/E relevant
    if (!['A', 'E'].includes(schicht)) {
      return res.json({
        ersatzNoetig: false,
        grund: 'Kein A/E-Dienst'
      });
    }

    // Wie viele MA haben diese Schicht an dem Tag?
    const alleHeute = tag.einsatz || [];
    const anzahl = alleHeute.filter(e => e.schicht === schicht).length;

    return res.json({
      ersatzNoetig: anzahl <= 1,
      datum,
      schicht,
      anzahl
    });

  } catch (err) {
    console.error("GET /check-ersatz:", err);
    res.status(500).json({ error: 'Fehler bei der Ersatzprüfung' });
  }
});


module.exports = router;
