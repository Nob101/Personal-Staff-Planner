// functions/setCounter.js
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const filialenRepo = require("../repositories/filialen.repo.pg");
const { getAlgorithmus } = require("./algorithmen");

/**
 * ============================================================================
 * Ziel dieses Moduls
 * ----------------------------------------------------------------------------
 * Beim Generieren des Dienstplans läuft jeder Mitarbeiter ein Schicht-Pattern
 * (z.B. A,A,E,E,F,F) zyklisch durch. Der "counter" bestimmt dabei den Startpunkt.
 *
 * Problem ohne saubere Counter-Verteilung:
 * - Wenn zwei Mitarbeiter denselben counter haben, erhalten sie denselben Plan
 *   (sie "laufen" synchron durch dasselbe Pattern).
 *
 * Lösung:
 * - Die Counter werden je Filiale bewusst gleichmäßig über die Pattern-Länge verteilt.
 * - Springer werden separat behandelt, weil sie evtl. ein anderes Pattern besitzen.
 * ============================================================================
 */

/**
 * Hilfsfunktion: assignCountersEvenly(...)
 * ----------------------------------------------------------------------------
 * Verteilt Start-Counter möglichst gleichmäßig über ein Pattern mit Länge L.
 * Beispiel:
 * - Pattern-Länge L = 12
 * - Mitarbeiter n = 4
 * -> Startpunkte etwa bei 0, 3, 6, 9
 *
 * Zusätzlich wird versucht, Kollisionen zu vermeiden:
 * Falls ein berechneter Startpunkt bereits vergeben ist, wird der nächste freie
 * Index (mit wrap-around) gewählt.
 *
 * Rückgabe:
 * - Array von Objekten: [{ mnr, counter }, ...]
 */
function assignCountersEvenly(mitarbeiterList, patternLen) {
  const L = Number(patternLen);
  const n = mitarbeiterList.length;

  if (!Number.isFinite(L) || L <= 0 || n === 0) return [];

  const step = L / n;
  const used = new Set();
  const result = [];

  for (let i = 0; i < n; i++) {
    let start = Math.floor(i * step) % L;

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
 * setCounterForMitarbeiter(fnr)
 * ----------------------------------------------------------------------------
 * Setzt/aktualisiert den Counter für alle Mitarbeiter einer Filiale.
 *
 * Vorgehen:
 * 1) Mitarbeiter der Filiale laden
 * 2) Filial-Algorithmus (Pattern) laden
 * 3) Normale Mitarbeiter:
 *    - über das Filial-Pattern gleichmäßig verteilen
 * 4) Springer:
 *    - nach springeralgorithmid gruppieren
 *    - jede Gruppe separat über ihr Pattern verteilen
 *
 * Warum werden die Counter immer neu gesetzt?
 * - Damit bestehende Kollisionen automatisch repariert werden
 *   und nicht dauerhaft bestehen bleiben.
 */
async function setCounterForMitarbeiter(fnr) {
  fnr = Number(fnr);

  if (!Number.isInteger(fnr) || fnr <= 0) {
    throw new Error("Ungültige Filialnummer");
  }

  const alleMitarbeiter = await mitarbeiterRepo.getAllBase({
    onlyActive: true,
  });

  const inFiliale = alleMitarbeiter.filter(
    (m) => Number(m.hauptfiliale_fnr) === fnr
  );

  if (inFiliale.length === 0) return;

  const filiale = await filialenRepo.getById(fnr);
  if (!filiale) throw new Error("Filiale nicht gefunden");

  const filPattern = getAlgorithmus(filiale.algorithmid);
  if (!Array.isArray(filPattern) || filPattern.length === 0) {
    throw new Error(`Algorithmus fehlt/leer für Filiale fnr=${fnr}`);
  }

  const normale = inFiliale.filter((m) => m.springer !== true);
  const springer = inFiliale.filter((m) => m.springer === true);

  normale.sort((a, b) => Number(a.mnr) - Number(b.mnr));

  const normalAssignments = assignCountersEvenly(normale, filPattern.length);

  for (const a of normalAssignments) {
    await mitarbeiterRepo.updateCounter(a.mnr, a.counter);
  }

  const groups = new Map();

  for (const m of springer) {
    const algoId = Number(m.springeralgorithmid ?? filiale.algorithmid);

    if (!groups.has(algoId)) groups.set(algoId, []);
    groups.get(algoId).push(m);
  }

  for (const [algoId, group] of groups.entries()) {
    group.sort((a, b) => Number(a.mnr) - Number(b.mnr));

    let sprPattern;
    try {
      sprPattern = getAlgorithmus(algoId);
    } catch {
      sprPattern = filPattern;
    }

    const sprAssignments = assignCountersEvenly(group, sprPattern.length);

    for (const a of sprAssignments) {
      await mitarbeiterRepo.updateCounter(a.mnr, a.counter);
    }
  }
}

module.exports = { setCounterForMitarbeiter };