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
  const inFiliale = alleMitarbeiter.filter(m => Number(m.hauptfiliale_fnr) === fnr);

  if (inFiliale.length === 0) return;

  // 1) Springer aus der "Counter-Logik" rausnehmen
  const normale = inFiliale.filter(m => m.springer !== true);  
  const springer = inFiliale.filter(m => m.springer === true);

  // 2) Springer Counter fix setzen (damit er die anderen nicht beeinflusst)
  for (const m of springer) {
    
    if (m.counter !== 0) {
      await mitarbeiterRepo.updateCounter(m.mnr, 0);
    }
  }

  if (normale.length === 0) return;

  const filiale = await filialenRepo.getById(fnr);
  if (!filiale) throw new Error("Filiale nicht gefunden");

  const algorithm = await getAlgorithmus(filiale.algorithmid);
  if (!Array.isArray(algorithm) || algorithm.length === 0) {
    throw new Error(`Algorithmus fehlt/leer für Filiale fnr=${fnr}`);
  }

  const patternLen = algorithm.length;
  const step = Math.max(1, Math.floor(patternLen / 3));

  // 3) usedCounters nur von normalen Mitarbeitern
  const usedCounters = normale
    .filter(m => m.counter !== null && m.counter !== undefined && Number.isFinite(Number(m.counter)))
    .map(m => Number(m.counter));

  let nextCounter = usedCounters.length > 0
    ? (Math.max(...usedCounters) + step) % patternLen
    : 0;

  // 4) Neue Counter NUR an normale Mitarbeiter vergeben, die noch keinen haben
  for (const m of normale) {
    if (m.counter === null || m.counter === undefined) {
      await mitarbeiterRepo.updateCounter(m.mnr, nextCounter);
      nextCounter = (nextCounter + step) % patternLen;
    }
  }
}

module.exports = { setCounterForMitarbeiter };
