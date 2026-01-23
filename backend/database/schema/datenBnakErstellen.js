

/**
 * Javascript aufruf der DB bei der die DB immmer nur einmalig erstellt wird
 * Soll verhindern das bereits bestehende Daten vom Markus gelöscht werden.
 * Drop Database if Exists würde die Aktuelle DB [inklusive Daten vom AG] jedesmal löschen und
 * neu erstellen.
 */

const { Client } = require('pg');

async function createDatabaseIfNotExists(dbName) {
  // Verbindung zur Default-Datenbank (postgres) herstellen
  const client = new Client({
    user: 'testUser',
    host: 'localhost',
    database: 'postgres', // immer eine existierende DB
    password: '1234',
    port: 5432,
  });

  await client.connect();

  // Prüfen, ob die Datenbank existiert
  const res = await client.query(
    "SELECT 1 FROM pg_database WHERE datname=$1", 
    [dbName]
  );

  if (res.rowCount === 0) {
    // Datenbank existiert nicht - anlegen
    await client.query(`CREATE DATABASE ${dbName}`);
    console.log(`Database ${dbName} created`);
  } else {
    console.log(`Database ${dbName} already exists`);
  }

  await client.end();
}

// Beispielaufruf
createDatabaseIfNotExists('dienstplan').catch(console.error);
