// ============================================================================
// 🔢 setCounter.js
// ---------------------------------------------------------------------------
// Diese Funktion initialisiert oder aktualisiert die Einsatz-Zähler ("counter")
// für alle Mitarbeiter einer bestimmten Filiale. Der Counter bestimmt,
// an welcher Position im Algorithmus-Pattern der Mitarbeiter startet.
// ============================================================================

const { readJson, writeJson } = require('./fileStore');

// ============================================================================
// 🔹 setCounterForMitarbeiter(filialeId)
// ---------------------------------------------------------------------------
// Parameter:
//   filialeId → ID der Filiale, deren Mitarbeiter Counter gesetzt werden sollen
//
// Ablauf:
// 1️⃣ Mitarbeiter der Filiale laden
// 2️⃣ Algorithmus (Pattern) der Filiale ermitteln
// 3️⃣ Counter-Abstände berechnen
// 4️⃣ Allen Mitarbeitern, die noch keinen Counter haben, einen Startwert geben
// ============================================================================
async function setCounterForMitarbeiter(filialeId) {
  const alleMitarbeiter = await readJson('mitarbeiter.json');

  // Nur Mitarbeiter mit dieser Hauptfiliale
  const mitarbeiter = alleMitarbeiter.filter(m => m.hauptfilialeId === filialeId);
  if (mitarbeiter.length === 0) return; // keine Mitarbeiter → nichts tun

  // Filiale & Algorithmus laden
  const algos    = await readJson('algorithmen.json');
  const filialen = await readJson('filialen.json');
  const filiale  = filialen.find(f => f.id === filialeId);
  if (!filiale) throw new Error('Filiale nicht gefunden');

  const algorithm = algos.find(a => a.id === filiale.algorithmId);
  if (!algorithm) throw new Error('Algorithmus nicht gefunden');

  // Pattern bestimmen (z. B. ["A", "A", "E", "E", "F", "F"])
  const pattern = algorithm.algorythmus || algorithm.pattern;
  const patternLen = pattern.length;

  // Schrittweite = ungefähr 1/3 des Patterns (verteilt Startpunkte)
  let step = Math.floor(patternLen / 3);

  // Bereits vergebene Counter-Werte sammeln
  const usedCounters = mitarbeiter
    .filter(m => m.counter !== null && m.counter !== undefined)
    .map(m => m.counter);

  // Nächsten freien Counter bestimmen
  let nextCounter;
  if (usedCounters.length > 0) {
    const maxUsed = Math.max(...usedCounters);
    nextCounter = (maxUsed + step) % patternLen;
  } else {
    nextCounter = 0; // erster Mitarbeiter beginnt bei 0
  }

  // Mitarbeitern ohne Counter einen Startwert geben
  for (const m of mitarbeiter) {
    if (m.counter === null || m.counter === undefined) {
      m.counter = nextCounter;
      nextCounter = (nextCounter + step) % patternLen;
    }
  }

  // Datei speichern
  await writeJson('mitarbeiter.json', alleMitarbeiter);
}

// ============================================================================
// EXPORT
// ============================================================================
module.exports = { setCounterForMitarbeiter };
