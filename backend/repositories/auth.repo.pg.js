/*
Tabelle: auth
---------------------------------------------
id           SERIAL PRIMARY KEY
username     TEXT UNIQUE
password     TEXT

*/

const pool = require('../db/pool');
const bcrypt = require('bcrypt');

async function authenticate(username, password) {
  const result = await pool.query(
    `SELECT * FROM auth WHERE username = $1`,
    [username]
  );

  const user = result.rows[0];
  if (!user) return null;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return null;

  return { id: user.id, username: user.username };
}

module.exports = { authenticate };
