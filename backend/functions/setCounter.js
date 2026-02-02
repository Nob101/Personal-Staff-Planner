// functions/setCounter.js
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const filialenRepo = require("../repositories/filialen.repo.pg");
const { getAlgorithmus } = require("./algorithmen");

/**
 * Hilfsfunktion:
 * verteilt Start-Counter gleichmäßig über eine Pattern-Länge (0..L-1),
 * ohne doppelte Startpunkte (wenn möglich).
 */
function assignCountersEvenly(mitarbeiterList, patternLen) {
  const L = Number(patternLen);
  const n = mitarbeiterList.length;

  if (!Number.isFinite(L) || L <= 0 || n === 0) return [];

  // gleichmäßiger Abstand (kann Kommazahl sein)
  const step = L / n;

  const used = new Set(); // belegte Startpunkte
  const result = [];

  for (let i = 0; i < n; i++) {
    // Startpunkt-Vorschlag (gleichmäßig verteilt)
    let start = Math.floor(i * step) % L;

    // Kollision vermeiden: nächster freier Slot (wrap-around)
    let tries = 0;
    while (used.has(start) && tries < L) {
      start = (start + 1) % L;
      tries++;
    }

    used.add(start);
    result.push({ mnr: mitarbeiterList[i].mnr, counter: start });
  }

  return result;
}

/**
 * Setzt/aktualisiert Counter für ALLE Mitarbeiter einer Filiale:
 * - Normale Mitarbeiter: gleichmäßig über Filial-Algorithmus
 * - Springer: getrennt pro springeralgorithmid gleichmäßig über Springer-Algorithmus
 *
 * Warum "immer neu setzen"?
 * Weil sonst alte Kollisionen (z.B. 2 gleiche Counter) nie repariert werden.
 */
async function setCounterForMitarbeiter(fnr) {
  fnr = Number(fnr);

  // 1) Mitarbeiter dieser Filiale laden
  const alleMitarbeiter = await mitarbeiterRepo.getAllBase();
  const inFiliale = alleMitarbeiter.filter(
    (m) => Number(m.hauptfiliale_fnr) === fnr
  );

  if (inFiliale.length === 0) return;

  // 2) Filiale + Filial-Algorithmus laden
  const filiale = await filialenRepo.getById(fnr);
  if (!filiale) throw new Error("Filiale nicht gefunden");

  const filPattern = await getAlgorithmus(filiale.algorithmid);
  if (!Array.isArray(filPattern) || filPattern.length === 0) {
    throw new Error(`Algorithmus fehlt/leer für Filiale fnr=${fnr}`);
  }

  // 3) Split: normale vs springer
  const normale = inFiliale.filter((m) => m.springer !== true);
  const springer = inFiliale.filter((m) => m.springer === true);

  // ---- A) Normale MA verteilen über Filial-Pattern
  // Sortierung ist wichtig, damit das Ergebnis stabil bleibt (nicht "zufällig" je nach DB-Reihenfolge)
  normale.sort((a, b) => Number(a.mnr) - Number(b.mnr));

  const normalAssignments = assignCountersEvenly(normale, filPattern.length);

  for (const a of normalAssignments) {
    await mitarbeiterRepo.updateCounter(a.mnr, a.counter);
  }

  // ---- B) Springer: pro springeralgorithmid gruppieren und separat verteilen
  // Beispiel: 2 Springer mit AlgoId=1 -> verteilen über Pattern von Algo 1
  const groups = new Map(); // algoId -> array of MA
  for (const m of springer) {
    const algoId = Number(m.springeralgorithmid ?? filiale.algorithmid);
    if (!groups.has(algoId)) groups.set(algoId, []);
    groups.get(algoId).push(m);
  }

  for (const [algoId, group] of groups.entries()) {
    group.sort((a, b) => Number(a.mnr) - Number(b.mnr));

    const sprPattern = await getAlgorithmus(algoId);
    if (!Array.isArray(sprPattern) || sprPattern.length === 0) {
      // wenn Springer-Algorithmus kaputt: fallback auf Filial-Pattern
      const fallback = assignCountersEvenly(group, filPattern.length);
      for (const a of fallback) {
        await mitarbeiterRepo.updateCounter(a.mnr, a.counter);
      }
      continue;
    }

    const sprAssignments = assignCountersEvenly(group, sprPattern.length);
    for (const a of sprAssignments) {
      await mitarbeiterRepo.updateCounter(a.mnr, a.counter);
    }
  }
}

module.exports = { setCounterForMitarbeiter };