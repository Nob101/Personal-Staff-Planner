
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.aktualisiert_am = now();  --bei update aktualisieren
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;