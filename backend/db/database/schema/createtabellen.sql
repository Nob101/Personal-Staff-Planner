
/*
 Datenbankstruktur /Schema -> (Angepasst an Backend-Logik)
------------------------------------------------------------------------
ZENTRALE ÄNDERUNGEN:

1. ENTKOPPLUNG: Algorithmen-Tabellen wurden entfernt. Die Logik für Schichtmuster
   und Personalbedarfs-Berechnungen liegt nun direkt im Backend-Code.

2. STUNDEN-MODELL: 'mitarbeiter' nutzt nun NUMERIC-Werte für Wochenstunden und 
   Beschäftigungsgrad, um Teilzeitmodelle präzise abzubilden.

3. SPRINGER-SUPPORT: Die Tabelle 'dienstplaene' erlaubt nun Mehrfach-Einträge
   pro Mitarbeiter pro Tag, um Springer-Einsätze in mehreren Filialen zu ermöglichen.

4. STUNDENKONTO: Monatliche Soll/Ist-Vergleichstabelle für die Gehaltsabrechnung.

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
    farbe VARCHAR(20) DEFAULT '#3498db',
    algorithmid INTEGER
);

CREATE TABLE IF NOT EXISTS arbeitstyp (
    akurzl VARCHAR(6) PRIMARY KEY,
    text VARCHAR(55) NOT NULL
);

/* Tabellen 'algorithmen' und 'algorithmus_muster' => entfernt!!!! 
Als Arrays direkt im Backend-Code verwaltet werden!!!!!!!
*/




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

    -- Neu: Flexibles Stundenmodell statt fixen 160h
    counter INTEGER DEFAULT 0,
    -- Kann weg, steht ja eh unten bei arbeitnehmer_typ--- wochenstunden_vertrag DECIMAL(5,2) NOT NULL,
    arbeitnehmertyp INTEGER DEFAULT 40,
    springeralgorithmid INTEGER,
    springer BOOLEAN DEFAULT FALSE
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
    telefon_typ VARCHAR(50) NOT NULL,
    nummer VARCHAR(55) NOT NULL,
    PRIMARY KEY (mnr, telefon_typ)
);

CREATE TABLE IF NOT EXISTS mitarbeiter_email (
    mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
    email_typ VARCHAR(50) NOT NULL,
    email_adresse VARCHAR(100) NOT NULL,
    PRIMARY KEY (mnr, email_typ)
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
    differenz DECIMAL(10,2),
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

    mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
    fnr INTEGER NOT NULL REFERENCES filiale(fnr) ON DELETE CASCADE,
    schicht_typ VARCHAR(6) REFERENCES arbeitstyp(akurzl),
    anmerkung VARCHAR(250),

    erstellt_am TIMESTAMP DEFAULT now()

);






/*###############################
-- AUTHENTIFIZIERUNG
################################
*/

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);


/* ADD CONSTRAINT uq_mitarbeiter_kontakt_mnr UNIQUE (mnr);
 ADD CONSTRAINT dienstplaene_unique_mnr_pro_tag UNIQUE (datum, mnr);
*/