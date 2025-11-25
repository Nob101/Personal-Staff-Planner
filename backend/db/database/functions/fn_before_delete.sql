

--Warnt vor jedem Löscehn eines datensatzes
CREATE OR REPLACE FUNCTION fn_warn_before_delete()
RETURNS trigger AS $$
BEGIN
  IF current_user = 'markus' THEN
    RAISE EXCEPTION 'Vorsicht! Möchten Sie wirklich diesen Datensatz löschen?';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

