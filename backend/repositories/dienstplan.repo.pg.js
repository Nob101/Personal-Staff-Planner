const pool = require('../db/pool');




async function save(jahr,monat,datum,mnr,fnr,schicht_typ) {
  await pool.query(
    `
    INSERT INTO dienstplaene (jahr, monat, datum, mnr, fnr, schicht_typ)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [jahr, monat, datum, mnr, fnr, schicht_typ]
  );
  return true;  
}



async function deleteByMonth(jahr, monat) {
  const result = await pool.query(
    `
    DELETE FROM dienstplaene
    WHERE jahr = $1
      AND monat = $2
    `,
    [jahr, monat]
  );

  return result.rowCount; // wie viele Einträge gelöscht wurden
}

async function getByDate(jahr, monat) {
  const result = await pool.query(
    `SELECT id, jahr, monat, datum, mnr, fnr, schicht_typ, anmerkung
     FROM dienstplaene
     WHERE jahr = $1 AND monat = $2
     ORDER BY datum, fnr, mnr`,
    [jahr, monat]
  );
  return result.rows;
}





module.exports = { save, deleteByMonth, getByDate };



