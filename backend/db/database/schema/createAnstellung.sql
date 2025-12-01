



/*
Create Script für Dienstvertrag, Arbietstyp (Verfügbarkeit) und Kalendertag
*/


CREATE TABLE IF NOT EXISTS dienstvertrag (
    DVNr SERIAL PRIMARY KEY,
    MNr INTEGER REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
    Arbeitsstunden NUMERIC, --festgelegte Arbeitsstunden
    Anstellung VARCHAR(60), --Angestellter, Gastgewerbe,
    Einteilung VARCHAR(55) Not Null --Springer in welchem Bereich / nächste Filialen vom Hauptwohnsitz und/oder Region
);



CREATE TABLE if not EXISTS arbeitstyp (
    ANr INTEGER PRIMARY KEY,
    Text VARCHAR(50) NOT NULL
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
    (8, 'Karenz')
ON CONFLICT (ANr) DO NOTHING; --es können neue Einträge nur angehängt werden aber bestehnden nicht entfernt/geändert werden


-- §8 allgemein für diverse Fälle (Todesfall zB)


CREATE TABLE if not EXISTS kalendereintrag (
    KALNr SERIAL PRIMARY KEY,
    MNr INTEGER REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
    FNr INTEGER REFERENCES filiale(FNr) ON DELETE CASCADE,
    ANr INTEGER REFERENCES arbeitstyp(ANr) ON DELETE CASCADE,
    Von TIMESTAMP NOT NULL , --flexible Arbietszeiten, [Zuordnen -> AG -> Berechnen Alexander aus Dienstvertrag (Arbeitsstunden)]
    Bis TIMESTAMP NOT NULL,
    Anmerkung VARCHAR(250),
    CONSTRAINT chk_von_bis CHECK (Von < Bis)
);

--kalendereintrag -> Trigger -> keine doppelbuchungen

/* Beispiel
INSERT INTO kalendereintrag (MNr, FNr, ANr, Von, Bis, Bemerkung)
VALUES 
(1, 1, 1, '2025-11-01 07:30:00', '2025-11-01 15:30:00', 'Schichtbeginn um 7:30 Uhr, Ende um 15:30 Uhr'),
(2, 2, 2, '2025-11-01 09:00:00', '2025-11-01 18:00:00', 'Schichtbeginn um 9:00 Uhr, Ende um 18:00 Uhr');


Von TIMESTAMP NOT NULL DEFAULT date_trunc('day', CURRENT_TIMESTAMP) + interval '8 hours',  wird auf Mitternacht des aktuellen Tages +8 Stunden gesetzt = 8 uhr Morgens
*/


