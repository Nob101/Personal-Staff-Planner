

-- Dienstplan-Suche Performance

CREATE INDEX IF NOT EXISTS idx_dienstplaene_datum ON dienstplaene(fnr, datum);
CREATE INDEX IF NOT EXISTS idx_dienstplaene_jahr_monat ON dienstplaene(jahr, monat);

-- Mitarbeiter filterung nach Filialen
CREATE INDEX IF NOT EXISTS idx_mitarbieter_hauptfiliale ON mitarbeiter(hauptfiliale_fnr);

CREATE INDEX IF NOT EXISTS idx_dienstplaene_mnr_datum ON dienstplaene(mnr, datum);

-- Schnellsuche nach Mitarbeitern, die als Springer (true) markiert sind
CREATE INDEX IF NOT EXISTS idx_mitarbeiter_springer ON mitarbeiter(springer) WHERE springer = TRUE;



-- Performance für joins (foreign Keys)
CREATE INDEX IF NOT EXISTS idx_dienstplaene_mnr ON dienstplaene(mnr);
CREATE INDEX IF NOT EXISTS idx_dienstplaene_fnr ON dienstplaene(fnr);

/* 
CREATE INDEX IF NOT EXISTS idx_mitarbieter_fkurzl ON mitarbeiter(fkurzl);
  */


