
DROP TRIGGER IF EXISTS trg_warn_delete_mitarbeiter ON mitarbeiter;
DROP TRIGGER IF EXISTS trg_warn_delete_filiale ON filiale;

CREATE TRIGGER trg_warn_delete_mitarbeiter
BEFORE DELETE ON mitarbeiter
FOR EACH ROW
EXECUTE FUNCTION fn_warn_before_delete();

-- Das fenster muss im Frontend erstellt werden [gerendert] !!!!

CREATE TRIGGER trg_warn_delete_filiale
BEFORE DELETE ON filiale
FOR EACH ROW
EXECUTE FUNCTION fn_warn_before_delete();



