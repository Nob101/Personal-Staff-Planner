
// Importiert die 'Pool' Klasse aus dem 'pg' Modul
import { Pool } from 'pg';


// Neue Pool Instanz inklusive Datenbankerbindung (Einstellungen)
// User ; IP der Datenbank; Datenbank inkl Passwort; Port für DB-zugang
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

export default pool;
