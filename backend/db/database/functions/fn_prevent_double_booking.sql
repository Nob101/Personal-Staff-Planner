CREATE OR REPLACE FUNCTION fn_prevent_double_booking()
RETURNS TRIGGER AS $$
BEGIN

    IF EXISTS(
        SELECT 1 FROM dienstplaene
        WHERE mnr = NEW.mnr 
        AND datum = NEW.datum 
        AND id != NEW.id    --ignorieren bei updates -> wichtig

    )THEN
        RAISE EXCEPTION 'MItarbeiter (MNR: %) ist an diesem Tag bereits verplant', NEW.mnr;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;