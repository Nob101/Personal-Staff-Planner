/*
Spalte	                            Typ	                            Beschreibung

id	                                SERIAL                          PRIMARY KEY	
jahr	                            INTEGER	                        z. B. 2025
monat	                            INTEGER	                        z. B. 11
plan_data	                        JSONB	                        enthält den gesamten generierten Plan
created_at	                        TIMESTAMP DEFAULT now()	        Zeitstempel der Erstellung

*/

// Wichtig //
//ALTER TABLE dienstplaene ADD CONSTRAINT unique_jahr_monat UNIQUE (jahr, monat);



// ============================================================================
// 📅 dienstplan.repo.pg.js
// ---------------------------------------------------------------------------
// PostgreSQL Repository für Dienstpläne
// - Speichert vollständige JSON-Struktur des Dienstplans pro Monat
// - Wird vom Generator und von den Routen verwendet
// ============================================================================

const pool = require('../db/pool');

// ============================================================================
// 🔹 Dienstplan nach Jahr & Monat abrufen
// ============================================================================
async function getByDate(jahr, monat) {
  const query = `
    SELECT *
    FROM dienstplaene
    WHERE jahr = $1 AND monat = $2;
  `;
  const result = await pool.query(query, [jahr, monat]);
  return result.rows[0] || null;
}

// ============================================================================
// 🔹 Dienstplan speichern (Insert oder Update)
// ============================================================================
async function save(planObj) {
  const query = `
    INSERT INTO dienstplaene (jahr, monat, plan_data)
    VALUES ($1, $2, $3::jsonb)
    ON CONFLICT (jahr, monat)
    DO UPDATE SET
      plan_data = EXCLUDED.plan_data,
      created_at = NOW();
  `;

  const values = [
    planObj.jahr,
    planObj.monat,
    JSON.stringify(planObj)
  ];

  await pool.query(query, values);
  return true;
}

// ============================================================================
// 🔹 Dienstplan löschen
// ============================================================================
async function remove(jahr, monat) {
  const query = `
    DELETE FROM dienstplaene
    WHERE jahr = $1 AND monat = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [jahr, monat]);
  return result.rowCount > 0;
}

// ============================================================================
// 🔹 Alle Dienstpläne abrufen
// ============================================================================
async function getAll() {
  const query = `
    SELECT jahr, monat, created_at
    FROM dienstplaene
    ORDER BY jahr DESC, monat DESC;
  `;
  const result = await pool.query(query);
  return result.rows;
}

// ============================================================================
// EXPORT
// ============================================================================
module.exports = {
  getByDate,
  save,
  remove,
  getAll
};
