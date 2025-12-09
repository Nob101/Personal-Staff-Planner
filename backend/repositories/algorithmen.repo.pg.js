/*
Spalte	                            Typ	                    Beschreibung
id	                                SERIAL                  PRIMARY KEY	
name	                              TEXT	                  z. B. "Standard A/E" oder "Wechsel 2/2/2"
pattern	                            JSONB	                  Array aus Buchstaben wie ["A","A","E","E","F","F"]
stunden	                            INTEGER	                Stunden pro Dienst (z. B. 9)

*/

const pool = require("../db/pool");

const ALLOWED_FIELDS = ["name", "pattern", "stunden"];

// ============================================================================
// GET ALL
// ============================================================================
async function getAll() {
  const result = await pool.query("SELECT * FROM algorithmen ORDER BY id;");
  return result.rows;
}

// ============================================================================
// GET BY ID
// ============================================================================
async function getById(id) {
  const result = await pool.query("SELECT * FROM algorithmen WHERE id = $1;", [
    id,
  ]);
  return result.rows[0] || null;
}

// ============================================================================
// ADD
// ============================================================================
async function add(a) {
  const query = `
    INSERT INTO algorithmen (name, pattern, stunden)
    VALUES ($1, $2::jsonb, $3)
    RETURNING *;
  `;
  const values = [a.name, JSON.stringify(a.pattern), a.stunden];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// ============================================================================
// UPDATE
// ============================================================================
async function update(id, updates) {
  const clean = {};

  for (const key of ALLOWED_FIELDS) {
    if (updates[key] !== undefined) {
      if (key === "pattern" && Array.isArray(updates.pattern)) {
        clean.pattern = JSON.stringify(updates.pattern);
      } else {
        clean[key] = updates[key];
      }
    }
  }

  const fields = Object.keys(clean);
  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const values = fields.map((f) => clean[f]);

  values.push(id);

  const query = `
    UPDATE algorithmen
    SET ${setClause}
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

// ============================================================================
// REMOVE
// ============================================================================
async function remove(id) {
  const result = await pool.query("DELETE FROM algorithmen WHERE id = $1;", [
    id,
  ]);
  return result.rowCount > 0;
}

module.exports = {
  getAll,
  getById,
  add,
  update,
  remove,
};
