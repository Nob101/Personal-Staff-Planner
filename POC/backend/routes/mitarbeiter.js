const express = require('express');
const router = express.Router();

// Hilfsfunktionen
const { readJson, writeJson, nextId } = require('../functions/fileStore');
const { resetCountersForFiliale } = require('../functions/resetCountersForFiliale');

const FILE = 'mitarbeiter.json'; // zentrale Datei für Mitarbeiterdaten


// ============================================================================
// 🔹 ALLE MITARBEITER LADEN
// ============================================================================
router.get('/', async (req, res) => {
  try {
    const data = await readJson(FILE);
    res.json(data);
  } catch (err) {
    console.error('Fehler beim Lesen:', err);
    res.status(500).json({ error: 'Fehler beim Lesen der Mitarbeiterdatei' });
  }
});


// ============================================================================
// 🔹 NEUEN MITARBEITER ANLEGEN
// ============================================================================
router.post('/', async (req, res) => {
  const { vorname, nachname, hauptfilialeId, nebenfilialenIds, counter } = req.body;

  try {
    const data = await readJson(FILE);

    const neuerMitarbeiter = {
      id: nextId(data),
      vorname,
      nachname,
      hauptfilialeId: hauptfilialeId || null,
      nebenfilialenIds: Array.isArray(nebenfilialenIds) ? nebenfilialenIds : [],
      counter: counter || 0
    };

    data.push(neuerMitarbeiter);
    await writeJson(FILE, data);

    // Nach Hinzufügen -> Counter für betroffene Filiale zurücksetzen
    resetCountersForFiliale(neuerMitarbeiter.hauptfilialeId).catch(err =>
      console.error('Fehler beim Zurücksetzen der Zähler:', err)
    );

    res.status(201).json(neuerMitarbeiter);

  } catch (err) {
    console.error('Fehler beim Anlegen eines Mitarbeiters:', err);
    res.status(500).json({ error: 'Fehler beim Anlegen des Mitarbeiters' });
  }
});


// ============================================================================
// 🔹 MITARBEITER LÖSCHEN
// ============================================================================
router.delete('/:mitarbeiterId', async (req, res) => {
  const mitarbeiterId = Number(req.params.mitarbeiterId);
  if (!Number.isInteger(mitarbeiterId) || mitarbeiterId <= 0) {
    return res.status(400).json({ error: 'mitarbeiterId muss eine positive Zahl sein' });
  }

  try {
    const data = await readJson(FILE);
    const index = data.findIndex(m => m.id === mitarbeiterId);

    if (index === -1) {
      return res.status(404).json({ error: 'Mitarbeiter nicht gefunden' });
    }

    const [entfernterMitarbeiter] = data.splice(index, 1);
    await writeJson(FILE, data);

    // Nach Löschen -> Counter neu berechnen
    resetCountersForFiliale(entfernterMitarbeiter.hauptfilialeId).catch(err =>
      console.error('Fehler beim Zurücksetzen der Zähler:', err)
    );

    res.json({ message: 'Mitarbeiter gelöscht' });

  } catch (err) {
    console.error('Fehler beim Löschen:', err);
    res.status(500).json({ error: 'Fehler beim Löschen des Mitarbeiters' });
  }
});


// ============================================================================
// 🔹 FREIE MITARBEITER (für Ersatz etc.)
// ============================================================================

// Prüft, ob ein Mitarbeiter an einem bestimmten Tag frei ist
function istFreiAmTag(planData, mitarbeiterId, datum) {
  for (const filiale of planData.filialen) {
    const tag = filiale.plan.find(t => t.datum === datum);
    if (!tag) continue;

    const einsatz = tag.einsatz.find(e => e.mitarbeiterId === mitarbeiterId);
    if (einsatz && einsatz.schicht && einsatz.schicht !== 'F') {
      return false; // hat Dienst → NICHT frei
    }
  }
  return true;
}


// Gibt alle Mitarbeiter zurück, die an einem Tag verfügbar sind
router.post('/verfuegbar', async (req, res) => {
  const { filialeId, datum, jahr, monat } = req.body;

  if (!filialeId || !datum || !jahr || !monat) {
    return res.status(400).json({ error: 'filialeId, datum, jahr und monat sind Pflicht.' });
  }

  try {
    const alleMitarbeiter = await readJson(FILE);
    const plan = await readJson(`dienstplaene/dienstplan_${jahr}_${String(monat).padStart(2, '0')}.json`);

    // Alle Mitarbeiter der Filiale + Nebenfilialen holen
    const kandidaten = alleMitarbeiter.filter(m =>
      m.hauptfilialeId === filialeId ||
      (Array.isArray(m.nebenfilialenIds) && m.nebenfilialenIds.includes(filialeId))
    );

    // Nur jene behalten, die am angegebenen Datum frei sind
    const verfuegbar = kandidaten.filter(m => istFreiAmTag(plan, m.id, datum));

    res.json(verfuegbar);

  } catch (err) {
    console.error('Fehler /verfuegbar:', err);
    res.status(500).json({ error: 'Fehler beim Ermitteln der verfügbaren Mitarbeiter' });
  }
});


// ============================================================================
// EXPORT
// ============================================================================
module.exports = router;
