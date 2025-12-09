
/*
Create Script für Mitarbeiter anlegen inklusive Kontaktdaten
*/

CREATE TABLE if not EXISTS mitarbeiter (
    MNr SERIAL PRIMARY KEY,
    Vorname VARCHAR(35) NOT NULL,
    Nachname VARCHAR(45) NOT NULL,
    Haupttelefon VARCHAR(55),
    Hauptemail VARCHAR(100),
    Stammfiliale_Nr INTEGER,
    ANr INTEGER DEFAULT 1 REFERENCES arbeitstyp(ANr), --Standard ist verfügbar
    DVNr INTEGER,
    CONSTRAINT fk_Stammfiliale FOREIGN KEY (Stammfiliale_Nr) REFERENCES filiale(FNr),
    CONSTRAINT fk_Dienstvertrag FOREIGN KEY (DVNr) REFERENCES dienstvertrag(DVNr)

);


CREATE TABLE mitarbeiter_kontakt (
  KNr SERIAL PRIMARY KEY,
  MNr INTEGER NOT NULL REFERENCES mitarbeiter(MNr) ON DELETE CASCADE,
  Strasse VARCHAR(50),
  PLZ VARCHAR(10),
  Ort VARCHAR(50),
  Land VARCHAR(55),
  Zusatztelefon VARCHAR(55)[],
  Zusatzemail VARCHAR(100)[]
);


/*
INSERT INTO mitarbeiter_kontakt (MNr, Telefonnummer, Email) VALUES
(1, ARRAY['123456789', '987654321'], ARRAY['mail1@example.com', 'mail2@example.com']);
*/





