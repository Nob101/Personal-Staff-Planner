// functions/setCounter.js
const mitarbeiterRepo = require('../repositories/mitarbeiter.repo.pg');
const filialenRepo = require('../repositories/filialen.repo.pg');
const algorithmenRepo = require('../repositories/algorithmen.repo.pg');

/**
 * Initialisiert oder aktualisiert den "counter" für alle Mitarbeiter
 * einer bestimmten Filiale, basierend auf deren Algorithmus-Pattern.
 *
 * Der Counter steuert, an welcher Stelle im Schicht-Pattern (A/E/F)
 * der Mitarbeiter beim Generieren startet.
 */
async function setCounterForMitarbeiter(filialeId) {
  const alleMitarbeiter = await mitarbeiterRepo.getAll();
  const mitarbeiter = alleMitarbeiter.filter(m => m.hauptfilialeid === filialeId);
  if (mitarbeiter.length === 0) return;

  const filiale = await filialenRepo.getById(filialeId);
  if (!filiale) throw new Error('Filiale nicht gefunden');

 const algorithm = await algorithmenRepo.getById(filiale.algorithmid);
  if (!algorithm) throw new Error('Algorithmus nicht gefunden');

  const pattern = algorithm.algorythmus || algorithm.pattern;
  if (!Array.isArray(pattern) || pattern.length === 0) return;

  const patternLen = pattern.length;
  const step = Math.floor(patternLen / 3);

  // Bereits genutzte Counter-Werte ermitteln
  const usedCounters = mitarbeiter
    .filter(m => m.counter !== null && m.counter !== undefined)
    .map(m => m.counter);

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
      await mitarbeiterRepo.updateCounter(m.id, m.counter);
    }
  }
}

module.exports = { setCounterForMitarbeiter };
