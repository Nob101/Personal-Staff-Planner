
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
    Filialleiter_Nr INTEGER, -- welcher der MA als Filialleiter zugewiesen ist
    CONSTRAINT fk_filialleiter FOREIGN KEY (Filialleiter_Nr) REFERENCES mitarbeiter(MNr) --es kann keinen Filialmitarbeiter geben, der kein MA ist
);

--Junction Tables -> 2 Attribute = Composite Primary Keys
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
Wenn Elterntelement gelöscht wird, wird auch das Kindelement mitentfernt

Bsp.
Wenn ein Datensatz in der Tabelle Mitarbeiter gelöscht wird, werden alle Datensätze in jener Tabelle, 
die über die Spalte MNr auf diesen Mitarbeiter verweisen, ebenfalls automatisch gelöscht.
*/


