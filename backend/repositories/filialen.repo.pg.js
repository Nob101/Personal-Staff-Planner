/*
Spalte	                                Typ	                            Beschreibung

id	                                    SERIAL                          PRIMARY KEY	
filialname	                            TEXT	                        Name oder Kürzel der Filiale
farbe	                                TEXT	                        HEX-Farbcode fürs Frontend
ort	                                    TEXT	                        Standort
strasse	                                TEXT	                        Adresse
plz	                                    TEXT	                        Postleitzahl
land	                                TEXT	                        Land
email	                                TEXT	                        Kontaktadresse
telefon	                                TEXT	                        Telefonnummer
algorithmid	                        INTEGER	                        Referenz auf Algorithmus
*/



// ============================================================================
// 🏢 filialen.repo.pg.js
// ---------------------------------------------------------------------------
// PostgreSQL Repository für Filialen
// Stellt CRUD-Funktionen sowie eine Zusatzfunktion zur Verfügung, um
// Filialen anhand ihres Kürzels zu finden (z. B. "PINK").
// ============================================================================

const pool = require('../db/pool');

// ============================================================================
// 🔹 Alle Filialen abrufen
// ============================================================================
async function getAll() {
  const result = await pool.query('SELECT * FROM filialen ORDER BY id;');
  return result.rows;
}

// ============================================================================
// 🔹 Filiale per ID abrufen
// ============================================================================
async function getById(id) {
  const result = await pool.query('SELECT * FROM filialen WHERE id = $1;', [id]);
  return result.rows[0] || null;
}

// ============================================================================
// 🔹 Filiale per Kürzel (Name) abrufen
// ============================================================================
async function getByKuerzel(kuerzel) {
  const result = await pool.query('SELECT * FROM filialen WHERE filialname ILIKE $1;', [kuerzel]);
  return result.rows[0] || null;
}

// ============================================================================
// 🔹 Neue Filiale hinzufügen
// ============================================================================
async function add(f) {
  const query = `
    INSERT INTO filialen (
      filialname, farbe, ort, strasse,
      plz, land, email, telefon, algorithmid
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *;
  `;
  const values = [
    f.filialname, f.farbe, f.ort, f.strasse,
    f.plz, f.land, f.email, f.telefon, f.algorithmId
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

// ============================================================================
// 🔹 Filiale aktualisieren
// ============================================================================
async function update(id, updates) {
  // camelCase in snake_case mappen
  if (updates.algorithmId) {
    updates.algorithmid = updates.algorithmId;
    delete updates.algorithmId;
  }

  const fields = Object.keys(updates);
  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
  const values = Object.values(updates);
  values.push(id);

  const query = `UPDATE filialen SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

// ============================================================================
// 🔹 Filiale löschen
// ============================================================================
async function remove(id) {
  await pool.query('DELETE FROM filialen WHERE id = $1;', [id]);
  return true;
}

// ============================================================================
// EXPORT
// ============================================================================
module.exports = {
  getAll,
  getById,
  getByKuerzel,
  add,
  update,
  remove
};
