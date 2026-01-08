/**#####################################################
* Das Modul verwaltet die Initialisierung der Datenbank
* --------------------
* ABLAUF:
* 1. Rollen-Check: Stellt sicher, dass die 'admin'-Rolle existiert.
* 2. Schema: Erstellt Tabellen (muss immer zuerst laufen).
* 3. Logik: Lädt PL/pgSQL Funktionen, Trigger und Datenbank-Indizes.
* 4. Seeds: Befüllt Tabellen mit Stammdaten (z.B. Arbeitstypen).
* 5. Admin-User: Erstellt den Initial-User (Passwort via Bcrypt aus .env).
*
* --------------------
*  HINWEIS: Verwendet den 'sqlLoader.js', um alle Dateien in den jeweiligen
* Verzeichnissen automatisch auszuführen.
*/
 
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
 
const { loadSqlFiles } = require('./sqlLoader');
const saltRounds = 10;
 
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});
 
async function initDatabase() {
    const client = await pool.connect();
 
    try {
        const markusPassword = process.env.INITIAL_MARKUS_PASSWORD;
        const adminRole = process.env.DB_ROLE_ADMIN_PASSWORD;
 
        if (!markusPassword || !adminRole) {
            throw new Error(`Config-Passwörter fehlen in der .env!`);
        }
 
        console.log("--- DB-Initialisierung gestartet ---");
 
        await client.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
                    EXECUTE format('CREATE ROLE admin LOGIN PASSWORD %L SUPERUSER', '${adminRole}');
                END IF;
            END $$;
        `);
 
        await client.query('BEGIN');
 
        // Externe Skripte => laden
        // HINWEIS: prevent_double_booking Trigger gellöscht
        const schemaDir = __dirname;
        
        const functionsDir = path.resolve(__dirname, '../functions');
        const triggersDir = path.resolve(__dirname, '../triggers');
        const indexesDir = path.resolve(__dirname, '../indexes');
        const seedsDir = path.resolve(__dirname, '../seeds');
 
        // erst das Schema laden!!!!!!! dann alles andere
        // Funktionen, Trigger usw. ...und Seeds erst zum Schluss
 
        // erstens
        await loadSqlFiles(client, [schemaDir]);
 
        // zweitens
        // console.log("Lade externe SQL-Skripte...");
        await loadSqlFiles(client, [functionsDir, triggersDir, indexesDir]);
 
        // drittens
        await loadSqlFiles(client, [seedsDir]);
 
 
         // Admin-User
        const hashPassword = await bcrypt.hash(markusPassword, saltRounds);
 
        await client.query(`
            INSERT INTO users (username, password_hash, role)
            VALUES ('markus', $1, 'admin') ON CONFLICT (username) DO NOTHING;
        `, [hashPassword]);
 
        await client.query('COMMIT');
        console.log("Datenbank erfolgreich an Backend-Wünsche angepasst.");
 
 
    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error("DB-Initialisierung fehlgeschlagen:", err.message);
    } finally {
        client.release();
    }
}
 
 
 
module.exports = {
    query: (text, params) => pool.query(text, params),
    initDatabase,
};