const pool = require("../db/pool");

async function findByMitarbeiter(mnr) {
  const result = await pool.query(
    `SELECT id, mnr, von, bis, typ, anmerkung
     FROM mitarbeiter_abwesenheit
     WHERE mnr = $1
     ORDER BY von`,
    [mnr],
  );

  return result.rows;
}

async function create({ mnr, von, bis, typ, anmerkung }) {
  const konflikt = await findKonfliktInFiliale({ mnr, von, bis });

  if (konflikt) {
    const err = new Error(
      `In dieser Filiale ist im Zeitraum bereits ${konflikt.vorname} ${konflikt.nachname} abwesend.`,
    );

    err.status = 409;

    throw err;
  }
  const result = await pool.query(
    `INSERT INTO mitarbeiter_abwesenheit (mnr, von, bis, typ, anmerkung)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, mnr, von, bis, typ, anmerkung`,
    [mnr, von, bis, typ, anmerkung ?? null],
  );

  return result.rows[0];
}

async function remove(id) {
  const result = await pool.query(
    `DELETE FROM mitarbeiter_abwesenheit
     WHERE id = $1
     RETURNING id`,
    [id],
  );

  return result.rows[0];
}

async function findByMonat(jahr, monat) {
  const result = await pool.query(
    `
    SELECT 
      a.id,
      a.mnr,
      a.von,
      a.bis,
      a.typ,
      a.anmerkung,
      m.vorname,
      m.nachname,
      f.fnr AS filiale_id,
      f.filialname AS filiale_name
    FROM mitarbeiter_abwesenheit a
    JOIN mitarbeiter m ON m.mnr = a.mnr
    LEFT JOIN filiale f ON f.fnr = m.hauptfiliale_fnr
    WHERE a.von <= make_date($1, $2, 1) + interval '1 month - 1 day'
      AND a.bis >= make_date($1, $2, 1)
    ORDER BY f.filialname, a.von, m.nachname
    `,
    [jahr, monat],
  );

  return result.rows;
}

async function findKonfliktInFiliale({ mnr, von, bis }) {
  const result = await pool.query(
    `
    SELECT a.id, a.mnr, a.von, a.bis, a.typ,
           m.vorname, m.nachname, m.hauptfiliale_fnr
    FROM mitarbeiter_abwesenheit a
    JOIN mitarbeiter m ON m.mnr = a.mnr
    WHERE m.hauptfiliale_fnr = (
      SELECT hauptfiliale_fnr
      FROM mitarbeiter
      WHERE mnr = $1
    )
    AND a.von <= $3
    AND a.bis >= $2
    LIMIT 1
    `,
    [mnr, von, bis],
  );

  return result.rows[0];
}

async function findAll() {
  const result = await pool.query(
    `
    SELECT 
      a.id,
      a.mnr,
      a.von,
      a.bis,
      a.typ,
      a.anmerkung,
      m.vorname,
      m.nachname,
      f.fnr AS filiale_id,
      f.filialname AS filiale_name
    FROM mitarbeiter_abwesenheit a
    JOIN mitarbeiter m ON m.mnr = a.mnr
    LEFT JOIN filiale f ON f.fnr = m.hauptfiliale_fnr
    ORDER BY f.filialname, a.von, m.nachname
    `
  );

  return result.rows;
}

module.exports = {
  findByMitarbeiter,
  create,
  remove,
  findByMonat,
  findKonfliktInFiliale,
  findAll,
};
