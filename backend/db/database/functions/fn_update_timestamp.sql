
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.aktualisiert_am = current_timestamp;  --bei update aktualisieren
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;