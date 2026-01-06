const { getAlgorithmus } = require("./algorithmen");
const { getAllDatesOfMonth, getMonthlyHours } = require("./dateUtils");
const { savePlan } = require("./savePlan");
const filialenRepo = require("../repositories/filialen.repo.pg");
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");

function getFaktorFuerMitarbeiter(m) {
  const typNum = Number(m.arbeitnehmertyp ?? 40) || 40;
  return typNum / 40;
}

async function generateDienstplan(year, month) {
  const jahr = Number(year);
  const monat = Number(month);

  const stundenProDienst = 9;
  const monatsstunden = getMonthlyHours(jahr, monat);
  const dates = getAllDatesOfMonth(jahr, monat);

  const LIMIT_PUFFER_STUNDEN = 20;

  const alleMitarbeiter = await mitarbeiterRepo.getAllBase();
  const alleFilialen = await filialenRepo.getAll();

  const dienste = [];

  for (const filiale of alleFilialen) {
    const algorithm = await getAlgorithmus(filiale.algorithmid);
    if (!Array.isArray(algorithm) || algorithm.length === 0) {
      throw new Error(`Algorithmus fehlt/leer für Filiale fnr=${filiale.fnr}`);
    }

    for (const m of alleMitarbeiter) {
      if (Number(m.hauptfiliale_fnr) !== Number(filiale.fnr)) continue;

      const faktor = getFaktorFuerMitarbeiter(m);
      const zielStunden = monatsstunden * faktor;
      const limitStunden = zielStunden + LIMIT_PUFFER_STUNDEN;

      let bereits = 0;

      let counter = Number(m.counter);
      if (!Number.isFinite(counter) || counter < 0) counter = 0;

      for (const date of dates) {
        let schicht_typ = algorithm[counter % algorithm.length];

        // (optional) mini-limit – kannst du auch vorerst rauslassen
        if (schicht_typ !== "F" && bereits >= limitStunden) {
          schicht_typ = "F";
        }

        dienste.push({
          jahr,
          monat,
          datum: date,
          mnr: m.mnr,
          fnr: filiale.fnr,
          schicht_typ,
        });

        if (schicht_typ !== "F") bereits += stundenProDienst;

        counter = (counter + 1) % algorithm.length;
      }

      await mitarbeiterRepo.updateCounter(m.mnr, counter);
    }
  }

  await savePlan(jahr, monat, dienste);
  return { count: dienste.length };
}

module.exports = { generateDienstplan };

