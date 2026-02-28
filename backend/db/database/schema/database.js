/**#####################################################
 * Das Modul verwaltet die Initialisierung der Datenbank
 * --------------------
 * Wichtig:
 * 
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



const pool = require('../../pool.js');  //Neu! da Der Pool wartbarer wird wenn er ausserhalb liegt
const bcrypt = require('bcrypt');
const path = require('path');

require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });

const { loadSqlFiles } = require("./sqlLoader");
const saltRounds = 10;

async function initDatabase() {
  const client = await pool.connect();

  try {
    const markusPassword = process.env.INITIAL_MARKUS_PASSWORD;
    const adminRole = process.env.DB_ROLE_ADMIN_PASSWORD;

    if (!markusPassword || !adminRole) {
      throw new Error(`Config-Passwörter fehlen in der .env!`);
    }
    /**
     * NEU: Wenn DB bereits existiert muss nicht der ganze Block ausgeführt werden
     * kontrolle über PG Inahltsverzeichnis welche Tabellen existieren oder nicht
     */
    const checkTableRes = await client.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables   --'Inhaltsverzeichnis' von Postgres über alle Tabellen
                WHERE table_schema = 'public' 
                AND table_name = 'dienstplaene'
                );
            `);

        const dbExists = checkTableRes.rows[0].exists;
        if(dbExists){
             console.log("--- DB-Existiert bereits. Setup wird Übersprungen ---");
             return ;
        }
    

        console.log("--- DB-Initialisierung gestartet ---");
        // im Do Block da Postgres kein Create Role if not Exists kennt (nicht in der userTabelle)
        // admin hat Superuser Rechte (Create, Delete, usw. DB) '%L' verhindert das Sonderzeichen im Passwort das SQL-Kommando zerstört
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
        // HINWEIS: prevent_double_booking Trigger gelöscht
        const schemaDir = __dirname;
        
        const procedureDir = path.resolve(__dirname, '../procedures');
        const functionsDir = path.resolve(__dirname, '../functions');
        const triggersDir = path.resolve(__dirname, '../triggers');
        const indexesDir = path.resolve(__dirname, '../indexes');
        const seedsDir = path.resolve(__dirname, '../seeds');

        // Erst das Schema laden!
        // Reihenfolge ist wichtig!

        // erstens
        await loadSqlFiles(client, [schemaDir]);
 
        // zweitens
        // console.log("Lade externe SQL-Skripte...");
        await loadSqlFiles(client, [procedureDir, functionsDir]);

        // drittens
        await loadSqlFiles(client, [ triggersDir, indexesDir]);

        // viertens
        await loadSqlFiles(client, [seedsDir]);
        // console.log("....Laden der Skripte beendet");

     // Query Planner bekommt die aktualisierten Datensätze
        await client.query('CALL pr_refresh_indexes();');



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


