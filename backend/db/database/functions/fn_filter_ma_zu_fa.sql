
-- Listet alle MA die in einer Filaile zugeteilt sind
-- !!! An aktuelle DB angepasst !!!
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
  JOIN mitarbeiter_arbeitet_in_Filiale mf ON m.mnr = mf.mnr
  LEFT JOIN filiale f ON m.hauptfiliale_fnr = f.fnr
  WHERE mf.FNr = fnr;
END;
$$ LANGUAGE plpgsql;


-- Aufruf im Node.js file mit...
-- const { rows } = await pool.query('SELECT * FROM fn_list_employees_by_filiale($1)', [fnr]);


