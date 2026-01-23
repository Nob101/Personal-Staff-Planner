const express = require('express');
const router = express.Router();
const repo = require('../repositories/mitarbeiter.repo.pg');

// Alle Mitarbeiter
router.get('/', async (_req, res, next) => {
  try {
    const list = await repo.list();
    res.json(list);
  } catch (e) { next(e); }
});

// Einzelner Mitarbeiter (per MNr)
router.get('/:mnr', async (req, res, next) => {
  try {
    const row = await repo.get(req.params.mnr);
    if (!row) return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
    res.json(row);
  } catch (e) { next(e); }
});

// Anlegen (mindestens vorname, nachname)
router.post('/', async (req, res, next) => {
  try {
    const created = await repo.create(req.body || {});
    res.status(201).json(created);
  } catch (e) { next(e); }
});

// Aktualisieren
router.put('/:mnr', async (req, res, next) => {
  try {
    const updated = await repo.update(req.params.mnr, req.body || {});
    if (!updated) return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
    res.json(updated);
  } catch (e) { next(e); }
});

// Löschen
router.delete('/:mnr', async (req, res, next) => {
  try {
    const ok = await repo.remove(req.params.mnr);
    if (!ok) return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
    res.status(204).end();
  } catch (e) { next(e); }
});

module.exports = router;
