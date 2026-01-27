const pool = require("../db/pool");
 
async function save(jahr, monat, datum, mnr, fnr, schicht_typ) {
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
    `select id, jahr, monat,
      to_char(datum, 'YYYY-MM-DD') AS datum,
      mnr, fnr, schicht_typ, anmerkung
     FROM dienstplaene
     WHERE jahr = $1 AND monat = $2
     ORDER BY datum, fnr, mnr`,
    [jahr, monat]
  );
  return result.rows;
}
 
async function getByIdTx(client, id) {
  const r = await client.query(
    `SELECT id, jahr, monat, datum, mnr, fnr, schicht_typ, anmerkung
     FROM dienstplaene
     WHERE id = $1`,
    [id]
  );
  return r.rows[0] ?? null;
}
 
async function dienstShiftTx(client, id, schicht_typ) {
  const r = await client.query(
    `
    UPDATE dienstplaene
    SET schicht_typ = $2
    WHERE id = $1
    RETURNING id, jahr, monat, datum, mnr, fnr, schicht_typ, anmerkung;
    `,
    [id, schicht_typ]
  );
  return r.rows[0] ?? null;
}
 
async function dienstShiftMitErsatzTx(client, id, schicht_typ, fnr) {
  const r = await client.query(
    `
    UPDATE dienstplaene
    SET schicht_typ = $2,
        fnr = $3
    WHERE id = $1
    RETURNING id, jahr, monat, datum, mnr, fnr, schicht_typ, anmerkung;
    `,
    [id, schicht_typ, fnr]
  );
  return r.rows[0] ?? null;
}
 
 
async function findErsatzKandidatenByDienstId(dienstId) {
  const q = `
    SELECT
      d2.id        AS "dienstId",
      d2.mnr       AS "mnr",
      m.vorname    AS "vorname",
      m.nachname   AS "nachname",
      d2.fnr       AS "dienstFNr",
      d2.schicht_typ
    FROM dienstplaene d1
    JOIN dienstplaene d2 ON d2.datum = d1.datum
    JOIN mitarbeiter m ON m.mnr = d2.mnr
    WHERE d1.id = $1
      AND d2.schicht_typ = 'F'
      AND (
        m.hauptfiliale_fnr = d1.fnr
        OR EXISTS (
          SELECT 1
          FROM mitarbeiter_arbeitet_in_filiale mn
          WHERE mn.mnr = m.mnr AND mn.fnr = d1.fnr
        )
      )
    ORDER BY m.nachname, m.vorname;
  `;
  const r = await pool.query(q, [dienstId]);
  return r.rows;
}
 
 
 
 
 
 
 
module.exports = { save, deleteByMonth, getByDate, dienstShiftTx, getByIdTx, dienstShiftMitErsatzTx, findErsatzKandidatenByDienstId };
 