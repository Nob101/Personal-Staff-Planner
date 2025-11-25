const express = require('express');
const router = express.Router();

// Hilfsfunktionen
const { readJson, writeJson, nextId } = require('../functions/fileStore');
const { getMitarbeiterByFilialeId } = require('../functions/mitarbeiterDerFilialen');

// Pfade zu den zentralen JSON-Dateien
const FILE_FILIALEN = 'filialen.json';
const FILE_ALGOS    = 'algorithmen.json';


// ============================================================================
// 🔹 ALLE FILIALEN LADEN (+ zugehöriger Algorithmus)
// ============================================================================
router.get('/', async (_req, res) => {
  try {
    const filialen = await readJson(FILE_FILIALEN);
    const algos = await readJson(FILE_ALGOS);

    // Jede Filiale bekommt ihren Algorithmus angehängt
    const out = filialen.map(f => ({
      ...f,
      algorithm: algos.find(a => a.id === f.algorithmId) || null
    }));

    res.json(out);
  } catch (err) {
    console.error('Fehler beim Laden der Filialen:', err);
    res.status(500).json({ error: 'Fehler beim Lesen der Filialdaten' });
  }
});


// ============================================================================
// 🔹 NEUE FILIALE ANLEGEN
// ============================================================================
router.post('/', async (req, res) => {
  const { standort, farbe, algorithmId } = req.body;

  try {
    const algos = await readJson(FILE_ALGOS);
    const algo = algos.find(a => a.id === Number(algorithmId));
    if (!algo) {
      return res.status(400).json({ error: 'Ungültige algorithmId – Algorithmus existiert nicht.' });
    }

    const data = await readJson(FILE_FILIALEN);

    const neu = {
      id: nextId(data),
      standort: standort || 'Unbenannt',
      farbe: farbe || '#cccccc',
      algorithmId: algo.id
    };

    data.push(neu);
    await writeJson(FILE_FILIALEN, data);

    res.status(201).json(neu);

  } catch (err) {
    console.error('Fehler beim Anlegen einer Filiale:', err);
    res.status(500).json({ error: 'Fehler beim Anlegen der Filiale' });
  }
});


// ============================================================================
// 🔹 ALLE MITARBEITER EINER FILIALE LADEN
// ============================================================================
router.get('/:filialeId/mitarbeiter', async (req, res) => {
  const filialeId = Number(req.params.filialeId);

  if (!Number.isInteger(filialeId) || filialeId <= 0) {
    return res.status(400).json({ error: 'filialeId muss eine positive Zahl sein' });
  }

  try {
    // Prüfen, ob Filiale existiert
    const filialen = await readJson(FILE_FILIALEN);
    const filiale = filialen.find(f => f.id === filialeId);
    if (!filiale) {
      return res.status(404).json({ error: 'Filiale nicht gefunden' });
    }

    // Mitarbeiter dieser Filiale abrufen
    const list = await getMitarbeiterByFilialeId(filialeId);

    res.json({
      filiale: {
        id: filiale.id,
        standort: filiale.standort,
        farbe: filiale.farbe
      },
      anzahl: list.length,
      mitarbeiter: list
    });

  } catch (err) {
    console.error('Fehler beim Laden der Mitarbeiter einer Filiale:', err);
    res.status(500).json({ error: 'Fehler beim Laden der Mitarbeiterdaten' });
  }
});


// ============================================================================
// EXPORT
// ============================================================================
module.exports = router;
