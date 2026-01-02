const dienstplanRepo   = require('../repositories/dienstplan.repo.pg');

async function savePlan(jahr, monat, dienste) {
  for (const d of dienste) {
    await dienstplanRepo.save(
      jahr,
      monat,
      d.datum,
      d.mnr,
      d.fnr,
      d.schicht_typ
    );
  }
}


module.exports = { savePlan };