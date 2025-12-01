// ============================================================================
// 📦 fileStore.js
// ---------------------------------------------------------------------------
// Diese Datei dient als zentrale Schnittstelle zum Lesen und Schreiben von JSON-Dateien.
// Sie stellt sicher, dass alle Daten im Verzeichnis "/data" liegen und erstellt es bei Bedarf automatisch.
// ============================================================================

const { readFile, writeFile, mkdir } = require('fs').promises;
const path = require('path');

// Pfad zum zentralen Datenverzeichnis
const DATA_DIR = path.join(__dirname, '..', 'data');


// ============================================================================
// 🔹 Hilfsfunktion: sicherstellen, dass der /data-Ordner existiert
// ============================================================================
async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}


// ============================================================================
// 🔹 JSON-Datei lesen
//    → gibt [] zurück, wenn Datei nicht existiert oder leer ist
// ============================================================================
async function readJson(name) {
  await ensureDir();
  const file = path.join(DATA_DIR, name);

  try {
    const text = await readFile(file, 'utf8');
    return JSON.parse(text || '[]');
  } catch {
    // Falls Datei nicht existiert oder fehlerhaft ist → leeres Array zurückgeben
    return [];
  }
}


// ============================================================================
// 🔹 JSON-Datei schreiben (überschreibt bestehende Datei komplett)
// ============================================================================
async function writeJson(name, data) {
  await ensureDir();
  const file = path.join(DATA_DIR, name);

  // JSON mit Einrückungen (2 Leerzeichen) speichern
  await writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}


// ============================================================================
// 🔹 Nächste freie ID berechnen
// ============================================================================
function nextId(items) {
  return items.reduce((max, x) => Math.max(max, x.id || 0), 0) + 1;
}


// ============================================================================
// EXPORT
// ============================================================================
module.exports = { readJson, writeJson, nextId };
