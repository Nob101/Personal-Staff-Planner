// Importiere Pool aus dem pg-Modul
const { Pool } = require('pg');

// Neue Verbindung (Pool) zur Datenbank
const pool = new Pool({
  user: 'postgres',       // oder dein DB-User
  host: 'localhost',
  database: 'dienstplan', // Name der DB
  password: 'password',   // Passwort (oder das, was Horst verwendet)
  port: 5432,             // Standardport für PostgreSQL
});

module.exports = pool;
