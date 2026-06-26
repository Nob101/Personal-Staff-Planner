// functions/setCounter.js
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const filialenRepo = require("../repositories/filialen.repo.pg");
const { getAlgorithmus } = require("./algorithmen");

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

async function setCounterForMitarbeiter(fnr) {
  fnr = Number(fnr);

  if (!Number.isInteger(fnr) || fnr <= 0) {
    throw new Error("Ungültige Filialnummer");
  }

  const alleMitarbeiter = await mitarbeiterRepo.getAllBase({
    onlyActive: true,
  });

  const inFiliale = alleMitarbeiter
    .filter((m) => Number(m.hauptfiliale_fnr) === fnr)
    .sort((a, b) => Number(a.mnr) - Number(b.mnr));

  if (inFiliale.length === 0) return;

  const filiale = await filialenRepo.getById(fnr);
  if (!filiale) throw new Error("Filiale nicht gefunden");

  const filPattern = getAlgorithmus(filiale.algorithmid);
  if (!Array.isArray(filPattern) || filPattern.length === 0) {
    throw new Error(`Algorithmus fehlt/leer für Filiale fnr=${fnr}`);
  }

  // Springer werden bewusst NICHT mehr verteilt.
  // Sie dienen als Reserve und werden später im Generator gezielt eingesetzt.
  const normaleMitarbeiter = inFiliale.filter((m) => m.springer !== true);

  const assignments = assignCountersEvenly(
    normaleMitarbeiter,
    filPattern.length,
  );

  for (const a of assignments) {
    await mitarbeiterRepo.updateCounter(a.mnr, a.counter);
  }
}

module.exports = { setCounterForMitarbeiter };



















/* // functions/setCounter.js
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const filialenRepo = require("../repositories/filialen.repo.pg");
const { getAlgorithmus } = require("./algorithmen");

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

async function setCounterForMitarbeiter(fnr) {
  fnr = Number(fnr);

  if (!Number.isInteger(fnr) || fnr <= 0) {
    throw new Error("Ungültige Filialnummer");
  }

  const alleMitarbeiter = await mitarbeiterRepo.getAllBase({
    onlyActive: true,
  });

  const inFiliale = alleMitarbeiter
    .filter((m) => Number(m.hauptfiliale_fnr) === fnr)
    .sort((a, b) => Number(a.mnr) - Number(b.mnr));

  if (inFiliale.length === 0) return;

  const filiale = await filialenRepo.getById(fnr);
  if (!filiale) throw new Error("Filiale nicht gefunden");

  const filPattern = getAlgorithmus(filiale.algorithmid);
  if (!Array.isArray(filPattern) || filPattern.length === 0) {
    throw new Error(`Algorithmus fehlt/leer für Filiale fnr=${fnr}`);
  }

  const normale = inFiliale.filter((m) => m.springer !== true);
  const springer = inFiliale.filter((m) => m.springer === true);

  // Teilzeitkräfte und Vollzeitkräfte trennen
  const teilzeit = normale.filter(
    (m) => Number(m.arbeitnehmertyp ?? 40) < 40
  );
  const vollzeit = normale.filter(
    (m) => Number(m.arbeitnehmertyp ?? 40) >= 40
  );

  // Normale Kräfte gemeinsam verteilen
  const normalAssignments = assignCountersEvenly(normale, filPattern.length);

  const counterByMnr = new Map();
  for (const a of normalAssignments) {
    counterByMnr.set(a.mnr, a.counter);
    await mitarbeiterRepo.updateCounter(a.mnr, a.counter);
  }

  // Wenn es genau eine Teilzeitkraft und genau einen Springer gibt:
  // Springer bekommt denselben Counter wie die Teilzeitkraft
  if (teilzeit.length === 1 && springer.length === 1) {
    const teilzeitCounter = counterByMnr.get(teilzeit[0].mnr) ?? 0;
    await mitarbeiterRepo.updateCounter(springer[0].mnr, teilzeitCounter);
    return;
  }

  // Sonst: bisherige Springer-Logik
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

module.exports = { setCounterForMitarbeiter }; */