/*
ARCHIV: Datenbankstruktur
------------------------------------------------------------------------
        Erstellen der Tabellen im database.js file

        Diese Datei dient zur Einsicht(Archiv), um einen besseren Überblick
        zu erhalten.

        Besonderheiten:
        - ON DELETE CASCADE: Löscht Kindelemente automatisch (z.B. Telefonnummern, Email-addressen, bei Mitarbieterlöschung)
        - Springerlogik: Erlaubt mehrere Schichten pro Tag/Mitarbeiter in unterschiedlichen Filialen (Feature)

*/




/*
###############################

-- STAMMDATEN 

################################
*/


CREATE TABLE if not EXISTS filiale (
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
    algorithmid INTEGER
   
);


CREATE TABLE if not EXISTS arbeitstyp (
    akurzl VARCHAR(6) PRIMARY KEY,
    text VARCHAR(55) NOT NULL
);



CREATE TABLE IF NOT EXISTS algorithmen (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    stunden INTEGER DEFAULT 9

);




/*
###############################

-- AUFLÖSUNG VON GRUPPEN/ARRAYS

################################
*/


CREATE TABLE IF NOT EXISTS algorithmus_muster (
    id SERIAL PRIMARY KEY,
    algorithmus_id INTEGER REFERENCES algorithmen(id) ON DELETE CASCADE,
    reihenfolge INTEGER NOT NULL,
    akurzl VARCHAR(6) REFERENCES arbeitstyp(akurzl),
    UNIQUE(algorithmus_id, reihenfolge)
);




/*
###############################

-- MITARBEITER & KONTACT

################################
*/


CREATE TABLE if not EXISTS mitarbeiter (
    mnr SERIAL PRIMARY KEY,
    vorname VARCHAR(35) NOT NULL,
    nachname VARCHAR(45) NOT NULL,
    fkurzl VARCHAR(15),                           -- Stammfiliale (Kurzzeichen)
    akurzl VARCHAR(6),                            -- Standard-Arbeitstyp
    counter INTEGER NOT NULL DEFAULT 0,           -- Für Algorithmus-Gewichtung
    hauptfiliale_fnr INTEGER REFERENCES filiale(fnr) ON DELETE SET NULL,
    stunden_soll INTEGER DEFAULT 160,             -- Stundensoll Startwert
    springer BOOLEAN DEFAULT FALSE,
    algorithmus_id INTEGER REFERENCES algorithmen(id) 

);


CREATE TABLE mitarbeiter_kontakt (
  knr SERIAL PRIMARY KEY,
  mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
  strasse VARCHAR(50),
  plz VARCHAR(10),
  ort VARCHAR(50),
  land VARCHAR(55),

);



CREATE TABLE mitarbeiter_telefon (
  mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
  telefon_typ VARCHAR(50) NOT NULL,
  nummer VARCHAR(55) NOT NULL,
  PRIMARY KEY (mnr, telefon_typ)
);

CREATE TABLE mitarbeiter_email (
  mnr INTEGER NOT NULL REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
  email_typ VARCHAR(50) NOT NULL,
  email_adresse VARCHAR(100) NOT NULL,
  PRIMARY KEY (mnr, email_typ)
);



/*
###############################

-- RELATIONEN (N:M)

################################
*/



CREATE TABLE if not EXISTS mitarbeiter_arbeitet_in_Filiale (
    mnr INTEGER,
    fnr INTEGER,
    PRIMARY KEY(mnr, fnr),
    FOREIGN KEY (mnr) REFERENCES mitarbeiter(mnr) ON DELETE CASCADE,
    FOREIGN KEY (fnr) REFERENCES filiale(fnr) ON DELETE CASCADE
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
    erstellt_am TIMESTAMP DEFAULT now(),

    UNIQUE(datum, mnr, fnr, schicht_typ)      -- UNIQUE erlaubt Springer-Einsätze (A und E in versch. Filialen), 
                                              -- verhindert aber doppelte gleiche Dienste.
);




/*
###############################

-- USER

################################
*/

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' 
);




/*------------------------------------------------

hinzufügen der PK -> FK beziehungen, um einen Aussführfehler zu vermeiden

*/------------------------------------------------


ALTER TABLE mitarbeiter
ADD CONSTRAINT fk_Stammfiliale FOREIGN KEY ( fkurzl) REFERENCES filiale(fkurzl);

ALTER TABLE mitarbeiter
ADD CONSTRAINT fk_arbeitstyp FOREIGN KEY (akurzl) REFERENCES arbeitstyp(akurzl);












