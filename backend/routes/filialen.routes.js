const express = require('express');
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
// POST: Neue Filiale anlegen
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
    console.error('Fehler beim Anlegen einer Filiale:', err);
    res.status(500).json({ error: 'Fehler beim Anlegen einer Filiale' });
  }
});

// -------------------------------------------------------------
// PUT: Filiale bearbeiten
// -------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;

    const geaendert = await filialenRepo.update(id, updates);

    if (!geaendert) {
      return res.status(404).json({ error: 'Filiale nicht gefunden' });
    }

    res.json(geaendert);
  } catch (err) {
    console.error('Fehler beim Bearbeiten einer Filiale:', err);
    res.status(500).json({ error: 'Fehler beim Bearbeiten der Filiale' });
  }
});

// -------------------------------------------------------------
// DELETE: Filiale löschen
// -------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await filialenRepo.remove(id);
    res.json({ message: 'Filiale gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen der Filiale:', err);
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
    console.error('Fehler beim Laden der Mitarbeiter der Filiale:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Mitarbeiter der Filiale' });
  }
});

module.exports = router;
