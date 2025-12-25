DROP TRIGGER IF EXISTS trg_dienstplaene_update ON dienstplaene;
CREATE TRIGGER trg_dienstplaene_update
BEFORE UPDATE ON dienstplaene
FOR EACH ROW 
EXECUTE FUNCTION fn_update_timestamp();

