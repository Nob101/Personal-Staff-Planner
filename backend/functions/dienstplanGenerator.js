const { getAlgorithmus } = require("./algorithmen");
const { getAllDatesOfMonth, getMonthlyHours } = require("./dateUtils");
const { savePlan } = require("./savePlan");
const filialenRepo = require("../repositories/filialen.repo.pg");
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const stundenRepo = require("../repositories/stunden.repo.pg");

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

  const LIMIT_PUFFER_STUNDEN = 10;

  const alleMitarbeiter = await mitarbeiterRepo.getAllBase();
  const alleFilialen = await filialenRepo.getAll();

  const dienste = [];
  await stundenRepo.deleteStunden(monat, jahr);

  for (const filiale of alleFilialen) {
    for (const m of alleMitarbeiter) {
      if (Number(m.hauptfiliale_fnr) !== Number(filiale.fnr)) continue;
      // test logging
      console.log(
        "[GEN] mnr=",
        m.mnr,
        "filiale=",
        filiale.fnr,
        "springer=",
        m.springer,
        "springeralgo=",
        m.springeralgorithmid,
        "filialAlgo=",
        filiale.algorithmid
      );

      const algoId = m.springer
        ? m.springeralgorithmid ?? filiale.algorithmid
        : filiale.algorithmid;

      const algorithm = await getAlgorithmus(algoId);
      if (!Array.isArray(algorithm) || algorithm.length === 0) {
        throw new Error(
          `Algorithmus fehlt/leer für fnr=${filiale.fnr}, mnr=${m.mnr}, algoId=${algoId}`
        );
      }

      const faktor = getFaktorFuerMitarbeiter(m);
      const zielStunden = Math.round(monatsstunden * faktor);
      const limitStunden = zielStunden + LIMIT_PUFFER_STUNDEN;

      let bereits = 0;

      let counter = Number(m.counter);
      if (!Number.isFinite(counter) || counter < 0) counter = 0;

      for (const date of dates) {
        let schicht_typ = algorithm[counter % algorithm.length];

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
      // monatsstunden speichern
      await stundenRepo.saveStunden({
        mnr: m.mnr,
        jahr,
        monat,
        soll_stunden_monat: zielStunden,
        ist_stunden_monat: bereits,
        differenz: bereits - zielStunden,
      });
      await mitarbeiterRepo.updateCounter(m.mnr, counter);
    }
  }

  await savePlan(jahr, monat, dienste);
  return { count: dienste.length };
}

module.exports = { generateDienstplan };
