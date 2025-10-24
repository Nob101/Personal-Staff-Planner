
<h2>Architekur-Aufbau für die Datenbank</h2>

**In dem Ordner 'schema' sind:**
-reine SQL Scripte welche die tabellen und Datenstruktur defineiren

**In dem ordner 'functions' sind:**
-eigene funktionen, welche für die individuelle Abfragen/verarbeitungen verantwortlich sind


<u>___Wichtig___</u>

`Um Backend-code und Datenbankcode klar zu trennen.`




<h4>Was als nächstes kommt</h4>


````

Überprüfung der Logik


````




__Ablauf vom Aufruf der DB im JS__
````
-Der Aufruf zum Erstellen der DB erfolgt über eine HTTP-Route im Backend.
-Im Backend wird die DB per SQL-Befehl erstellt.
-JavaScript im Backend (Node.js) verwaltet die DB-Verbindung und SQL-Ausführung.
-Das Frontend ruft über fetch() eine Backend-URL auf, um die DB zu erstellen.


Code Beispiel:
Backend (Alexander):

const express = require('express');
const { Pool } = require('pg');
const fs = require('fs');

const app = express();
const port = 3000;

// Pool für DB-Verbindung, Anfang ohne Datenbankname, weil sie erstellt werden soll
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  password: 'password',
  port: 5432,
});

// Endpunkt zum Erstellen der DB und Ausführen der SQL-Datei
app.get('/createdb', async (req, res) => {
  try {
    // Datenbank erstellen (Postgres benötigt Verbindung zur Default-db, z.B. postgres)
    await pool.query('CREATE DATABASE meineDatenbank');
  } catch (err) {
    if (err.code !== '42P04') { // 42P04 = DB existiert bereits
      return res.status(500).send('Fehler bei der DB-Erstellung: ' + err.message);
    }
  }

  // Pool mit neuer Datenbank verbinden
  const dbPool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'meineDatenbank',
    password: 'password',
    port: 5432,
  });

  try {
    // SQL-Datei einlesen
    const sql = fs.readFileSync('./create_tables.sql', 'utf8');

    // SQL-Befehle ausführen
    await dbPool.query(sql);

    res.send('Datenbank und Tabellen erstellt via SQL-Script');
  } catch (err) {
    res.status(500).send('Fehler beim Ausführen des SQL-Skripts: ' + err.message);
  } finally {
    await dbPool.end();
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf http://localhost:${port}`);
});


````
