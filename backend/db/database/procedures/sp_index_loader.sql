
/*
    Stored Procedure damit das hinzufügen größeren Datensätzen
    die Index Struktur neu aufzubauen. (Index Bloat vermeidung)
    Für den fall das später der Input mehrere Datensätze (Massen Import) via excel file oder csv
*/

CREATE OR REPLACE PROCEDURE pr_refresh_indexes()
LANGUAGE plpgsql
AS $$
BEGIN
    -- PostgreSQL -> REINDEX TABLE für alle Indizes einer Tabelle
    --  effizienter als jeden Index einzeln zu benennen (ORACLE zB)
    REINDEX TABLE CONCURRENTLY dienstplaene;
    REINDEX TABLE CONCURRENTLY mitarbeiter;
    REINDEX TABLE CONCURRENTLY mitarbeiter_arbeitet_in_filiale;
    REINDEX TABLE CONCURRENTLY stunden_konto;

    -- Statistiken aktualisieren für QUERY Planner -> speichert werte in der System-Statistik (Intern) pg_statistic
    ANALYZE dienstplaene;
    ANALYZE mitarbeiter;
    ANALYZE mitarbeiter_kontakt;
    ANALYZE mitarbeiter_arbeitet_in_filiale;

    RAISE NOTICE 'Index-Rebuild und Statistiken (ANALYZE) erfolgreich abgeschlossen.';
END;
$$;

