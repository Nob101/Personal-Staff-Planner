
/*
Create Script für Dienstvertrag, Arbietstyp (Verfügbarkeit) und Kalendertag
*/

CREATE TABLE IF NOT EXISTS dienstplan (
    PlanID SERIAL PRIMARY KEY,
    MNr INTEGER REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
    Tag SMALLINT NOT NULL, -- 1=Mo, ..., 7=So
    Startzeit TIME NOT NULL,
    Dauer INTEGER NOT NULL -- in Stunden
);



CREATE TABLE if not EXISTS arbeitstyp (
    ANr SERIAL PRIMARY KEY,
    Text VARCHAR(50) NOT NULL,
    Beschreibung VARCHAR(200)
);

-- 1 als default wert in MA table anlegen
INSERT INTO arbeitstyp (ANr, Text) VALUES 
(1, 'Verfügbar'),
(2, 'Erkrankung'),
(3, 'Arzttermin'),
(4, 'Urlaub'),
(5, 'Zeitausgleich'),
(6, 'Dienstverhinderung §8'),
(7, 'Pflegefreistellung'),
(8, 'Karenz');

-- §8 allgemein für diverse Fälle (Todesfall zB)


CREATE TABLE if not EXISTS kalendereintrag (
    KNr SERIAL PRIMARY KEY,
    MNr INTEGER REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
    FNr INTEGER REFERENCES filiale(FNr) ON DELETE CASCADE,
    ANr INTEGER REFERENCES arbeitstyp(ANr) ON DELETE CASCADE,
    Von TIMESTAMP NOT NULL,
    Bis TIMESTAMP NOT NULL,
    Arbeitsstunden NUMERIC,
    Bemerkung VARCHAR(200),
    CONSTRAINT chk_von_bis CHECK (Von < Bis)
);

