
-- Trigger function to automatically update the timestamp on row modification
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically set the update timestamp to the current time
    NEW.aktualisiert_am = now();  
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

