

-- -- Warnt vor jedem Löscehn eines datensatzes
-- -- Besser als POP UP im reinen Frontend
-- -- Als SAFE DELETE Methode nur wenn noch zeit bleibt -> Komplex


-- CREATE OR REPLACE FUNCTION fn_warn_before_delete()
-- RETURNS trigger AS $$
-- BEGIN

--     RAISE EXCEPTION 'Vorsicht! Möchten Sie wirklich diesen Datensatz löschen?';
--   RETURN OLD;
-- END;
-- $$ LANGUAGE plpgsql;




