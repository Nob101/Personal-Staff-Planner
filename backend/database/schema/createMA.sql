
--Composite Bereich
Create TYPE name_typ as(
    f_name VARCHAR(25),
    l_name VARCHAR(40)
);

CREATE TYPE adresse_typ AS (
    strasse VARCHAR(50),
    plz VARCHAR(10),
    ort VARCHAR(30)
);

CREATE TYPE kommunikations_typ as(
    telfonnummern VARCHAR[],
    emails VARCHAR[]
);


CREATE TYPE kontakt_typ as(
    adresse adresse_typ,
    kontaktinfo kommunikations_typ
);




--Create bereich
CREATE TABLE if not exists mitarbeiter (
  MA_id SERIAL PRIMARY KEY,
  name name_typ NOT NULL,
  kontakt kontakt_typ NOT NULL,
  
);


/*

Beispiel:
- Insert befehl richtig verwenden:

INSERT INTO mitarbeiter (name, kontakt)
VALUES (
  ROW('Max', 'Mustermann'), 
  ROW(ROW('Musterstraße', '12345', 'Berlin'), ROW(ARRAY['123456789'], ARRAY['max@beispiel.de']))
);

*/



