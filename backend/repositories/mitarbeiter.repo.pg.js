/*
Spalte	                    Typ

id	                        SERIAL PRIMARY KEY
vorname, nachname	          TEXT
geburtsdatum	              DATE
strasse, plz, ort, land	    TEXT
telefon1, telefon2	        TEXT
email1, email2	            TEXT
stammfiliale	              TEXT
nebenfilialen	              JSON
arbeitnehmertyp	            INTEGER
counter	                    INTEGER
springer	                  BOOLEAN
springeralgorithmid	        INTEGER
anmerkung	                  TEXT

*/



// ============================================================================
// 👥 mitarbeiter.repo.pg.js
// ---------------------------------------------------------------------------
// PostgreSQL Repository für Mitarbeiter
// Stellt CRUD-Funktionen sowie Hilfsabfragen zur Verfügung.
// Alle Funktionen geben Promise-basierte Ergebnisse zurück.
// ============================================================================

const pool = require('../db/pool');

// ============================================================================
// 🔹 Alle Mitarbeiter abrufen
// ============================================================================
async function getAll() {
  const query = 'SELECT * FROM mitarbeiter ORDER BY id;';
  const result = await pool.query(query);
  return result.rows;
}

// ============================================================================
// 🔹 Mitarbeiter per ID abrufen
// ============================================================================
async function getById(id) {
  const query = 'SELECT * FROM mitarbeiter WHERE id = $1;';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

// ============================================================================
// 🔹 Neuen Mitarbeiter hinzufügen
// ============================================================================
async function add(m) {
  const query = `
    INSERT INTO mitarbeiter (
      vorname, nachname, geburtsdatum,
      strasse, plz, ort, land,
      telefon1, telefon2, email1, email2,
      stammfiliale, nebenfilialen,
      arbeitnehmertyp, counter,
      springer, springeralgorithmid,
      anmerkung
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,
      $12,$13::json,
      $14,$15,$16,$17,$18
    )
    RETURNING *;
  `;

  const values = [
    m.vorname, m.nachname, m.geburtsdatum,
    m.strasse, m.plz, m.ort, m.land,
    m.telefon1, m.telefon2, m.email1, m.email2,
    m.stammfiliale, JSON.stringify(m.nebenfilialen || []),
    m.arbeitnehmerTyp, m.counter, m.springer, m.springerAlgorithmId,
    m.anmerkung
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// ============================================================================
// 🔹 Mitarbeiter aktualisieren
// ============================================================================
async function update(id, updates) {
  const fields = Object.keys(updates);
  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const values = Object.values(updates);
  values.push(id);

  const query = `UPDATE mitarbeiter SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
  const result = await pool.query(query, values);

  return result.rows[0] || null;
}

// ============================================================================
// 🔹 Mitarbeiter löschen
// ============================================================================
async function remove(id) {
  const query = 'DELETE FROM mitarbeiter WHERE id = $1;';
  await pool.query(query, [id]);
  return true;
}

// ============================================================================
// 🔹 Nur Counter eines Mitarbeiters aktualisieren
// ============================================================================
async function updateCounter(id, counter) {
  const query = 'UPDATE mitarbeiter SET counter = $1 WHERE id = $2;';
  await pool.query(query, [counter, id]);
  return true;
}

// ============================================================================
// 🔹 Verfügbare Mitarbeiter (für Ersatz bei Krankheit/Urlaub)
// ============================================================================
async function getVerfuegbar(filialeId, datum) {
  const query = `
    SELECT *
    FROM mitarbeiter
    WHERE
      (stammfiliale = $1 OR $1 = ANY(ARRAY(SELECT json_array_elements_text(nebenfilialen::json))))
      AND id NOT IN (
        SELECT (dienst->>'mitarbeiterId')::int
        FROM dienstplaene,
             json_array_elements(plan_json->'filialen') filiale,
             json_array_elements(filiale->'plan') tag,
             json_array_elements(tag->'einsatz') dienst
        WHERE tag->>'datum' = $2
          AND dienst->>'schicht' != 'F'
      )
    ORDER BY nachname;
  `;

  const result = await pool.query(query, [filialeId, datum]);
  return result.rows;
}

// ============================================================================
// EXPORT
// ============================================================================
module.exports = {
  getAll,
  getById,
  add,
  update,
  remove,
  updateCounter,
  getVerfuegbar
};
