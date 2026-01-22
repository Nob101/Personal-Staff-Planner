// server.js
const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db/database/schema/database.js");
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(cors());

// ROUTES
app.use("/api/mitarbeiter", require("./routes/mitarbeiter.routes"));
app.use("/api/filialen", require("./routes/filialen.routes"));
app.use("/api/dienstplan", require("./routes/dienstplan.routes"));
app.use("/api/auth", require("./routes/auth.routes"));

// SERVER STARTEN
const shouldInitDb = String(process.env.INIT_DB).toLowerCase() === "true";

async function startApp() {
  try {
    console.log("Docker braucht für den Aufbau länger....");
    await new Promise((res) => setTimeout(res, 5000));

    if (shouldInitDb) {
      console.log("--- DB-Initialisierung gestartet (INIT_DB=true) ---");
      await db.initDatabase();
    } else {
      console.log("INIT_DB=false -> DB-Initialisierung übersprungen");
    }

    app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
  } catch (err) {
    console.error("Fehler beim starten der Anwendung:", err);
    process.exit(1);
  }
}

startApp();