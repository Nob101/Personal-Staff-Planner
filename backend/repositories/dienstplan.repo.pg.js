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






module.exports = { save };



















/* 
Spalte	                            Typ	                            Beschreibung

id	                                SERIAL                          PRIMARY KEY	
jahr	                              INTEGER	                        z. B. 2025
monat	                              INTEGER	                        z. B. 11
plan_data	                          JSONB	                          enthält den gesamten generierten Plan
created_at	                        TIMESTAMP DEFAULT now()	        Zeitstempel der Erstellung



// Wichtig //
//ALTER TABLE dienstplaene ADD CONSTRAINT unique_jahr_monat UNIQUE (jahr, monat);
// backend/repositories/dienstplan.repo.pg.js

const pool = require('../db/pool');

// -------------------------------------------------------------
// Einen Plan laden – komplette Zeile zurückgeben
//   → { id, jahr, monat, plan_data, created_at }
// -------------------------------------------------------------
async function getByDate(jahr, monat) {
  const result = await pool.query(
    'SELECT * FROM dienstplaene WHERE jahr = $1 AND monat = $2',
    [jahr, monat]
  );
  return result.rows[0] || null;
}

// -------------------------------------------------------------
// Plan speichern – plan_data ist reines JSON des Plans
// -------------------------------------------------------------
async function save(jahr, monat, plan) {
  await pool.query(
    `
    INSERT INTO dienstplaene (jahr, monat, plan_data)
    VALUES ($1, $2, $3)
    ON CONFLICT (jahr, monat)
    DO UPDATE SET plan_data = $3
    `,
    [jahr, monat, plan]
  );
  return true;
}

// -------------------------------------------------------------
// Nur das JSON aktualisieren
// -------------------------------------------------------------
async function updatePlan(jahr, monat, planData) {
  await pool.query(
    `
    UPDATE dienstplaene
       SET plan_data = $3
     WHERE jahr = $1 AND monat = $2
    `,
    [jahr, monat, planData]
  );
  return true;
}

// -------------------------------------------------------------
// Löschen
// -------------------------------------------------------------
async function remove(jahr, monat) {
  const result = await pool.query(
    'DELETE FROM dienstplaene WHERE jahr = $1 AND monat = $2',
    [jahr, monat]
  );
  return result.rowCount > 0;
}

async function getAll() {
  const result = await pool.query(
    'SELECT jahr, monat, created_at FROM dienstplaene ORDER BY jahr DESC, monat DESC'
  );
  return result.rows;
}

module.exports = { getByDate, save, updatePlan, remove, getAll };
 */