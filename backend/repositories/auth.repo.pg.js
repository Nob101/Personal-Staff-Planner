const pool = require('../db/pool');
const bcrypt = require('bcrypt');

// Tabellenname angepasst -> von auth zu users
async function authenticate(username, password) {
  const result = await pool.query(
    `SELECT * FROM users WHERE username = $1`,
    [username]
  );

  const user = result.rows[0];
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return null;

  return { id: user.id, username: user.username, role: user.role };
}

module.exports = { authenticate };
