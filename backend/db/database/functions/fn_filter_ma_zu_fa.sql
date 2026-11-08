
-- Lists all employees assigned to a specific branch

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


-- Execution within the Node.js application
-- const { rows } = await pool.query('SELECT * FROM fn_list_employees_by_filiale($1)', [fnr]);


