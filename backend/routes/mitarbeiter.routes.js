const express = require('express');
const router = express.Router();

const mitarbeiterRepo = require('../repositories/mitarbeiter.repo.pg');
const filialenRepo = require('../repositories/filialen.repo.pg');
const { resetCountersForFiliale } = require('../functions/resetCountersForFiliale');

// -------------------------------------------------------------
// GET: Alle Mitarbeiter
// -------------------------------------------------------------
router.get('/', async (_req, res) => {
  try {
    const data = await mitarbeiterRepo.getAll();
    res.json(data);
  } catch (err) {
    console.error('Fehler beim Lesen:', err);
    res.status(500).json({ error: 'Fehler beim Lesen der Mitarbeiterdaten' });
  }
});

// -------------------------------------------------------------
// GET: Mitarbeiter nach ID
// -------------------------------------------------------------
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const mitarbeiter = await mitarbeiterRepo.getById(id);

    if (!mitarbeiter) {
      return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
    }

    res.json(mitarbeiter);
  } catch (err) {
    console.error('Fehler beim Lesen eines Mitarbeiters:', err);
    res.status(500).json({ error: 'Fehler beim Lesen eines Mitarbeiters' });
  }
});

// -------------------------------------------------------------
// POST: Neuen Mitarbeiter anlegen
// -------------------------------------------------------------
router.post('/', async (req, res) => {
  try {
    const {
      vorname,
      nachname,
      geburtsdatum,
      strasse,
      plz,
      ort,
      land,
      telefon1,
      telefon2,
      email1,
      email2,
      stammfiliale,
      nebenfilialen = [],
      arbeitnehmerTyp = 40,
      springer = false,
      anmerkung
    } = req.body;

    // Springer-Algorithmus bestimmen
    const hauptFiliale = await filialenRepo.getByKuerzel(stammfiliale);
    let springerAlgorithmId = null;

    if (springer && hauptFiliale) {
      springerAlgorithmId = hauptFiliale.algorithmid === 1 ? 2 : 1;
    }

    const neuerMitarbeiter = await mitarbeiterRepo.add({
      vorname,
      nachname,
      geburtsdatum,
      strasse,
      plz,
      ort,
      land,
      telefon1,
      telefon2,
      email1,
      email2,
      stammfiliale,
      nebenfilialen,
      arbeitnehmerTyp,
      counter: null,
      springer,
      springerAlgorithmId,
      anmerkung
    });

    // Counter-Reset für betroffene Filiale
    if (hauptFiliale) {
      await resetCountersForFiliale(hauptFiliale.id);
    }

    res.status(201).json(neuerMitarbeiter);
  } catch (err) {
    console.error('Fehler beim Anlegen:', err);
    res.status(500).json({ error: 'Fehler beim Anlegen des Mitarbeiters' });
  }
});

// -------------------------------------------------------------
// PUT: Mitarbeiter bearbeiten
// -------------------------------------------------------------
router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const updates = req.body;

    const geaendert = await mitarbeiterRepo.update(id, updates);
    if (!geaendert) {
      return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
    }

    res.json(geaendert);
  } catch (err) {
    console.error('Fehler beim Bearbeiten:', err);
    res.status(500).json({ error: 'Fehler beim Bearbeiten des Mitarbeiters' });
  }
});

// -------------------------------------------------------------
// DELETE: Mitarbeiter löschen
// -------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ma = await mitarbeiterRepo.getById(id);

    if (ma) {
      const hauptFiliale = await filialenRepo.getByKuerzel(ma.stammfiliale);
      if (hauptFiliale) await resetCountersForFiliale(hauptFiliale.id);
    }

    await mitarbeiterRepo.remove(id);
    res.json({ message: 'Mitarbeiter gelöscht' });
  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Mitarbeiters' });
  }
});

// -------------------------------------------------------------
// POST: Verfügbare Mitarbeiter für Ersatz (Krank/Urlaub)
// -------------------------------------------------------------
router.post('/verfuegbar', async (req, res) => {
  const { filialeId, datum } = req.body;
  if (!filialeId || !datum) {
    return res.status(400).json({ error: 'Filiale und Datum sind Pflichtfelder.' });
  }

  try {
    const verfuegbar = await mitarbeiterRepo.getVerfuegbar(filialeId, datum);
    res.json(verfuegbar);
  } catch (err) {
    console.error('Fehler /verfuegbar:', err);
    res.status(500).json({ error: 'Fehler beim Ermitteln der verfügbaren Mitarbeiter' });
  }
});

module.exports = router;
