

/**
 * [Info!]
 * Damit die Brücke zwischen Datenbank RDBMS und der Backend-Logik entstehen kann.
 * Backend erwartet Objekte, die Datenbank selbst MUSS aber die Daten "flach" und normalisiert speichern
 * 
 * 
 * DB-INITIALISIERUNG
 * ---------------------------------------------------------------------------
 * STRUKTUR:
 * - Stammdaten: filiale, arbeitstyp, mitarbeiter, algorithmen
 * - Normalisierung (1. NF): algorithmus_muster, mitarbeiter_telefon, mitarbeiter_email
 * 
 * - Beziehungen: m:n (mitarbeiter_arbeitet_in_filiale), 1:n (mitarbeiter_kontakt)
 * - Planung: dienstplaene (Ergebnisspeicherung)
 * 
 * LOGIK:
 * - Automatische FK-Constraints via DO-Block
 * - Transaktionsschutz (BEGIN/COMMIT)
 * - Seeding der Basis-Arbeitstypen
 * 
 */

const { Pool } = require('pg');


  // Verbindung zur Default-Datenbank (postgres) herstellen
  const pool = new Pool({
    user: 'testUser',
    host: 'localhost',
    database: 'postgres', // immer eine existierende DB
    password: '1234',
    port: 5432,
  });




  // Prüfen, ob die Datenbank existiert
  async function initDatabase(){
    const client = await pool.connect();

    try {
      console.log("Initialisiere Tabellen....");

      await client.query('BEGIN');

      await client.query(`
        CREATE TABLE IF NOT EXISTS filiale (
          fnr SERIAL PRIMARY KEY,
          filialname VARCHAR(50),
          fkurzl VARCHAR(15) UNIQUE,
          strasse VARCHAR(50),
          plz VARCHAR(10),
          ort VARCHAR(50),
          land VARCHAR(55) DEFAULT 'Österreich',
          telefon VARCHAR(50),
          email VARCHAR(50),
          farbe VARCHAR(20) DEFAULT '#3498db',
          algorithmid INTEGER    --verweis auf Algorithmus-Tabelle  [wichtig]
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

        CREATE TABLE IF NOT EXISTS algorithmus_muster (
          id SERIAL PRIMARY KEY,
          algorithmus_id INTEGER REFERENCES algorithmen(id) ON DELETE CASCADE,
          reihenfolge INTEGER NOT NULL,                                         -- [wichtig] um die NF 1 zu stützen
          akurzl VARCHAR(6) REFERENCES arbeitstyp(akurzl),                      -- [wichtig]Verweis auf Arbietstyp
          UNIQUE(algorithmus_id, reihenfolge)
      );

    `
  );
      await client.query(
        `
       
 `);



  await client.query(`
      CREATE TABLE IF  NOT EXISTS mitarbeiter (
        mnr SERIAL PRIMARY KEY,
        vorname VARCHAR(35) NOT NULL,
        nachname VARCHAR(45) NOT NULL,
        fkurzl VARCHAR(15) REFERENCES filiale(fkurzl), 
        akurzl VARCHAR(6) REFERENCES arbeitstyp(akurzl),
        counter INTEGER NOT NULL DEFAULT 0,
        hauptfiliale_fnr INTEGER REFERENCES filiale(fnr) ON DELETE SET NULL,            -- [wichtig] für Repo-Logik
        stunden_soll INTEGER DEFAULT 160,

        springer BOOLEAN DEFAULT FALSE,
        algorithmus_id INTEGER REFERENCES algorithmen(id) 
      );
    `
  );

  // n:m beziehungen Auflösen
    await client.query(`
      CREATE TABLE IF NOT EXISTS mitarbeiter_arbeitet_in_Filiale (
        mnr INTEGER REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
        fnr INTEGER REFERENCES filiale(fnr) ON DELETE CASCADE,
        PRIMARY KEY(mnr, fnr)
      );

      CREATE TABLE IF NOT EXISTS mitarbeiter_hat_arbeitstyp (
        mnr INTEGER REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
        akurzl VARCHAR(6) REFERENCES arbeitstyp(akurzl),
        PRIMARY KEY(mnr, akurzl)
      );

      CREATE TABLE IF NOT EXISTS mitarbeiter_kontakt (
        knr SERIAL PRIMARY KEY,
        mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
        strasse VARCHAR(50),
        plz VARCHAR(10),
        ort VARCHAR(50),
        land VARCHAR(55)
      );

      CREATE TABLE IF NOT EXISTS mitarbeiter_telefon (
        mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
        telefon_typ VARCHAR(50) NOT NULL,                                         -- [info] Mobil, festnetz, firmenhandy, privat, etc.
        nummer VARCHAR(55) NOT NULL,
        PRIMARY KEY (mnr, telefon_typ, nummer)                                    -- [info] verhindert exakt gleiche Einträge
      );

      CREATE TABLE IF NOT EXISTS mitarbeiter_email (
        mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
        email_typ VARCHAR(50) NOT NULL,
        email_addresse VARCHAR(100) NOT NULL,
        PRIMARY KEY (mnr, email_typ, email_addresse)
      );


      CREATE TABLE IF NOT EXISTS dienstplaene (
        id SERIAL PRIMARY KEY,
        jahr INTEGER NOT NULL,
        monat INTEGER NOT NULL,
        datum DATE NOT NULL,

        mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
        fnr INTEGER NOT NULL REFERENCES filiale(fnr) ON DELETE CASCADE,

        schicht_typ VARCHAR(6) REFERENCES arbeitstyp(akurzl),
        anmerkung VARCHAR(250),
        erstellt_am TIMESTAMP DEFAULT now(),
        UNIQUE(datum, mnr, fnr, schicht_typ)                                -- [wichtig] Ein Mitarbeiter könnte in einer anderen Filiale aushelfen (springen) und anderen Diesnt übernehmen
      );
    `);





    // Do Block ->   damit das Skript nicht abstürzt  (Constraint schon da)
    // pg_constraint -> eingebaute systemtabelle (in ihr wird jede Einschränkung gespeichert die erstellt wird)
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


// Seed Bereich-- erstmalliges befüllen von Daten in eine Tabelle "Seeding"


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
      ON CONFLICT (AKurzl) DO NOTHING;
    `);




  await client.query('COMMIT');
        console.log("PostgreSQL: Schema und Seed-Daten erfolgreich geprüft/erstellt.");
    } catch (err) {

        await client.query('ROLLBACK');
        console.error("Fehler bei DB-Initialisierung, Rollback ausgeführt.", err);
        

    } finally {
        client.release();    //Postgres erlaubt nur  100 leitungen zeitgleich. Release() schließt Leitung damit nicht zuviele offen sind => "Connection Leaak"
    }
}




module.exports = {
  query: (text, params) => pool.query(text, params),
  initDatabase,
};