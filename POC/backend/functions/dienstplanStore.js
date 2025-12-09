// ============================================================================
// 📁 dienstplanStore.js
// ---------------------------------------------------------------------------
// Diese Datei verwaltet die Speicherung und Verwaltung aller Dienstpläne.
// Es werden sämtliche Monatspläne in einer zentralen Datei (dienstplaene.json)
// gespeichert, damit man schnell auf alte oder bestehende Pläne zugreifen kann.
// ============================================================================

const { readJson, writeJson } = require('./fileStore');

// Hauptdatei, in der alle generierten Monatspläne gespeichert werden
const FILE = 'dienstplaene.json';


// ============================================================================
// 🔹 loadAllPlans()
// ---------------------------------------------------------------------------
// Lädt die gesamte Liste aller gespeicherten Dienstpläne.
// Gibt ein Array zurück oder [] falls die Datei noch nicht existiert.
// ============================================================================
async function loadAllPlans() {
  return await readJson(FILE); // [] wenn Datei noch nicht existiert
}


// ============================================================================
// 🔹 savePlan(planObject)
// ---------------------------------------------------------------------------
// Speichert oder aktualisiert einen Monatsplan in der zentralen Datei.
// Wenn für (jahr, monat) bereits ein Plan existiert → wird dieser ersetzt,
// ansonsten wird ein neuer Eintrag hinzugefügt.
// ============================================================================
async function savePlan(planObject) {
  const all = await loadAllPlans();
  const { jahr, monat } = planObject;

  // Prüfen, ob bereits ein Plan für diesen Monat existiert
  const existingIndex = all.findIndex(p => p.jahr === jahr && p.monat === monat);

  if (existingIndex >= 0) {
    // bestehenden Plan ersetzen
    all[existingIndex] = planObject;
  } else {
    // neuen hinzufügen
    all.push(planObject);
  }

  await writeJson(FILE, all);
}


// ============================================================================
// 🔹 findPlan(jahr, monat)
// ---------------------------------------------------------------------------
// Gibt den gespeicherten Plan für das angegebene Jahr/Monat zurück,
// oder null, wenn keiner vorhanden ist.
// ============================================================================
async function findPlan(jahr, monat) {
  const all = await loadAllPlans();
  return all.find(p => p.jahr === jahr && p.monat === monat) || null;
}


// ============================================================================
// EXPORT
// ============================================================================
module.exports = { loadAllPlans, savePlan, findPlan };
