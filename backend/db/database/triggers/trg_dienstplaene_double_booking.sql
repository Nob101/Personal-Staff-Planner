CREATE TRIGGER trg_dienstplaene_double_booking
BEFORE INSERT OR UPDATE ON dienstplaene
FOR EACH ROW 
EXECUTE FUNCTION fn_prevent_double_booking();