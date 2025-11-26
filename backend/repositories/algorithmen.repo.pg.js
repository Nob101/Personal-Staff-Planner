/*
Spalte	                            Typ	                    Beschreibung
id	                                SERIAL                  PRIMARY KEY	
name	                            TEXT	                z. B. "Standard A/E" oder "Wechsel 2/2/2"
pattern	                            JSONB	                Array aus Buchstaben wie ["A","A","E","E","F","F"]
stunden	                            NTEGER	                Stunden pro Dienst (z. B. 9)

*/



// ============================================================================
// ⚙️ algorithmen.repo.pg.js
// ---------------------------------------------------------------------------
// PostgreSQL Repository für Dienstplan-Algorithmen
// Diese Algorithmen definieren die Schichtmuster (A, E, F usw.)
// und werden pro Filiale zugeordnet.
// ============================================================================

const pool = require('../db/pool');

// ============================================================================
// 🔹 Alle Algorithmen abrufen
// ============================================================================
async function getAll() {
  const result = await pool.query('SELECT * FROM algorithmen ORDER BY id;');
  return result.rows;
}

// ============================================================================
// 🔹 Algorithmus per ID abrufen
// ============================================================================
async function getById(id) {
  const result = await pool.query('SELECT * FROM algorithmen WHERE id = $1;', [id]);
  return result.rows[0] || null;
}

// ============================================================================
// 🔹 Neuen Algorithmus hinzufügen
// ---------------------------------------------------------------------------
// Erwartet z. B. ein Pattern ["A", "A", "E", "E", "F", "F"]
// und eine Stundenanzahl pro Dienst (z. B. 9).
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
// 🔹 Algorithmus aktualisieren
// ============================================================================
async function update(id, updates) {
  // Falls ein Pattern-Array mitgeschickt wurde → in JSON umwandeln
  if (updates.pattern && Array.isArray(updates.pattern)) {
    updates.pattern = JSON.stringify(updates.pattern);
  }

  const fields = Object.keys(updates);
  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const values = Object.values(updates);
  values.push(id);

  const query = `UPDATE algorithmen SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

// ============================================================================
// 🔹 Algorithmus löschen
// ============================================================================
async function remove(id) {
  await pool.query('DELETE FROM algorithmen WHERE id = $1;', [id]);
  return true;
}

// ============================================================================
// EXPORT
// ============================================================================
module.exports = {
  getAll,
  getById,
  add,
  update,
  remove
};
