// functions/setCounter.js
const mitarbeiterRepo = require('../repositories/mitarbeiter.repo.pg');
const filialenRepo = require('../repositories/filialen.repo.pg');
// backend/services/dienstplanGenerator.js
const { getAlgorithmus } = require("./algorithmen");


/**
 * Initialisiert oder aktualisiert den "counter" für alle Mitarbeiter
 * einer bestimmten Filiale, basierend auf deren Algorithmus-Pattern.
 *
 * Der Counter steuert, an welcher Stelle im Schicht-Pattern (A/E/F)
 * der Mitarbeiter beim Generieren startet.
 */
async function setCounterForMitarbeiter(fnr) {
  fnr = Number(fnr);
  const alleMitarbeiter = await mitarbeiterRepo.getAllBase();
  const mitarbeiter = alleMitarbeiter.filter(m => Number(m.hauptfiliale_fnr) === fnr);
  if (mitarbeiter.length === 0) return;

  const filiale = await filialenRepo.getById(fnr);
  if (!filiale) throw new Error('Filiale nicht gefunden');

 const algorithm = getAlgorithmus(filiale.algorithmid);
  if (!algorithm) throw new Error('Algorithmus nicht gefunden');



  const patternLen = algorithm.length;
  const step = Math.floor(patternLen / 3);

  // Bereits genutzte Counter-Werte ermitteln
  const usedCounters = mitarbeiter
    .filter(m => m.counter !== null && m.counter !== undefined)
    .map(m => Number(m.counter));

  let nextCounter;
  if (usedCounters.length > 0) {
    const maxUsed = Math.max(...usedCounters);
    nextCounter = (maxUsed + step) % patternLen;
  } else {
    nextCounter = 0;
  }

  // Neue Counter zuweisen
  for (const m of mitarbeiter) {
    if (m.counter === null || m.counter === undefined) {
      m.counter = nextCounter;
      nextCounter = (nextCounter + step) % patternLen;
      await mitarbeiterRepo.updateCounter(m.mnr, m.counter);
    }
  }
}

module.exports = { setCounterForMitarbeiter };
