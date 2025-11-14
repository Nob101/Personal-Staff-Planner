
-- Benutzer "admin" anlegen mit LOGIN und Passwort
-- sudo rwx
CREATE ROLE admin LOGIN PASSWORD 'load_solution' SUPERUSER INHERIT CREATEROLE NOREPLICATION;

-- Grant alle Rechte auf die Datenbank (ersetze dienstplan durch deinen DB-Namen)
GRANT CONNECT ON DATABASE dienstplan TO admin;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO markus;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO markus;

-- Gastbenutzer anlegen mit nur Leserechten
--kein sudo r--


CREATE ROLE gast LOGIN PASSWORD '12gast34' NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;


-- Leserechte gewähren
GRANT CONNECT ON DATABASE dienstplan TO gast;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO gast;



