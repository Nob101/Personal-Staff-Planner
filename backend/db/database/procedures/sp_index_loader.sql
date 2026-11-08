
/*
    Stored Procedure for rebuilding index structures to avoid index bloat 
    when inserting large datasets (e.g., bulk imports via Excel or CSV).
*/

CREATE OR REPLACE PROCEDURE pr_refresh_indexes()
LANGUAGE plpgsql
AS $$
BEGIN
    -- PostgreSQL -> REINDEX TABLE for all indexes of a table
    -- More efficient than rebuilding each index individually (unlike Oracle, etc.)
    REINDEX TABLE  dienstplaene;
    REINDEX TABLE mitarbeiter;
    REINDEX TABLE  mitarbeiter_arbeitet_in_filiale;
    REINDEX TABLE  stunden_konto;
    --NEW: Table mitarbeiter_abwesenheit
    REINDEX TABLE mitarbeiter_abwesenheit;

    -- Update statistics for the Query Planner -> stores values in the internal system catalog (pg_statistic)
    ANALYZE dienstplaene;
    ANALYZE mitarbeiter;
    ANALYZE mitarbeiter_kontakt;
    ANALYZE mitarbeiter_arbeitet_in_filiale;
    --NEW: statistic mitarbeiter_abwesenheit
    ANALYZE mitarbeiter_abwesenheit;

    RAISE NOTICE 'Index rebuild and statistics analysis (ANALYZE) completed successfully.';
END;
$$;


