// Import des Pools aus dem pg-Modul
const { Pool } = require('pg');
require('dotenv').config();  //Wichtig: werte aus der .env Datei


// Neue Verbindung (Pool) zur Datenbank
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

module.exports = pool;
 