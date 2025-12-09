// ============================================================================
// 👥 mitarbeiterDerFilialen.js
// ---------------------------------------------------------------------------
// Dieses Modul stellt Hilfsfunktionen bereit, um Mitarbeiter anhand
// ihrer zugehörigen Filiale(n) zu ermitteln.
// - Hauptfiliale → eindeutige Zuordnung
// - Nebenfilialen → optionale Zusatz-Zuordnungen
// ============================================================================

const { readJson } = require('./fileStore');


// ============================================================================
// 🔹 getMitarbeiterByFilialeId(filialeId)
// ---------------------------------------------------------------------------
// Gibt alle Mitarbeiter zurück, die entweder:
//  - in der angegebenen Filiale ihre HAUPTFILIALE haben oder
//  - diese Filiale als NEBENFILIALE eingetragen haben.
// ============================================================================
async function getMitarbeiterByFilialeId(filialeId) {
  const data = await readJson('mitarbeiter.json');
  return data.filter(m =>
    m.hauptfilialeId === filialeId ||
    (Array.isArray(m.nebenfilialenIds) && m.nebenfilialenIds.includes(filialeId))
  );
}


// ============================================================================
// 🔹 getMitarbeiterByHauptfilialeId(filialeId)
// ---------------------------------------------------------------------------
// Gibt alle Mitarbeiter zurück, deren HAUPTFILIALE der angegebenen Filiale entspricht.
// ============================================================================
async function getMitarbeiterByHauptfilialeId(filialeId) {
  const data = await readJson('mitarbeiter.json');
  return data.filter(m => m.hauptfilialeId === filialeId);
}


// ============================================================================
// EXPORT
// ============================================================================
module.exports = {
  getMitarbeiterByFilialeId,
  getMitarbeiterByHauptfilialeId
};
