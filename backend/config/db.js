
// Importiert die 'Pool' Klasse aus dem 'pg' Modul
import { Pool } from 'pg';

// Neue Pool-Instanz inklusive Datenbankverbindung (lokal)
const pool = new Pool({
  user: 'alex',           // dein PostgreSQL-Benutzername
  host: 'localhost',      // da alles lokal läuft
  database: 'dienstplan', // dein Datenbankname
  password: '1234',       // dein Passwort (das du bei der DB-Erstellung festgelegt hast)
  port: 5432,             // Standardport für PostgreSQL
});

export default pool;
