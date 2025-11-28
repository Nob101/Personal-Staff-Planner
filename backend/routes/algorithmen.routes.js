const express = require('express');
const router = express.Router();
const algorithmenRepo = require('../repositories/algorithmen.repo.pg');

// -------------------------------------------------------------
// GET: Alle Algorithmen
// -------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    const algos = await algorithmenRepo.getAll();
    res.json(algos);
  } catch (err) {
    console.error('Fehler beim Laden der Algorithmen:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Algorithmen.' });
  }
});

// -------------------------------------------------------------
// GET: Algorithmus nach ID
// -------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const algo = await algorithmenRepo.getById(id);

    if (!algo) {
      return res.status(404).json({ error: 'Algorithmus nicht gefunden.' });
    }

    res.json(algo);
  } catch (err) {
    console.error('Fehler beim Laden des Algorithmus:', err);
    res.status(500).json({ error: 'Fehler beim Laden des Algorithmus.' });
  }
});

// -------------------------------------------------------------
// POST: Algorithmus anlegen
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const { name, pattern, stunden } = req.body;

    if (!name || !Array.isArray(pattern) || !stunden) {
      return res.status(400).json({ error: 'name, pattern[] und stunden sind Pflicht.' });
    }

    const algo = await algorithmenRepo.add({
      name,
      pattern,
      stunden: Number(stunden)
    });

    res.status(201).json(algo);
  } catch (err) {
    console.error('Fehler beim Anlegen:', err);
    res.status(500).json({ error: 'Fehler beim Anlegen des Algorithmus.' });
  }
});

// -------------------------------------------------------------
// PUT: Algorithmus bearbeiten
// -------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    const updates = {
      name: req.body.name,
      pattern: req.body.pattern,
      stunden: req.body.stunden
    };

    const updated = await algorithmenRepo.update(id, updates);

    if (!updated) {
      return res.status(404).json({ error: 'Algorithmus nicht gefunden.' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Fehler beim Aktualisieren:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren.' });
  }
});

// -------------------------------------------------------------
// DELETE: Algorithmus löschen
// -------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const removed = await algorithmenRepo.remove(id);

    if (!removed) {
      return res.status(404).json({ error: 'Algorithmus nicht gefunden.' });
    }

    res.json({ message: 'Algorithmus gelöscht.' });
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen.' });
  }
});

module.exports = router;
