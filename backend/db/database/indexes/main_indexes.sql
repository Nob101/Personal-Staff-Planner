



-- Roster search -> Performance optimization
CREATE INDEX IF NOT EXISTS idx_dienstplaene_datum ON dienstplaene(fnr, datum);
CREATE INDEX IF NOT EXISTS idx_dienstplaene_jahr_monat ON dienstplaene(jahr, monat);

-- Employee filtering by branch
CREATE INDEX IF NOT EXISTS idx_mitarbieter_hauptfiliale ON mitarbeiter(hauptfiliale_fnr);
CREATE INDEX IF NOT EXISTS idx_dienstplaene_mnr_datum ON dienstplaene(mnr, datum);


-- Quick search for employees marked as temporary/floating staff (true)
CREATE INDEX IF NOT EXISTS idx_mitarbeiter_springer ON mitarbeiter(springer) WHERE springer = TRUE;

-- Performance for M:N relationship table (algorithm frequently checks employee availability)
CREATE INDEX IF NOT EXISTS idx_ma_filiale_fnr ON mitarbeiter_arbeitet_in_filiale(fnr);


-- Performance optimization for hours account (stunden_konto)
CREATE INDEX IF NOT EXISTS idx_stunden_konto_suche ON stunden_konto(mnr, jahr, monat);


-- NEW: Index for soft-delete support (keeps "active" status views responsive)
CREATE INDEX IF NOT EXISTS idx_mitarbeiter_aktiv ON mitarbeiter(aktiv) WHERE aktiv = TRUE;
