
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.erstellt_am = NOW();  --bei update aktualisieren
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;