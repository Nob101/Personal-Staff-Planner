/*
        erstellen der Tabellen für die Demo-Version
*/



CREATE TABLE if not EXISTS mitarbeiter (
    MNr SERIAL PRIMARY KEY,
    Vorname VARCHAR(35) NOT NULL,
    Nachname VARCHAR(45) NOT NULL,
    FKurzl VARCHAR(15) UNIQUE, --Stammfiliale
    AKurzl VARCHAR(15) UNIQUE, --Arbeitstyp
    Counter INTEGER NOT NULL --Counter für Algorithmus
    
);


CREATE TABLE if not EXISTS filiale (
    FNr SERIAL PRIMARY KEY,
    FKurzl VARCHAR(15) UNIQUE,
    Strasse VARCHAR(50),
    PLZ VARCHAR(10),
    Ort VARCHAR(50),
    Land VARCHAR(55) DEFAULT 'Österreich',
    telefon VARCHAR(50),
    email VARCHAR(50)
   
);

CREATE TABLE if not EXISTS mitarbeiter_arbeitet_in_Filiale (
    MNr INTEGER,
    FNr INTEGER,
    PRIMARY KEY(MNr, FNr),
    FOREIGN KEY (MNr) REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
    FOREIGN KEY (FNr) REFERENCES filiale(FNr) ON DELETE CASCADE
);

CREATE TABLE if not EXISTS arbeitstyp (
    AKurzl VARCHAR(6) PRIMARY KEY,
    Text VARCHAR(55) NOT NULL
);

    /*
    ON DELETE CASCADE
    Wenn Elterntelement gelöscht wird, wird auch das Kindelement mitentfernt

    Bsp.
    Wenn ein Datensatz in der Tabelle Mitarbeiter gelöscht wird, werden alle Datensätze in jener Tabelle, 
    die über die Spalte MNr auf diesen Mitarbeiter verweisen, ebenfalls automatisch gelöscht.
    */




--hinzufügen der PK -> FK beziehungen, um einen Aussführfehler zu vermeiden

ALTER TABLE mitarbeiter
ADD CONSTRAINT fk_Stammfiliale FOREIGN KEY ( Stammfiliale_Nr) REFERENCES filiale(FKurzl);

Alter TABLE mitarbeiter
ADD CONSTRAINT fk_arbeitstyp FOREIGN KEY (AKurzl) REFERENCES arbeitstyp(AKurzl);

-- Alle Test Insert Befehle zur überprüfung

INSERT INTO arbeitstyp (AKurzl, Text) VALUES 
    ('AD', 'Anfangsdienst'),
    ('ED', 'Enddienst'),
    ('FF', 'Frei'),
    ('KK', 'Erkrankung'),
    ('AR', 'Arzttermin'),
    ('UL', 'Urlaub'),
    ('ZA', 'Zeitausgleich'),
    ('DV', 'Dienstverhinderung §8'),
    ('PF', 'Pflegefreistellung'),
    ('KR', 'Karenz')
ON CONFLICT (AKurzl) DO NOTHING; 

-- -- §8 allgemein für diverse Fälle (Todesfall zB)





/*
    Alte Tabellen (für später)  noch nicht fertig angepasst!!!!!!!!
*/

        -- CREATE TABLE mitarbeiter_kontakt (
        --   KNr SERIAL PRIMARY KEY,
        --   MNr INTEGER NOT NULL REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
        --   Strasse VARCHAR(50),
        --   PLZ VARCHAR(10),
        --   Ort VARCHAR(50),
        --   Land VARCHAR(55),
        --   Zusatztelefon VARCHAR(55)[],
        --   Zusatzemail VARCHAR(100)[]
        -- );


        -- /*
        -- INSERT INTO mitarbeiter_kontakt (MNr, Telefonnummer, Email) VALUES
        -- (1, ARRAY['123456789', '987654321'], ARRAY['mail1@example.com', 'mail2@example.com']);
        -- */






        -- /*
        -- Create Script für Dienstvertrag, Arbietstyp (Verfügbarkeit) und Kalendertag
        -- */


        -- CREATE TABLE IF NOT EXISTS dienstvertrag (
        --     DVNr SERIAL PRIMARY KEY,
        --     MNr INTEGER REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
        --     Arbeitsstunden NUMERIC, --festgelegte Arbeitsstunden
        --     Anstellung VARCHAR(60), --Angestellter, Gastgewerbe,
        --     Einteilung VARCHAR(55) Not Null --Springer in welchem Bereich / nächste Filialen vom Hauptwohnsitz und/oder Region
        -- );




-- CREATE TABLE if not EXISTS kalendereintrag (
--     KALNr SERIAL PRIMARY KEY,
--     MNr INTEGER REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
--     FNr INTEGER REFERENCES filiale(FNr) ON DELETE CASCADE,
--     ANr INTEGER REFERENCES arbeitstyp(ANr) ON DELETE CASCADE,
--     Von TIMESTAMP NOT NULL , --flexible Arbietszeiten, [Zuordnen -> AG -> Berechnen Alexander aus Dienstvertrag (Arbeitsstunden)]
--     Bis TIMESTAMP NOT NULL,
--     Anmerkung VARCHAR(250),
--     CONSTRAINT chk_von_bis CHECK (Von < Bis)
-- );

-- --kalendereintrag -> Trigger -> keine doppelbuchungen

-- /* Beispiel
-- INSERT INTO kalendereintrag (MNr, FNr, ANr, Von, Bis, Bemerkung)
-- VALUES 
-- (1, 1, 1, '2025-11-01 07:30:00', '2025-11-01 15:30:00', 'Schichtbeginn um 7:30 Uhr, Ende um 15:30 Uhr'),
-- (2, 2, 2, '2025-11-01 09:00:00', '2025-11-01 18:00:00', 'Schichtbeginn um 9:00 Uhr, Ende um 18:00 Uhr');


-- Von TIMESTAMP NOT NULL DEFAULT date_trunc('day', CURRENT_TIMESTAMP) + interval '8 hours',  wird auf Mitternacht des aktuellen Tages +8 Stunden gesetzt = 8 uhr Morgens
-- */








