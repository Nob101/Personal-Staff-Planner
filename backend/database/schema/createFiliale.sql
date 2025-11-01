
/*
Create Script für Filialen anlegen inklusive Mitarbeiter anlegen
*/

CREATE TABLE if not EXISTS filiale (
    FNr SERIAL PRIMARY KEY,
    Strasse VARCHAR(50),
    PLZ VARCHAR(10),
    Ort VARCHAR(50),
    Land VARCHAR(55) DEFAULT 'Österreich',
    telefon VARCHAR(50),
    email VARCHAR(50),
    Filialleiter_Nr INTEGER,
    FOREIGN KEY (Filialleiter_Nr) REFERENCES mitarbeiter(MNr)
);

-- Zwischentabelle N:M beziehung
CREATE TABLE if not EXISTS mitarbeiter_arbeitet_in_Filiale (
    MNr INTEGER,
    FNr INTEGER,
    PRIMARY KEY(MNr, FNr),
    FOREIGN KEY (MNr) REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
    FOREIGN KEY (FNr) REFERENCES filiale(FNr) ON DELETE CASCADE
);

/*
ON DELETE CASCADE
Beschreibung in createMA.sql
*/


