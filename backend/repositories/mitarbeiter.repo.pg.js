const pool = require('../db/pool');
/*
// zentrale Spaltenliste, damit wir sie nicht mehrfach tippen
const COLUMNS = `
  mnr, vorname, nachname, haupttelefon, hauptemail,
  strasse, plz, ort, land, stammfiliale_nr, anr, dvnr
`;

module.exports = {
  // Liste aller Mitarbeiter
  list: async () => {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM mitarbeiter ORDER BY mnr`);
    return rows;
  },

  // Einzelner Mitarbeiter per MNr
  get: async (mnr) => {
    const { rows } = await pool.query(
      `SELECT ${COLUMNS} FROM mitarbeiter WHERE mnr = $1`,
      [mnr]
    );
    return rows[0] || null;
  },

  // Mitarbeiter anlegen
  create: async (dto = {}) => {
    const {
      vorname, nachname, haupttelefon, hauptemail,
      strasse, plz, ort, land,
      stammfiliale_nr, anr, dvnr
    } = dto;

    const { rows } = await pool.query(
      `INSERT INTO mitarbeiter
        (vorname, nachname, haupttelefon, hauptemail, strasse, plz, ort, land, stammfiliale_nr, anr, dvnr)
       VALUES
        ($1,      $2,       $3,           $4,         $5,      $6,  $7,  $8,   $9,              $10, $11)
       RETURNING ${COLUMNS}`,
      [
        vorname, nachname,
        haupttelefon ?? null, hauptemail ?? null,
        strasse ?? null, plz ?? null, ort ?? null, land ?? null,
        stammfiliale_nr ?? null,
        (anr ?? 1),                  // Default 1 = „Verfügbar“
        dvnr ?? null
      ]
    );
    return rows[0];
  },

  // Mitarbeiter aktualisieren
  update: async (mnr, dto = {}) => {
    const {
      vorname, nachname, haupttelefon, hauptemail,
      strasse, plz, ort, land,
      stammfiliale_nr, anr, dvnr
    } = dto;

    const { rows } = await pool.query(
      `UPDATE mitarbeiter SET
         vorname          = COALESCE($2, vorname),
         nachname         = COALESCE($3, nachname),
         haupttelefon     = COALESCE($4, haupttelefon),
         hauptemail       = COALESCE($5, hauptemail),
         strasse          = COALESCE($6, strasse),
         plz              = COALESCE($7, plz),
         ort              = COALESCE($8, ort),
         land             = COALESCE($9, land),
         stammfiliale_nr  = COALESCE($10, stammfiliale_nr),
         anr              = COALESCE($11, anr),
         dvnr             = COALESCE($12, dvnr)
       WHERE mnr = $1
       RETURNING ${COLUMNS}`,
      [
        mnr,
        vorname, nachname, haupttelefon, hauptemail,
        strasse, plz, ort, land,
        stammfiliale_nr, anr, dvnr
      ]
    );
    return rows[0] || null;
  },

  // Mitarbeiter löschen
  remove: async (mnr) => {
    const res = await pool.query(`DELETE FROM mitarbeiter WHERE mnr = $1`, [mnr]);
    return res.rowCount > 0;
  }
};
*/



const COLUMNS = `mnr, vorname, nachname`;

module.exports = {
  list: async () => {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM mitarbeiter ORDER BY mnr`);
    return rows;
  },

  get: async (mnr) => {
    const { rows } = await pool.query(`SELECT ${COLUMNS} FROM mitarbeiter WHERE mnr = $1`, [mnr]);
    return rows[0] || null;
  },

  create: async (dto = {}) => {
    const { vorname, nachname } = dto;
    const { rows } = await pool.query(
      `INSERT INTO mitarbeiter (vorname, nachname)
       VALUES ($1, $2)
       RETURNING ${COLUMNS}`,
      [vorname || null, nachname || null]
    );
    return rows[0];
  },

  update: async (mnr, dto = {}) => {
    const { vorname, nachname } = dto;
    const { rows } = await pool.query(
      `UPDATE mitarbeiter
         SET vorname = COALESCE($2, vorname),
             nachname = COALESCE($3, nachname)
       WHERE mnr = $1
       RETURNING ${COLUMNS}`,
      [mnr, vorname, nachname]
    );
    return rows[0] || null;
  },

  remove: async (mnr) => {
    const res = await pool.query(`DELETE FROM mitarbeiter WHERE mnr = $1`, [mnr]);
    return res.rowCount > 0;
  }
};
