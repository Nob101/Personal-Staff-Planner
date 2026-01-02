const express = require("express");
const router = express.Router();
const filialeRepo = require("../repositories/filialen.repo.pg");

router.post("/", async (req, res) => {
  try {
    const { filialname, strasse, plz, land, telefon, email, farbe, ort, algorithmid } = req.body;

    if (!filialname) {
      return res.status(400).json({ error: "filialname ist Pflicht" });
    }

    const created = await filialeRepo.add({
      filialname,
      strasse: strasse ?? null,
      plz: plz ?? null,
      ort: ort ?? null,
      land: land ?? "Österreich",
      telefon: telefon ?? null,
      email: email ?? null,
      farbe: farbe ?? "#3498db",
      algorithmid: algorithmid, 
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Fehler POST /filialen:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const data = await filialeRepo.getAll();
    res.json(data);
  } catch (err) {
    console.error("Fehler GET /filialen:", err);
    res.status(500).json({ error: "Fehler beim Laden der Filialen" });
  }
});

router.get("/:fnr", async (req, res) => {
  try {
    const fnr = Number(req.params.fnr);
    const filiale = await filialeRepo.getById(fnr);
    if (!filiale) {
      return res.status(404).json({ error: "Filiale nicht gefunden" });
    }
    res.json(filiale);
  } catch (err) {
    console.error("Fehler GET /filialen/:id:", err);
    res.status(500).json({ error: "Fehler beim Laden der Filiale" });
  }
});

router.put("/:fnr", async (req, res) => {
  try {
    const fnr = Number(req.params.fnr);
    const updates = req.body;

    const updated = await filialeRepo.update(fnr, updates);
    if (!updated) {
      return res.status(404).json({ error: "Filiale nicht gefunden" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Fehler PUT /filialen/:fnr:", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Filiale" });
  }
});

router.delete("/:fnr", async (req, res) => {
  try {
    const fnr = Number(req.params.fnr);
    const deleted = await filialeRepo.remove(fnr);
    if (!deleted) {
      return res.status(404).json({ error: "Filiale nicht gefunden" });
    }
    res.json({ message: "Filiale gelöscht" });
  } catch (err) {
    console.error("Fehler DELETE /filialen/:fnr:", err);
    res.status(500).json({ error: "Fehler beim Löschen der Filiale" });
  }
});

module.exports = router;




















/* const express = require('express');
const router = express.Router();
const filialenRepo = require('../repositories/filialen.repo.pg');
const mitarbeiterRepo = require('../repositories/mitarbeiter.repo.pg');

// -------------------------------------------------------------
// GET: Alle Filialen
// -------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    const filialen = await filialenRepo.getAll();
    res.json(filialen);
  } catch (err) {
    console.error('Fehler beim Lesen der Filialen:', err);
    res.status(500).json({ error: 'Fehler beim Lesen der Filialen' });
  }
});

// -------------------------------------------------------------
// GET: Filiale nach ID
// -------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const filiale = await filialenRepo.getById(id);

    if (!filiale) {
      return res.status(404).json({ error: 'Filiale nicht gefunden' });
    }

    res.json(filiale);
  } catch (err) {
    console.error('Fehler beim Lesen der Filiale:', err);
    res.status(500).json({ error: 'Fehler beim Lesen der Filiale' });
  }
});

// -------------------------------------------------------------
// POST: Neue Filiale
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      filialname,
      farbe,
      ort,
      strasse,
      plz,
      land,
      email,
      telefon,
      algorithmId
    } = req.body;

    if (!filialname || !algorithmId) {
      return res.status(400).json({ error: 'Filialname und algorithmId sind Pflichtfelder' });
    }

    const neueFiliale = await filialenRepo.add({
      filialname,
      farbe: farbe || null,
      ort: ort || null,
      strasse: strasse || null,
      plz: plz || null,
      land: land || null,
      email: email || null,
      telefon: telefon || null,
      algorithmId
    });

    res.status(201).json(neueFiliale);
  } catch (err) {
    console.error('Fehler beim Anlegen:', err);
    res.status(500).json({ error: 'Fehler beim Anlegen einer Filiale' });
  }
});

// -------------------------------------------------------------
// PUT: Filiale aktualisieren
// -------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updates = {
      filialname: req.body.filialname,
      farbe: req.body.farbe,
      ort: req.body.ort,
      strasse: req.body.strasse,
      plz: req.body.plz,
      land: req.body.land,
      email: req.body.email,
      telefon: req.body.telefon,
      algorithmId: req.body.algorithmId
    };

    const geaendert = await filialenRepo.update(id, updates);

    if (!geaendert) {
      return res.status(404).json({ error: 'Filiale nicht gefunden' });
    }

    res.json(geaendert);
  } catch (err) {
    console.error('Fehler beim Bearbeiten:', err);
    res.status(500).json({ error: 'Fehler beim Bearbeiten der Filiale' });
  }
});

// -------------------------------------------------------------
// DELETE
// -------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const deleted = await filialenRepo.remove(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Filiale nicht gefunden' });
    }

    res.json({ message: 'Filiale gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen der Filiale' });
  }
});

// -------------------------------------------------------------
// GET: Mitarbeiter einer Filiale
// -------------------------------------------------------------
router.get('/:id/mitarbeiter', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const mitarbeiter = await mitarbeiterRepo.getByFiliale(id);
    res.json(mitarbeiter);
  } catch (err) {
    console.error('Fehler beim Laden der Mitarbeiter:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Mitarbeiter' });
  }
});

module.exports = router;
 */