// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db/database/schema/database.js')
const { deleteOldShifts } = require('./functions/cleanUpService');
const PORT = 3001;


// Middleware
app.use(express.json()); // JSON-Body verarbeiten
app.use(cors());         // Cross-Origin-Zugriff erlauben

// ---------------------
//   ROUTES EINBINDEN
// ---------------------
const mitarbeiterRouter = require('./routes/mitarbeiter.routes');
app.use('/api/mitarbeiter', mitarbeiterRouter);

const filialenRouter = require('./routes/filialen.routes');
app.use('/api/filialen', filialenRouter);

const dienstplanRouter = require('./routes/dienstplan.routes');
app.use('/api/dienstplan', dienstplanRouter);

// Wieder Aktiv (war auskommentiert)
const authRouter = require('./routes/auth.routes');
app.use('/api/auth', authRouter); 

// NEU: Route für Export der dienstpläne in csv format
const exportRouter = require('./routes/export.routes.js')
app.use('/api/download', exportRouter);

// ---------------------
//   SERVER STARTEN
// ---------------------



async function startApp() {

  try {
    console.log('Docker braucht für den aufbau Länger....')
    await new Promise(res => setTimeout(res, 5000));
    await db.initDatabase();
    await deleteOldShifts();  //erster cleanup beim starten


     setInterval(async () => {
          // console.log("Täglicher automatischer Cleanup...");
      await deleteOldShifts();
        }, 24 * 60 * 60 * 1000);  // 24 stunden täglicher Clean check


    app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
  } catch (err) {
    console.error("Fehler beim starten der Anwendung:", err);
    process.exit(1);
  }
}


startApp();

