
-- Listet alle MA die in einer Filaile zugeteilt sind
CREATE OR REPLACE FUNCTION fn_list_employees_by_filiale(fnr INTEGER)
RETURNS TABLE (
  mnr INTEGER,
  vorname VARCHAR,
  nachname VARCHAR,
  akurzl VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT m.MNr, m.Vorname, m.Nachname, m.AKurzl
  FROM mitarbeiter m
  JOIN mitarbeiter_arbeitet_in_Filiale mf ON m.MNr = mf.MNr
  WHERE mf.FNr = fnr;
END;
$$ LANGUAGE plpgsql;


-- Aufruf im Node.js file mit...
-- const { rows } = await pool.query('SELECT * FROM fn_list_employees_by_filiale($1)', [fnr]);


