/*
Composite Type für Adresse definieren
*/

-- Composite Berich
CREATE TYPE adresse_typ AS (
    strasse VARCHAR(50),
    plz VARCHAR(10),
    ort VARCHAR(30)
);



--Create Bereich
Create table if not exists filialen (
    Fi_id SERIAL PRIMARY KEY,
    FilialLeiter VARCHAR(35),
    adresse adresse_typ NOT NULL

);

