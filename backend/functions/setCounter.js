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

  // Plausibilitätscheck: ohne gültige Pattern-Länge oder ohne MA keine Verteilung möglich
  if (!Number.isFinite(L) || L <= 0 || n === 0) return [];

  // Gleichmäßiger Abstand (kann Kommazahl sein)
  // Wir runden später mit Math.floor()
  const step = L / n;

  const used = new Set(); // Merkt sich bereits vergebene Startpunkte
  const result = [];

  for (let i = 0; i < n; i++) {
    // Vorschlag: gleichmäßiger Startpunkt
    let start = Math.floor(i * step) % L;

    // Falls der Startpunkt schon belegt ist -> nächster freier Slot
    // tries < L verhindert Endlosschleifen bei extremen Sonderfällen
    let tries = 0;
    while (used.has(start) && tries < L) {
      start = (start + 1) % L;
      tries++;
    }

    used.add(start);

    // Ergebniszuordnung (mnr bleibt stabil)
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
 * Warum werden die Counter "immer neu" gesetzt?
 * - Damit bestehende Kollisionen (z.B. zwei identische Counter) automatisch
 *   repariert werden und nicht dauerhaft bestehen bleiben.
 */
async function setCounterForMitarbeiter(fnr) {
  fnr = Number(fnr);

  // 1) Mitarbeiter dieser Filiale laden
  const alleMitarbeiter = await mitarbeiterRepo.getAllBase({ onlyActive: true }); //soft delete beachten  
  const inFiliale = alleMitarbeiter.filter(
    (m) => Number(m.hauptfiliale_fnr) === fnr
  );

  // Keine Mitarbeiter -> nichts zu tun
  if (inFiliale.length === 0) return;

  // 2) Filiale laden (um algorithmid zu bekommen)
  const filiale = await filialenRepo.getById(fnr);
  if (!filiale) throw new Error("Filiale nicht gefunden");

  // Filial-Pattern laden
  const filPattern = await getAlgorithmus(filiale.algorithmid);
  if (!Array.isArray(filPattern) || filPattern.length === 0) {
    throw new Error(`Algorithmus fehlt/leer für Filiale fnr=${fnr}`);
  }

  // 3) Split: normale vs. springer
  const normale = inFiliale.filter((m) => m.springer !== true);
  const springer = inFiliale.filter((m) => m.springer === true);

  // --------------------------------------------------------------------------
  // A) Normale Mitarbeiter gleichmäßig über das Filial-Pattern verteilen
  // --------------------------------------------------------------------------
  // Sortierung sorgt dafür, dass die Verteilung deterministisch ist:
  // ohne Sortierung könnte die DB-Reihenfolge wechselnd sein.
  normale.sort((a, b) => Number(a.mnr) - Number(b.mnr));

  const normalAssignments = assignCountersEvenly(normale, filPattern.length);

  // Counter persistieren (DB)
  for (const a of normalAssignments) {
    await mitarbeiterRepo.updateCounter(a.mnr, a.counter);
  }

  // --------------------------------------------------------------------------
  // B) Springer separat behandeln (pro springeralgorithmid)
  // --------------------------------------------------------------------------
  // Idee:
  // - Springer können ein anderes Pattern haben als die Filiale.
  // - Deshalb werden sie nach Algorithmus-ID gruppiert und je Gruppe verteilt.
  const groups = new Map(); // algoId -> [mitarbeiter,...]

  for (const m of springer) {
    // Falls springeralgorithmid fehlt: fallback auf Filial-Algorithmus
    const algoId = Number(m.springeralgorithmid ?? filiale.algorithmid);

    if (!groups.has(algoId)) groups.set(algoId, []);
    groups.get(algoId).push(m);
  }

  // Jede Springer-Gruppe separat verteilen
  for (const [algoId, group] of groups.entries()) {
    group.sort((a, b) => Number(a.mnr) - Number(b.mnr));

    const sprPattern = await getAlgorithmus(algoId);

    // Wenn Springer-Pattern ungültig ist -> Fallback auf Filial-Pattern
    if (!Array.isArray(sprPattern) || sprPattern.length === 0) {
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