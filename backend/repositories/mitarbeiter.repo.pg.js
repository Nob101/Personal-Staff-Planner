/*
Tabelle: mitarbeiter
---------------------------------------------
id                  SERIAL PRIMARY KEY
vorname             TEXT
nachname            TEXT
geburtsdatum        DATE
strasse             TEXT
plz                 TEXT
ort                 TEXT
land                TEXT
telefon1            TEXT
telefon2            TEXT
email1              TEXT
email2              TEXT
stammfiliale        TEXT
nebenfilialen       JSON
arbeitnehmertyp     INTEGER
counter             INTEGER
springer            BOOLEAN
springeralgorithmid INTEGER
anmerkung           TEXT
hauptfilialeid      INTEGER
*/

const pool = require('../db/pool');

// erlaubte Felder für UPDATE
const ALLOWED_FIELDS = [
  'vorname','nachname','geburtsdatum',
  'strasse','plz','ort','land',
  'telefon1','telefon2',
  'email1','email2',
  'stammfiliale','nebenfilialen',
  'arbeitnehmertyp','counter',
  'springer','springeralgorithmid',
  'anmerkung','hauptfilialeid'
];

// -------------------------------------------------------------
// GET ALL
// -------------------------------------------------------------
async function getAll() {
  const result = await pool.query(`SELECT * FROM mitarbeiter ORDER BY id;`);
  return result.rows;
}

// -------------------------------------------------------------
// GET BY ID
// -------------------------------------------------------------
async function getById(id) {
  const result = await pool.query(`SELECT * FROM mitarbeiter WHERE id = $1;`, [id]);
  return result.rows[0] || null;
}

// -------------------------------------------------------------
// ADD
// -------------------------------------------------------------
async function add(m) {

  const query = `
    INSERT INTO mitarbeiter (
      vorname, nachname, geburtsdatum,
      strasse, plz, ort, land,
      telefon1, telefon2, email1, email2,
      stammfiliale, nebenfilialen,
      arbeitnehmertyp, counter,
      springer, springeralgorithmid,
      anmerkung,
      hauptfilialeid
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,
      $12,$13::json,
      $14,$15,$16,$17,$18,
      $19
    )
    RETURNING *;
  `;

  const values = [
    m.vorname ?? null,
    m.nachname ?? null,
    m.geburtsdatum ?? null,
    m.strasse ?? null,
    m.plz ?? null,
    m.ort ?? null,
    m.land ?? null,
    m.telefon1 ?? null,
    m.telefon2 ?? null,
    m.email1 ?? null,
    m.email2 ?? null,
    m.stammfiliale ?? null,
    JSON.stringify(m.nebenfilialen ?? []),
    m.arbeitnehmertyp ?? m.arbeitnehmerTyp ?? 40,
    m.counter ?? null,
    m.springer ?? false,
    m.springeralgorithmid ?? m.springerAlgorithmId ?? null,
    m.anmerkung ?? null,
    m.hauptfilialeid ?? null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// -------------------------------------------------------------
// UPDATE
// -------------------------------------------------------------
async function update(id, updates) {

  const fields = Object.keys(updates).filter(f => ALLOWED_FIELDS.includes(f));

  if (fields.length === 0) return null;

  const setClause = fields
    .map((f, i) => `${f} = $${i + 1}`)
    .join(', ');

  const values = fields.map(f =>
    f === 'nebenfilialen'
      ? JSON.stringify(updates[f] || [])
      : updates[f]
  );

  values.push(id);

  const result = await pool.query(
    `UPDATE mitarbeiter SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`, 
    values
  );

  return result.rows[0] || null;
}

// -------------------------------------------------------------
// DELETE
// -------------------------------------------------------------
async function remove(id) {
  const result = await pool.query(`DELETE FROM mitarbeiter WHERE id = $1;`, [id]);
  return result.rowCount > 0;
}

// -------------------------------------------------------------
// Counter Update
// -------------------------------------------------------------
async function updateCounter(id, counter) {
  await pool.query(
    `UPDATE mitarbeiter SET counter = $1 WHERE id = $2;`,
    [counter, id]
  );
  return true;
}

module.exports = {
  getAll,
  getById,
  add,
  update,
  remove,
  updateCounter
};
