// ============================================================================
// 🔄 resetCountersForFiliale.js (PostgreSQL-Version)
// ---------------------------------------------------------------------------
// Setzt alle "counter" Werte der Mitarbeiter einer bestimmten Filiale auf NULL.
// Wird z. B. aufgerufen, wenn Mitarbeiter hinzugefügt, gelöscht oder verschoben werden.
// ============================================================================
const pool = require('../db/pool');

/**
 * Setzt die counter aller Mitarbeiter einer bestimmten Filiale auf NULL.
 * @param {number} filialeId - ID der Filiale
 */
async function resetCountersForFiliale(filialeId) {
  if (!filialeId) return;
  await pool.query('UPDATE mitarbeiter SET counter = NULL WHERE hauptfilialeid = $1', [filialeId]);
}

module.exports = { resetCountersForFiliale };
