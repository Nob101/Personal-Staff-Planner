// ============================================================================
// 🔄 resetCountersForFiliale.js
// ---------------------------------------------------------------------------
// Diese Funktion setzt die Einsatz-Zähler (counter) aller Mitarbeiter einer
// bestimmten Filiale zurück. Sie wird z. B. aufgerufen, wenn neue Mitarbeiter
// hinzugefügt oder entfernt werden, damit die Algorithmen wieder synchron starten.
// ============================================================================

const { readJson, writeJson } = require('./fileStore');

// ============================================================================
// 🔹 resetCountersForFiliale(filialeId)
// ---------------------------------------------------------------------------
// filialeId: ID der Filiale, deren Mitarbeiter zurückgesetzt werden sollen.
// Setzt den "counter" jedes betroffenen Mitarbeiters auf null.
// ============================================================================
async function resetCountersForFiliale(filialeId) {
  const alle = await readJson('mitarbeiter.json');

  for (const m of alle) {
    if (m.hauptfilialeId === filialeId) {
      m.counter = null; // Reset des Zählers
    }
  }

  await writeJson('mitarbeiter.json', alle);
}

// ============================================================================
// EXPORT
// ============================================================================
module.exports = { resetCountersForFiliale };
