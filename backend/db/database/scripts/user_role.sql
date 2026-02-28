
-- Wichtig: Wurde an database.js ausgelagert und dient nur noch zur Einsicht

-- Benutzer "admin" anlegen mit LOGIN und Passwort
-- sudo rwx
CREATE ROLE admin LOGIN PASSWORD 'load_solution' SUPERUSER INHERIT CREATEROLE NOREPLICATION;

-- Grant alle Rechte auf die Datenbank (ersetze dienstplan durch deinen DB-Namen)
GRANT CONNECT ON DATABASE dienstplan TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;


-- Damit der Admin später bei bedarf rechte vergebn kann
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO admin;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO admin;

-- Gastbenutzer anlegen mit nur Leserechten
--kein sudo r--


CREATE ROLE gast LOGIN PASSWORD '12gast34' NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;



-- Leserechte gewähren
GRANT CONNECT ON DATABASE dienstplan TO gast;
GRANT USAGE ON SCHEMA public TO gast;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO gast;



