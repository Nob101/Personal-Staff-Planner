// ============================================================================
// 📅 dienstplan.routes.js
// ---------------------------------------------------------------------------
// API-Routen für Dienstpläne:
//  - Erzeugung eines neuen Plans (Algorithmus-Aufruf)
//  - Laden / Löschen vorhandener Monatspläne
//  - Manuelles Bearbeiten / Patchen einzelner Dienste
// ============================================================================

const express = require('express');
const router = express.Router();
const dienstplanRepo = require('../repositories/dienstplan.repo.pg');
const { generateDienstplan } = require('../functions/dienstplanGenerator');

// ============================================================================
// 🔹 GET /api/dienstplan/:jahr/:monat
// Lädt den Dienstplan eines bestimmten Monats
// ============================================================================
router.get('/:jahr/:monat', async (req, res) => {
  const jahr = Number(req.params.jahr);
  const monat = Number(req.params.monat);

  if (!jahr || !monat) {
    return res.status(400).json({ error: 'Jahr und Monat sind Pflicht.' });
  }

  try {
    const plan = await dienstplanRepo.getByDate(jahr, monat);
    if (!plan) return res.status(404).json({ error: 'Kein Dienstplan gefunden.' });

    // Nur die JSON-Daten zurückgeben, nicht die Metadaten
    res.json(plan.plan_data || plan);
  } catch (err) {
    console.error('Fehler beim Laden des Dienstplans:', err);
    res.status(500).json({ error: 'Fehler beim Laden des Dienstplans.' });
  }
});

// ============================================================================
// 🔹 POST /api/dienstplan/generate
// Generiert einen neuen Plan und speichert ihn in der DB
// ============================================================================
router.post('/generate', async (req, res) => {
  const { jahr, monat } = req.body;
  if (!jahr || !monat) {
    return res.status(400).json({ error: 'Jahr und Monat sind Pflichtfelder.' });
  }

  try {
    const neuerPlan = await generateDienstplan(jahr, monat);
    await dienstplanRepo.save(neuerPlan);

    res.status(201).json({
      message: 'Dienstplan erfolgreich generiert und gespeichert.',
      plan: neuerPlan
    });
  } catch (err) {
    console.error('Fehler beim Generieren des Dienstplans:', err);
    res.status(500).json({ error: 'Fehler beim Generieren des Dienstplans.' });
  }
});

// ============================================================================
// 🔹 PATCH /api/dienstplan/:jahr/:monat
// Optional: Bestehenden Plan manuell aktualisieren
// ============================================================================
router.patch('/:jahr/:monat', async (req, res) => {
  const jahr = Number(req.params.jahr);
  const monat = Number(req.params.monat);
  const { plan_data } = req.body;

  if (!plan_data) {
    return res.status(400).json({ error: 'plan_data ist erforderlich.' });
  }

  try {
    await dienstplanRepo.save({ jahr, monat, ...plan_data });
    res.json({ message: 'Dienstplan aktualisiert.' });
  } catch (err) {
    console.error('Fehler beim Aktualisieren des Dienstplans:', err);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Dienstplans.' });
  }
});

// ============================================================================
// 🔹 DELETE /api/dienstplan/:jahr/:monat
// Löscht den Dienstplan eines Monats aus der Datenbank
// ============================================================================
router.delete('/:jahr/:monat', async (req, res) => {
  const jahr = Number(req.params.jahr);
  const monat = Number(req.params.monat);

  if (!jahr || !monat) {
    return res.status(400).json({ error: 'Jahr und Monat sind Pflicht.' });
  }

  try {
    const deleted = await dienstplanRepo.remove(jahr, monat);
    if (!deleted) return res.status(404).json({ error: 'Kein Dienstplan gefunden.' });

    res.json({ message: 'Dienstplan erfolgreich gelöscht.' });
  } catch (err) {
    console.error('Fehler beim Löschen des Dienstplans:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Dienstplans.' });
  }
});

// ============================================================================
// EXPORT
// ============================================================================
module.exports = router;
