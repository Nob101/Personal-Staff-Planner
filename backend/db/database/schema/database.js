<<<<<<< HEAD

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

const pool = require('../../pool.js');  //Neu! da Der Pool wartbarer wird wenn er ausserhalb liegt
const bcrypt = require('bcrypt');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });

const { loadSqlFiles } = require('./sqlLoader'); 
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
 * NEU Wenn DB bereits existiert muss nicht der ganze Block ausgeführt werden
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

        // erst das Schema laden!!!!!!! dann alles andere
        // Reihenfolge ist wichtig!!!

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
        console.log("Datenbank erfolgreich initialisiert.");


    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error("DB-Initialisierung fehlgeschlagen:", err.message);
    } finally {
        client.release();
    }
}



=======
/**
 * DB-INITIALISIERUNG & SCHEMA-MANAGEMENT
 * 
 * ---------------------------------------------------------------------------
 * STRUKTUR:
 *       - Stammdaten: Filiale, Arbeitstyp, Mitarbeiter, Algorithmen
 *       - Logik: Seeding der Basis-Daten & User (Markus)
 *       - SoC (Separation of Concerns): Laden von externen Triggern & Funktionen
 * 
 * LOGIK:
 *      - Transaktionsschutz (BEGIN/COMMIT)
 *      - Automatische FK-Constraints via DO-Block
 *      - Dynamisches Laden von SQL-Skripten aus Unterordnern
 */



const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');



// Pfad-Konfiguration für .env (schema -> database -> db -> backend)
const envPath = path.resolve(__dirname, '../../../.env');
require('dotenv').config({ path: envPath });

const { loadSqlFiles } = require('./sqlLoader'); 

// 2^10  salt-> zufällige zeichenfolge VOR das Password (automatisch in bcrypt)
const saltRounds = 10;

// Verbindung zum PostgreSQL RDBMS
const pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT || 5432,
  });

/**
 * Initialisiert das Datenbank-Schema und führt notwendiges Seeding durch.
 */
async function initDatabase() {
  const client = await pool.connect();

  try {
    // Prüfemn der Pwd aus .env
    const markusPassword = process.env.INITIAL_MARKUS_PASSWORD;
    const adminRole = process.env.DB_ROLE_ADMIN_PASSWORD;

    if (!markusPassword || !adminRole) {
      throw new Error(`conf-pwd fehlen in der .env!`);
    }

    console.log("--- DB-Initialisierung gestartet --- (lol es lebt)");

    //  'admin' sicherstellen (wartung) wie in C %s
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'admin') THEN
          EXECUTE format('CREATE ROLE admin LOGIN PASSWORD %L SUPERUSER', '${adminRole}');
        END IF;
      END $$;
    `);

    // Transaktionsmanagemetn start
    await client.query('BEGIN');

    // Tabellen-Structur 
    // console.log("Erstelle Tabellen...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS filiale (
        fnr SERIAL PRIMARY KEY,
        filialname VARCHAR(50),
        fkurzl VARCHAR(15) UNIQUE,
        strasse VARCHAR(50),
        plz VARCHAR(10),
        ort VARCHAR(50),
        land VARCHAR(55) DEFAULT 'Österreich',
        farbe VARCHAR(20) DEFAULT '#3498db'
      );

      CREATE TABLE IF NOT EXISTS arbeitstyp (
        akurzl VARCHAR(6) PRIMARY KEY,
        text VARCHAR(55) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS algorithmen (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        stunden INTEGER DEFAULT 9
      );

      CREATE TABLE IF NOT EXISTS mitarbeiter (
        mnr SERIAL PRIMARY KEY,
        vorname VARCHAR(35) NOT NULL,
        nachname VARCHAR(45) NOT NULL,
        fkurzl VARCHAR(15), 
        akurzl VARCHAR(6),
        counter INTEGER NOT NULL DEFAULT 0,
        hauptfiliale_fnr INTEGER REFERENCES filiale(fnr) ON DELETE SET NULL,
        stunden_soll INTEGER DEFAULT 160,
        springer BOOLEAN DEFAULT FALSE,
        algorithmus_id INTEGER REFERENCES algorithmen(id) 
      );

      CREATE TABLE IF NOT EXISTS dienstplaene (
        id SERIAL PRIMARY KEY,
        jahr INTEGER NOT NULL,
        monat INTEGER NOT NULL,
        datum DATE NOT NULL,
        mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
        fnr INTEGER NOT NULL REFERENCES filiale(fnr) ON DELETE CASCADE,
        schicht_typ VARCHAR(6) REFERENCES arbeitstyp(akurzl),
        erstellt_am TIMESTAMP DEFAULT now(),
        UNIQUE(datum, mnr, fnr, schicht_typ)
      );

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'admin'
      );
    `);

    //Seeding (Basis-Daten) befüllen der ersten Daten
    
    await client.query(`
      INSERT INTO arbeitstyp (akurzl, text) VALUES 
        ('A', 'Anfangsdienst'),
        ('E', 'Enddienst'),
        ('F', 'Frei'),
        ('K', 'Krankenstand'), 
        ('AZ', 'Arzttermin'), 
        ('U', 'Urlaub'),
        ('Z', 'Zeitausgleich'),
        ('D', 'Dienstverhinderung §8'),
        ('P', 'Pflegefreistellung')
      ON CONFLICT (akurzl) DO NOTHING;
    `);

    // Admin-User 'markus' anlegen
    const hashPassword = await bcrypt.hash(markusPassword, saltRounds);
    await client.query(`
      INSERT INTO users (username, password_hash, role)
      VALUES ('markus', $1, 'admin') ON CONFLICT (username) DO NOTHING;
    `, [hashPassword]);

    // 4. Constraints (Sicherstellung der Datenintegrität nach Seeding)
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_stammfiliale') THEN
          ALTER TABLE mitarbeiter ADD CONSTRAINT fk_stammfiliale FOREIGN KEY (fkurzl) REFERENCES filiale(fkurzl);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_arbeitstyp') THEN
          ALTER TABLE mitarbeiter ADD CONSTRAINT fk_arbeitstyp FOREIGN KEY (akurzl) REFERENCES arbeitstyp(akurzl);
        END IF;
      END $$;
    `);

    //  Externe SQL-Logik (Functions & Triggers via SoC)
    const functionsDir = path.resolve(__dirname, '../functions');
    const triggersDir = path.resolve(__dirname, '../triggers');
    
    console.log("Lade externe SQL-Skripte (Functions/Triggers)...");
    await loadSqlFiles(client, [functionsDir, triggersDir]);



    // Alles erfolgreich -> Speichern
    await client.query('COMMIT');
    console.log("Datenbank erfolgreich initialisiert.");


  } catch (err) {
    
    // Fehlerfall -> Alles rückgängig machen
        if (client) await client.query('ROLLBACK');
            console.error(" DB-Initialisierung fehlgeschlagen:", err.message);
  } finally {
    // Verbindung zurück in den Pool geben (Verhindert Connection Leaks)
    client.release();
  }
}

>>>>>>> dce73f6 (Datenbank server.js .env trigger functions erstellt)
module.exports = {
    query: (text, params) => pool.query(text, params),
    initDatabase,
};