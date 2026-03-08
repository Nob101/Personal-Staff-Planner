const pool = require("../db/pool");

/**
 * ============================================================================
 * User Repository
 * ----------------------------------------------------------------------------
 * Dieses Repository kapselt alle Datenbankzugriffe für die Tabelle `users`.
 *
 * Grundprinzip:
 * - Routes kümmern sich um HTTP (Request/Response)
 * - Repository kümmert sich ausschließlich um SQL / Datenbankzugriffe
 *
 * Sicherheitsentscheidungen:
 * - Admin-User werden hier bewusst geschützt
 * - Admin kann weder gelöscht noch geändert werden
 * - Neue Admins können über diese API nicht erstellt werden
 * ============================================================================
 */


/**
 * ============================================================================
 * mapUser
 * ----------------------------------------------------------------------------
 * Vereinheitlicht die Rückgabeform aus der Datenbank.
 *
 * Zweck:
 * - Nur die Felder zurückgeben, die das Backend/Frontend wirklich braucht
 * - password_hash wird bewusst NICHT zurückgegeben
 * ============================================================================
 */
function mapUser(row) {
  if (!row) return null;

  return {
    id: row.id,
    username: row.username,
    role: row.role,
  };
}


/**
 * ============================================================================
 * getAll
 * ----------------------------------------------------------------------------
 * Liefert alle Benutzer aus der Datenbank.
 *
 * Sicherheitsregel:
 * - Admin wird hier bewusst ausgeblendet
 *   (damit er im UI nicht versehentlich bearbeitet oder gelöscht wird)
 * ============================================================================
 */
async function getAll() {
  const r = await pool.query(
    `SELECT id, username, role
     FROM users
     WHERE role <> 'admin'
     ORDER BY id;`
  );

  return r.rows.map(mapUser);
}


/**
 * ============================================================================
 * getById
 * ----------------------------------------------------------------------------
 * Liefert einen einzelnen Benutzer anhand seiner ID.
 *
 * Sicherheitsregel:
 * - Admin wird auch hier ausgeschlossen
 * ============================================================================
 */
async function getById(id) {
  const r = await pool.query(
    `SELECT id, username, role
     FROM users
     WHERE id = $1
       AND role <> 'admin';`,
    [id]
  );

  return mapUser(r.rows[0]);
}


/**
 * ============================================================================
 * create
 * ----------------------------------------------------------------------------
 * Legt einen neuen Benutzer an.
 *
 * Sicherheit:
 * - Ein Benutzer kann hier nicht als "admin" erstellt werden
 * - Falls role = admin übergeben wird, wird sie automatisch auf "user" gesetzt
 *
 * Passwort:
 * - password_hash wird bereits in der Route mit bcrypt erzeugt
 * ============================================================================
 */
async function create({ username, password_hash, role = "user" }) {

  // Admin darf über diese Route nicht erstellt werden
  const safeRole = String(role).toLowerCase() === "admin" ? "user" : role;

  const r = await pool.query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, username, role;`,
    [username, password_hash, safeRole]
  );

  return mapUser(r.rows[0]);
}


/**
 * ============================================================================
 * updateById
 * ----------------------------------------------------------------------------
 * Aktualisiert einen bestehenden Benutzer.
 *
 * Sicherheitsregeln:
 * - Admin darf nicht verändert werden
 * - Niemand darf sich selbst zu admin machen
 *
 * Dynamisches Update:
 * - Nur übergebene Felder werden aktualisiert
 * - Dadurch werden keine Felder versehentlich überschrieben
 * ============================================================================
 */
async function updateById(id, updates) {

  // Schutz: Rolle darf nicht auf admin gesetzt werden
  if ("role" in updates && String(updates.role).toLowerCase() === "admin") {
    delete updates.role;
  }

  // erlaubte Felder für Updates
  const allowed = ["username", "password_hash", "role"];

  const fields = Object.keys(updates).filter((k) => allowed.includes(k));

  // Wenn keine gültigen Felder vorhanden sind -> kein Update
  if (fields.length === 0) return null;

  // Dynamische SET-Klausel erzeugen
  const setClause = fields
    .map((f, i) => `${f} = $${i + 1}`)
    .join(", ");

  const values = fields.map((f) => updates[f]);
  values.push(id);

  const r = await pool.query(
    `UPDATE users
     SET ${setClause}
     WHERE id = $${fields.length + 1}
       AND role <> 'admin'
     RETURNING id, username, role;`,
    values
  );

  return mapUser(r.rows[0]) || null;
}


/**
 * ============================================================================
 * removeById
 * ----------------------------------------------------------------------------
 * Löscht einen Benutzer anhand seiner ID.
 *
 * Sicherheitsregel:
 * - Admin kann nicht gelöscht werden
 *
 * Rückgabe:
 * - true  -> Benutzer wurde gelöscht
 * - false -> Benutzer existiert nicht oder war Admin
 * ============================================================================
 */
async function removeById(id) {
  const r = await pool.query(
    `DELETE FROM users
     WHERE id = $1
       AND role <> 'admin';`,
    [id]
  );

  return r.rowCount > 0;
}


module.exports = {
  getAll,
  getById,
  create,
  updateById,
  removeById,
};