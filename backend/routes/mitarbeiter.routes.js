const express = require('express');
const router = express.Router();

const mitarbeiterRepo = require('../repositories/mitarbeiter.repo.pg');
const filialenRepo    = require('../repositories/filialen.repo.pg');
const dienstplanRepo  = require('../repositories/dienstplan.repo.pg');

const { setCounterForMitarbeiter } = require('../functions/setCounter');
const { resetCountersForFiliale } = require('../functions/resetCountersForFiliale');


// -----------------------------
// GET: alle Mitarbeiter (inkl. kontakt/telefon/email/nebenfilialen)
// -----------------------------
router.get("/", async (_req, res) => {
  try {
    const data = await mitarbeiterRepo.getAllWithDetails();
    res.json(data);
  } catch (err) {
    console.error("Fehler GET /mitarbeiter:", err);
    res.status(500).json({ error: "Fehler beim Laden der Mitarbeiter" });
  }
});

// -----------------------------
// GET: Mitarbeiter by mnr (inkl. details)
// -----------------------------
router.get("/:mnr", async (req, res) => {
  try {
    const mnr = Number(req.params.mnr);
    if (!Number.isFinite(mnr)) {
      return res.status(400).json({ error: "Ungültige mnr" });
    }

    const ma = await mitarbeiterRepo.getByIdWithDetails(mnr);
    if (!ma) return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });

    res.json(ma);
  } catch (err) {
    console.error("Fehler GET /mitarbeiter/:mnr:", err);
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

// -----------------------------
// POST: Mitarbeiter anlegen (inkl. kontakt/telefon/email/nebenfilialen)
// -----------------------------
router.post("/", async (req, res) => {
  try {
    const b = req.body;

    if (!b.vorname || !b.nachname) {
      return res.status(400).json({ error: "vorname und nachname sind Pflicht" });
    }

    const payload = {
      vorname: b.vorname,
      nachname: b.nachname,
      hauptfiliale_fnr: b.hauptfiliale_fnr ?? null,
      arbeitnehmertyp: b.arbeitnehmertyp ?? 40,
      springer: b.springer ?? false,
      springeralgorithmid: b.springeralgorithmid ?? null,

      kontakt: b.kontakt ?? null,
      telefone: Array.isArray(b.telefone) ? b.telefone : [],
      emails: Array.isArray(b.emails) ? b.emails : [],
      nebenfilialen: Array.isArray(b.nebenfilialen) ? b.nebenfilialen : [],
      // KEIN counter hier. Egal was kommt: wir ignorieren es.
    };

    const created = await mitarbeiterRepo.addWithDetails(payload);

    // Counter nachziehen (nur wenn hauptfiliale gesetzt)
    if (created?.hauptfiliale_fnr) {
      await resetCountersForFiliale(created.hauptfiliale_fnr);
      await setCounterForMitarbeiter(created.hauptfiliale_fnr);
    }

    // optional: nochmal frisch holen, damit counter im Response stimmt
    const fresh = await mitarbeiterRepo.getByIdWithDetails(created.mnr);
    res.status(201).json(fresh);

  } catch (err) {
    console.error("Fehler POST /mitarbeiter:", err);
    res.status(500).json({ error: "Fehler beim Anlegen" });
  }
});


router.put("/:mnr", async (req, res) => {
  try {
    const mnr = Number(req.params.mnr);
    if (!Number.isFinite(mnr)) {
      return res.status(400).json({ error: "Ungültige mnr" });
    }

    const updates = req.body;

    const updated = await mitarbeiterRepo.updateWithDetails(mnr, updates);
    if (!updated) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Fehler PUT /mitarbeiter/:mnr:", err);
    res.status(500).json({ error: "Fehler beim Bearbeiten" });
  }
});

router.delete("/:mnr", async (req, res) => {
  try {
    const mnr = Number(req.params.mnr);
    if (!Number.isFinite(mnr)) {
      return res.status(400).json({ error: "Ungültige mnr" });
    }

    const removed = await mitarbeiterRepo.remove(mnr);
    if (!removed) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }

    res.json({ message: "Mitarbeiter gelöscht" });
  } catch (err) {
    console.error("Fehler DELETE /mitarbeiter/:mnr:", err);
    res.status(500).json({ error: "Fehler beim Löschen" });
  }
});



























/* // -------------------------------------------------------------
// GET: alle Mitarbeiter
// -------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    const data = await mitarbeiterRepo.getAll();
    res.json(data);
  } catch (err) {
    console.error('Fehler /mitarbeiter:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Mitarbeiter' });
  }
});

// -------------------------------------------------------------
// GET: Mitarbeiter nach ID
// -------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ma = await mitarbeiterRepo.getById(id);

    if (!ma) return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });

    res.json(ma);
  } catch (err) {
    console.error('Fehler /mitarbeiter/:id:', err);
    res.status(500).json({ error: 'Fehler beim Laden' });
  }
});

// -------------------------------------------------------------
// POST: Mitarbeiter anlegen
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  try { 
    const body = req.body;
   
    // Filiale finden nach Kürzel
    const hauptFiliale = body.stammfiliale
      ? await filialenRepo.getByKuerzel(body.stammfiliale)
      : null;

    let springerAlgorithmId = null;

    if (body.springer && hauptFiliale) {
      springerAlgorithmId =
        hauptFiliale.algorithmid === 1 ? 2 : 1;
    }

    const neuer = await mitarbeiterRepo.add({
      vorname: body.vorname,
      nachname: body.nachname,
      geburtsdatum: body.geburtsdatum,
      strasse: body.strasse,
      plz: body.plz,
      ort: body.ort,
      land: body.land,
      telefon1: body.telefon1,
      telefon2: body.telefon2,
      email1: body.email1,
      email2: body.email2,
      stammfiliale: body.stammfiliale,
      nebenfilialen: body.nebenfilialen,
      arbeitnehmertyp: body.arbeitnehmertyp ?? body.arbeitnehmerTyp ?? 40,
      counter: null,
      springer: body.springer ?? false,
      springeralgorithmid: springerAlgorithmId,
      anmerkung: body.anmerkung,
      hauptfilialeid: hauptFiliale?.id ?? null
    });

    // Counter neu berechnen
    if (hauptFiliale) {
      await resetCountersForFiliale(hauptFiliale.id);
      await setCounterForMitarbeiter(hauptFiliale.id);
    }

    res.status(201).json(neuer);

  } catch (err) {
    console.error('Fehler POST /mitarbeiter:', err);
    res.status(500).json({ error: 'Fehler beim Anlegen' });
  }
});

// -------------------------------------------------------------
// PUT: Mitarbeiter bearbeiten
// -------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updated = await mitarbeiterRepo.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Fehler PUT /mitarbeiter:', err);
    res.status(500).json({ error: 'Fehler beim Bearbeiten' });
  }
});

// -------------------------------------------------------------
// DELETE
// -------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ma = await mitarbeiterRepo.getById(id);

    if (ma?.hauptfilialeid) {
      await resetCountersForFiliale(ma.hauptfilialeid);
      await setCounterForMitarbeiter(ma.hauptfilialeid);
    }

    const removed = await mitarbeiterRepo.remove(id);
    if (!removed) {
      return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
    }

    res.json({ message: 'Mitarbeiter gelöscht' });
  } catch (err) {
    console.error('Fehler DELETE /mitarbeiter:', err);
    res.status(500).json({ error: 'Fehler beim Löschen' });
  }
});

// -------------------------------------------------------------
// POST: Verfügbare Mitarbeiter
// -------------------------------------------------------------
router.post('/verfuegbar', async (req, res) => {
  try {
    const { filialeId, datum, jahr, monat } = req.body;

    if (!filialeId || !datum || !jahr || !monat) {
      return res.status(400).json({ error: "filialeId, datum, jahr, monat sind Pflicht" });
    }

    const j = Number(jahr);
    const m = Number(monat);

    // 1) Dienstplan aus DB
    const row = await dienstplanRepo.getByDate(j, m);

    if (!row || !row.plan_data || !Array.isArray(row.plan_data.filialen)) {
      return res.status(404).json({ error: "Dienstplan nicht gefunden oder beschädigt" });
    }

    const plan = row.plan_data;

    // 2) alle Mitarbeiter
    const alleMA = await mitarbeiterRepo.getAll();

    // 3) alle Einsätze an diesem Datum (über alle Filialen)
    const einsaetzeHeute = [];
    for (const fb of plan.filialen) {
      if (!fb.plan) continue;
      const tag = fb.plan.find(t => t.datum === datum);
      if (tag && Array.isArray(tag.einsatz)) {
        einsaetzeHeute.push(...tag.einsatz);
      }
    }

    // 4) Mitarbeiter, die in dieser Filiale arbeiten dürfen (Haupt + Nebenfiliale)
    const filId = Number(filialeId);

    const maFiliale = alleMA.filter(ma => {
      const neben = Array.isArray(ma.nebenfilialen)
        ? ma.nebenfilialen.map(Number)
        : [];

      return (
        Number(ma.hauptfilialeid) === filId ||
        neben.includes(filId)
      );
    });

    // 5) aussortieren, wer an diesem Tag schon A/E/U/K hat
    const verfuegbar = maFiliale.filter(ma => {
      const hatDienst = einsaetzeHeute.some(
        e =>
          Number(e.mitarbeiterId) === Number(ma.id) &&
          ['A','E','U','K'].includes(e.schicht)
      );
      return !hatDienst;
    });

    res.json(verfuegbar);

  } catch (err) {
    console.error("Fehler /mitarbeiter/verfuegbar:", err);
    res.status(500).json({ error: "Serverfehler" });
  }
}); */

module.exports = router;
