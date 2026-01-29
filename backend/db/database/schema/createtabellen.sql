
/*
 Datenbank Aufbau / Schema
------------------------------------------------------------------------
ZENTRALE Architektur:

ENTKOPPLUNG & PERFORMANCE: 
   Rechenintensive Logik (Schichtmuster-Algorithmen, Soll/Ist-Vergleiche) 
   wurde in den Backend-Code ausgelagert. Die DB dient als persistenter
   Datenspeicher.

SPRINGER- & DIENST-LOGIK: 
   Abbildung von Beschäftigungsgraden durch NUMERIC-Werte und 
   Unterstützung von Mehrfach-Einsätzen (Springer) pro Tag durch 
   flexible 'dienstplaene'-Struktur.

CLEANUP-STRATEGIE (Automatisierung):
   Ein Backend-Service bereinigt die 'dienstplaene'-Tabelle sequenziell 
   (alle 13 Monate wenn tupel > 70000), um die Performance zu erhalten. Erst nach dieser 
   Frist/Bedingung werden  alte Daten  entfernt.

SOFT-DELETE: 
   Mitarbeiter (MA) und Filialen werden physisch NICHT aus der Datenbank 
   gelöscht. Das Attribut 'aktiv' (Boolean) steuert die Sichtbarkeit im 
   Frontend. Vorteil: Historische Dienstpläne bleiben für die gesetzliche 
   Einsichtnahme und den Export in CSV-files erhalten.

------------------------------------------------------------------------
*/




/*
###############################
-- STAMMDATEN 
################################
*/

CREATE TABLE IF NOT EXISTS filiale (
    fnr SERIAL PRIMARY KEY,
    filialname VARCHAR(50),

    strasse VARCHAR(50),
    plz VARCHAR(10),
    ort VARCHAR(50),
    land VARCHAR(55) DEFAULT 'Österreich',
    telefon VARCHAR(50),
    email VARCHAR(50),
    -- NEU: Anmerkung zu FA
    anmerkung VARCHAR(250),
    farbe VARCHAR(20) DEFAULT '#3498db',
    algorithmid INTEGER,
    -- NEU: Falls filiale schließt   im backend     UPDATE filiale SET aktiv = FALSE WHERE fnr = 5;
    aktiv Boolean DEFAULT TRUE
);



CREATE TABLE IF NOT EXISTS arbeitstyp (
    akurzl VARCHAR(6) PRIMARY KEY,
    text VARCHAR(55) NOT NULL
);



/*
###############################
-- MITARBEITER & KONTAKT
################################
*/

CREATE TABLE IF NOT EXISTS mitarbeiter (
    mnr SERIAL PRIMARY KEY,
    vorname VARCHAR(35) NOT NULL,
    nachname VARCHAR(45) NOT NULL,

    hauptfiliale_fnr INTEGER REFERENCES filiale(fnr) ON DELETE SET NULL,        --Damit MA nicht gelöscht wird, wenn Filiale entfernt wird -> neuer wert NULL
    -- NEU: Anmerkung zu MA
    anmerkung VARCHAR(250),
    counter INTEGER DEFAULT 0,
    arbeitnehmertyp INTEGER DEFAULT 40,
    springeralgorithmid INTEGER,
    springer BOOLEAN DEFAULT FALSE,
    -- NEU:Aktive MA logik      Im Backend     UPDATE mitarbeiter SET aktiv = FALSE WHERE mnr = 5;   zB über die Route const kuendigt_MA
    aktiv Boolean DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS mitarbeiter_kontakt (
    knr SERIAL PRIMARY KEY,
    mnr INTEGER NOT NULL UNIQUE REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
    strasse VARCHAR(50),
    plz VARCHAR(10),
    ort VARCHAR(50),
    land VARCHAR(55)
);



CREATE TABLE IF NOT EXISTS mitarbeiter_telefon (
    mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
    -- telefon_typ VARCHAR(50) NOT NULL,
    nummer VARCHAR(55) NOT NULL,
    PRIMARY KEY (mnr, telefon_typ)
);


CREATE TABLE IF NOT EXISTS mitarbeiter_email (
    mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
    -- email_typ VARCHAR(50) NOT NULL,
    email_adresse VARCHAR(100) NOT NULL,
    PRIMARY KEY (mnr, email_typ)
);




CREATE TABLE IF NOT EXISTS mitarbeiter_arbeitet_in_filiale (
  mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
  fnr INTEGER NOT NULL REFERENCES filiale(fnr) ON DELETE CASCADE,
  PRIMARY KEY (mnr, fnr)
);


CREATE TABLE IF NOT EXISTS mitarbeiter_arbeitet_in_filiale (
  mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
  fnr INTEGER NOT NULL REFERENCES filiale(fnr) ON DELETE CASCADE,
  PRIMARY KEY (mnr, fnr)
);




/*
###############################
-- STUNDENKONTO (Neu: für Alexander => Backend-Berechnung)
################################
*/

CREATE TABLE IF NOT EXISTS stunden_konto (
    id SERIAL PRIMARY KEY,
    mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
    jahr INTEGER NOT NULL,
    monat INTEGER NOT NULL,
    soll_stunden_monat DECIMAL(10,2),                   --< Dynamisch berechnet vom Backend
    ist_stunden_monat DECIMAL(10,2),
    differenz DECIMAL(10,2),                            --< Wird im Backend berechnet und hier gespeichert
    UNIQUE(mnr, jahr, monat)
);



/*
###############################
-- DIENSTPLANUNG
################################
*/

CREATE TABLE IF NOT EXISTS dienstplaene (
    id SERIAL PRIMARY KEY,
    jahr INTEGER NOT NULL,
    monat INTEGER NOT NULL,
    datum DATE NOT NULL,

    --WICHTIG: RESTRICT verhindert, dass  Markus einen MA
    mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE RESTRICT,
    fnr INTEGER NOT NULL REFERENCES filiale(fnr) ON DELETE RESTRICT,
    schicht_typ VARCHAR(6) REFERENCES arbeitstyp(akurzl),
    anmerkung VARCHAR(250),

    erstellt_am TIMESTAMP DEFAULT now(),
    aktualisiert_am TIMESTAMP DEFAULT now(),   --NEU!
    CONSTRAINT dienstplaene_unique_mnr_pro_tag UNIQUE (datum, mnr, fnr)

);




/*
###############################
-- AUTHENTIFIZIERUNG
################################
*/

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

