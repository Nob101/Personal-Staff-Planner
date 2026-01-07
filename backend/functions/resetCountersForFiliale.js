const pool = require('../db/pool');

/**
 * Setzt die counter aller Mitarbeiter einer bestimmten Filiale auf NULL.
 * @param {number} filialeId - ID der Filiale
 */
async function resetCountersForFiliale(filialeId) {
  if (!filialeId) return;
  await pool.query('UPDATE mitarbeiter SET counter = NULL WHERE hauptfiliale_fnr = $1', [filialeId]);
}

module.exports = { resetCountersForFiliale };
