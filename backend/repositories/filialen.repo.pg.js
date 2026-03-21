const pool = require("../db/pool");



/**
 * ============================================================================
 * Repository: filiale
 * ----------------------------------------------------------------------------
 * Verantwortlich für alle Datenbankzugriffe auf die Tabelle "filiale".
 *
 * Prinzip:
 * - Das Repository kapselt SQL-Statements zentral an einer Stelle.
 * - Routes/Controller müssen dadurch kein SQL enthalten.
 * - Parameterisierte Queries ($1, $2, ...) verhindern SQL-Injection.
 * ============================================================================
 */

/**
 * Legt eine neue Filiale in der Datenbank an.
 *
 * Wichtig:
 * - Es werden ausschließlich Werte aus dem übergebenen Objekt f übernommen.
 * - "RETURNING *" liefert den neu angelegten Datensatz direkt zurück,
 *   damit das Backend/Frontend die generierte fnr (Primary Key) sofort kennt.
 */
async function add(f) {
  const result = await pool.query(
    `
    INSERT INTO filiale (filialname, farbe, ort, strasse, plz, land, email, anmerkung, telefon, algorithmid)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *;
    `,
    [
      f.filialname,
      f.farbe,
      f.ort,
      f.strasse,
      f.plz,
      f.land,
      f.email,
      f.anmerkung ?? null,
      f.telefon,
      f.algorithmid,
    ],
  );

  // Bei INSERT RETURNING * kommt genau 1 Zeile zurück.
  return result.rows[0];
}

/**
 * Liefert alle Filialen.
 *
 * ORDER BY filialname sorgt für eine stabile und UI-freundliche Reihenfolge,
 * damit das Frontend nicht "zufällig" sortierte Daten erhält.
 */
async function getAll() {
  const result = await pool.query(`SELECT * FROM filiale WHERE aktiv = true ORDER BY filialname;`);
  return result.rows;
}

/**
 * Liefert eine Filiale anhand ihrer Filialnummer (fnr).
 *
 * Rückgabe:
 * - Objekt, wenn gefunden
 * - null, wenn nicht vorhanden (sauberer als undefined)
 */
async function getById(fnr) {
  const result = await pool.query(`SELECT * FROM filiale WHERE fnr = $1;`, [
    fnr,
  ]);
  return result.rows[0] || null;
}

/**
 * Aktualisiert eine Filiale (Teil-Update).
 *
 * Sicherheitsprinzip:
 * - allowedFields ist eine Whitelist, damit nur definierte Felder updatebar sind.
 * - Dadurch kann das Frontend keine beliebigen Spalten manipulieren.
 *
 * Technischer Zweck:
 * - dynamisches SET (setClause) ermöglicht ein flexibles Update,
 *   ohne für jede Kombination ein eigenes SQL-Statement zu schreiben.
 */
async function update(fnr, updates) {
  if ("anmerkungen" in updates && !("anmerkung" in updates)) {
    updates.anmerkung = updates.anmerkungen;
  }
  delete updates.anmerkungen;

  const allowedFields = [
    "filialname",
    "farbe",
    "ort",
    "strasse",
    "plz",
    "land",
    "email",
    "anmerkung",
    "telefon",
    "algorithmid",
  ];

  // Nur Felder übernehmen, die auf der Whitelist stehen
  const fields = Object.keys(updates).filter((f) => allowedFields.includes(f));

  // Wenn keine gültigen Felder enthalten sind -> keine DB-Operation
  if (fields.length === 0) return null;

  // Beispiel: "filialname = $1, farbe = $2"
  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");

  // Werte-Liste passend zur Placeholder-Reihenfolge ($1..$n)
  const values = fields.map((f) => updates[f]);

  // fnr wird als letztes Argument angehängt (WHERE fnr = $n)
  values.push(fnr);

  const result = await pool.query(
    `
    UPDATE filiale
    SET ${setClause}
    WHERE fnr = $${fields.length + 1}
    RETURNING *;
    `,
    values,
  );

  // RETURNING * liefert den aktualisierten Datensatz zurück
  return result.rows[0] || null;
}

/**
 * Deaktiviert eine Filiale anhand fnr (soft delete)
 *
 * Rückgabe:
 * - true  -> wenn tatsächlich eine Zeile gelöscht wurde
 * - false -> wenn keine Zeile existierte
 *
 * Vorteil:
 * Die Route kann damit sauber 404 oder Erfolg liefern.
 */
async function remove(fnr) {
  const result = await pool.query(
    `UPDATE filiale
     SET aktiv = FALSE
     WHERE fnr = $1
       AND aktiv = TRUE;`,
    [fnr],
  );
  return result.rowCount > 0;
}

module.exports = {
  getAll,
  add,
  getById,
  update,
  remove,
};
