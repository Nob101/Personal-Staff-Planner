// Enthält vordefinierte Schicht-Algorithmen.
// Jeder Algorithmus ist ein zyklisches Muster aus Schichttypen,
// das vom Dienstplan-Generator mithilfe eines Counters durchlaufen wird.
//
// A = Frühdienst
// E = Spätdienst
// F = Frei

const ALGORITHMEN = {
  1: ["A", "A", "E", "E", "F", "F"],
  2: ["A", "A", "A", "A", "F", "F", "E", "E", "E", "E","F", "F"],
};


/**
 * Liefert das Schichtmuster (Algorithmus) für eine gegebene ID.
 *
 * Die Funktion kapselt den Zugriff auf die Algorithmus-Definitionen
 * und stellt sicher, dass nur gültige Algorithmen verwendet werden.
 *
 * Falls ein ungültiger Algorithmus angefordert wird, wird bewusst
 * ein Fehler geworfen, da ohne gültiges Muster kein konsistenter
 * Dienstplan erzeugt werden kann.
 */

 
async function getAlgorithmus(id) {
  const algo = ALGORITHMEN[Number(id)];
  if (!algo) {
    throw new Error(`Unbekannter Algorithmus: ${id}`);
    return ALGORITHMEN[1];
  }
  return algo;
}

// Export der Algorithmen und der Zugriffsfunktion
// für den Einsatz im Dienstplan-Generator

module.exports = {
  ALGORITHMEN,
  getAlgorithmus,
};
