const express = require('express');
const router = express.Router();
const algorithmenRepo = require('../repositories/algorithmen.repo.pg');

// Alle Algorithmen abrufen
router.get('/', async (_req, res) => {
  try {
    const algos = await algorithmenRepo.getAll();
    res.json(algos);
  } catch (err) {
    console.error('Fehler beim Laden der Algorithmen:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Algorithmen.' });
  }
});

// Algorithmus per ID abrufen
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const algo = await algorithmenRepo.getById(id);
    if (!algo) return res.status(404).json({ error: 'Algorithmus nicht gefunden.' });
    res.json(algo);
  } catch (err) {
    console.error('Fehler beim Laden des Algorithmus:', err);
    res.status(500).json({ error: 'Fehler beim Laden des Algorithmus.' });
  }
});

// Algorithmus anlegen
router.post('/', async (req, res) => {
  try {
    const { name, pattern, stunden } = req.body;
    const algo = await algorithmenRepo.add({ name, pattern, stunden });
    res.status(201).json(algo);
  } catch (err) {
    console.error('Fehler beim Anlegen des Algorithmus:', err);
    res.status(500).json({ error: 'Fehler beim Anlegen des Algorithmus.' });
  }
});

// Algorithmus bearbeiten
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;
    const updated = await algorithmenRepo.update(id, updates);
    if (!updated) return res.status(404).json({ error: 'Algorithmus nicht gefunden.' });
    res.json(updated);
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Algorithmus:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren.' });
  }
});

// Algorithmus löschen
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    await algorithmenRepo.remove(id);
    res.json({ message: 'Algorithmus gelöscht.' });
  } catch (err) {
    console.error('Fehler beim Löschen des Algorithmus:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Algorithmus.' });
  }
});

module.exports = router;
