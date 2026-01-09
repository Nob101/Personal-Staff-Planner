


-- Dienstplan-Suche -> Performance

CREATE INDEX IF NOT EXISTS idx_dienstplaene_datum ON dienstplaene(fnr, datum);
CREATE INDEX IF NOT EXISTS idx_dienstplaene_jahr_monat ON dienstplaene(jahr, monat);

-- Mitarbeiter filterung nach Filialen
CREATE INDEX IF NOT EXISTS idx_mitarbieter_hauptfiliale ON mitarbeiter(hauptfiliale_fnr);
CREATE INDEX IF NOT EXISTS idx_dienstplaene_mnr_datum ON dienstplaene(mnr, datum);


-- Schnellsuche nach Mitarbeitern, die als Springer (true) markiert sind
CREATE INDEX IF NOT EXISTS idx_mitarbeiter_springer ON mitarbeiter(springer) WHERE springer = TRUE;

-- Performance für M:N Tabelle (Algo prüft häufig die MA verfügbarkeit)
CREATE INDEX IF NOT EXISTS idx_ma_filiale_fnr ON mitarbeiter_arbeitet_in_filiale(fnr);

-- Performance für stunden_konto
CREATE INDEX IF NOT EXISTS idx_stunden_konto_suche ON stunden_konto(mnr, jahr, monat);

