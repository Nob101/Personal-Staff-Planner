
/*
Create Script für Mitarbeiter anlegen inklusive Kontaktdaten
*/

CREATE TABLE if not EXISTS mitarbeiter (
    MNr SERIAL PRIMARY KEY,
    f_name VARCHAR(35) NOT NULL,
    l_name VARCHAR(45) NOT NULL,
    Strasse VARCHAR(50),
    PLZ VARCHAR(10),
    Ort VARCHAR(50),
    Land VARCHAR(55),
    telefon VARCHAR(50),
    email VARCHAR(50),
    Stammfiliale_Nr INTEGER,
    ANr INTEGER DEFAULT 1 REFERENCES arbeitstyp(ANr), --Standard ist verfügBar
    DVNr INTEGER
    CONSTRAINT fk_Stammfiliale FOREIGN KEY (Stammfiliale_Nr) REFERENCES filiale(FNr),
    CONSTRAINT fk_Dienstvertrag FOREIGN KEY (DVNr) REFERENCES dienstvertrag(DVNr)

);



CREATE TABLE if not EXISTS mitarbeiter_Telefon (
    MNr INTEGER,
    telefon VARCHAR(55),
    PRIMARY KEY (MNr, telefon),
    FOREIGN KEY (MNr) REFERENCES mitarbeiter(MNr) ON DELETE CASCADE
);

/*
ON DELETE CASCADE
Wenn ein Datensatz in der Tabelle Mitarbeiter gelöscht wird, werden alle Datensätze in jener Tabelle, 
die über die Spalte MNr auf diesen Mitarbeiter verweisen, ebenfalls automatisch gelöscht.
*/



CREATE TABLE mitarbeiter_Email (
    MNr INTEGER,
    email VARCHAR(100),
    PRIMARY KEY (MNr, email),
    FOREIGN KEY (MNr) REFERENCES mitarbeiter(MNr) ON DELETE CASCADE
);






/*
ALTER TABLE Mitarbeiter
    ADD CONSTRAINT fk_Stammfiliale 
    FOREIGN KEY (Stammfiliale_Nr) 
    REFERENCES Filiale(FNr);
*/






