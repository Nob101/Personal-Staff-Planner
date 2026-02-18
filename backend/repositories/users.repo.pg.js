const pool = require("../db/pool");

function mapUser(row) {
  if (!row) return null;
  return { id: row.id, username: row.username, role: row.role };
}

async function getAll() {
  const r = await pool.query(
    `SELECT id, username, role
     FROM users
     WHERE role <> 'admin'
     ORDER BY id;`
  );
  return r.rows.map(mapUser);
}

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

async function create({ username, password_hash, role = "user" }) {
  // Admin darf hier nicht erstellt werden
  const safeRole = String(role).toLowerCase() === "admin" ? "user" : role;

  const r = await pool.query(
    `INSERT INTO users (username, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, username, role;`,
    [username, password_hash, safeRole]
  );
  return mapUser(r.rows[0]);
}

async function updateById(id, updates) {
  // Admin darf nicht verändert werden
  // und niemand darf sich zu admin machen
  if ("role" in updates && String(updates.role).toLowerCase() === "admin") {
    delete updates.role;
  }

  const allowed = ["username", "password_hash", "role"];
  const fields = Object.keys(updates).filter((k) => allowed.includes(k));
  if (fields.length === 0) return null;

  const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
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