const pool = require('./pool');

(async () => {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Verbindung erfolgreich:', result.rows[0]);
  } catch (err) {
    console.error('❌ Verbindung fehlgeschlagen:', err.message);
  } finally {
    await pool.end();
  }
})();


