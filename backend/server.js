// server.js
// ============================================================================
// Einstiegspunkt des Backends (Express-Server)
//
// Aufgaben dieser Datei:
// - Initialisierung von Express und globaler Middleware (JSON, CORS)
// - Einbinden der REST-Routen (Auth, Mitarbeiter, Filialen, Dienstplan, Export)
// - Startlogik inkl. DB-Initialisierung und regelmäßiger Cleanup-Job
// ============================================================================

const express = require("express");
const app = express();

const cors = require("cors");

// Initialisierung/Setup der Datenbank (z.B. Tabellen/Schema prüfen/anlegen)
const db = require("./db/database/schema/database.js");

// Service zum Aufräumen alter Dienstplan-/Schichtdaten
const { deleteOldShifts } = require("./functions/cleanUpService");

// Middleware für Zugriffsschutz (Token-/Login-Prüfung)
// Hinweis: Aktivierung entscheidet, ob alle folgenden Routen geschützt sind.
const { loginAllowness } = require("./middleware/auth.middleware");

const PORT = 3001;

// ============================================================================
// Globale Middleware
// ----------------------------------------------------------------------------
// - express.json(): verarbeitet JSON-Request-Bodies (POST/PUT/PATCH)
// - cors(): erlaubt Zugriffe vom Frontend auf diese API (Cross-Origin Requests)
// ============================================================================
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true,
  exposedHeaders: ["Content-Disposition"],
}));


// ============================================================================
// Routen einbinden
// ----------------------------------------------------------------------------
// Die API ist nach Funktionsbereichen getrennt.
// Jede Route ist ein eigenes Modul, um den Code wartbar und übersichtlich zu halten.
// ============================================================================
const authRouter = require("./routes/auth.routes");
app.use("/api/auth", authRouter);

// Zugriffsschutz für alle nachfolgenden Routen.
// Aktivieren, wenn Login/Token-Pflicht im Projekt gefordert ist.
app.use(loginAllowness);

const mitarbeiterRouter = require("./routes/mitarbeiter.routes");
app.use("/api/mitarbeiter", mitarbeiterRouter);

const filialenRouter = require("./routes/filialen.routes");
app.use("/api/filialen", filialenRouter);

const dienstplanRouter = require("./routes/dienstplan.routes");
app.use("/api/dienstplan", dienstplanRouter);

// Export/Download-Funktionen (z.B. CSV-Export für Dienstpläne)
// const exportRouter = require("./routes/export.routes.js");
// app.use("/api/download", exportRouter);

// ============================================================================
// Startlogik
// ----------------------------------------------------------------------------
// Ablauf beim Start:
// 1) kurze Wartezeit (in Docker kann DB/Container-Startup verzögert sein)
// 2) Datenbank initialisieren
// 3) Cleanup beim Start ausführen
// 4) Cleanup regelmäßig (alle 24h) wiederholen
// 5) Server starten
// ============================================================================
async function startApp() {
  try {
    console.log("Warte kurz auf Docker/DB-Startup...");

    // In Docker-Setups kann es passieren, dass die DB noch nicht bereit ist.
    // Diese kurze Verzögerung reduziert Startfehler (z.B. connection refused).
    await new Promise((res) => setTimeout(res, 5000));

    await db.initDatabase();

    // Erster Cleanup direkt beim Start
    await deleteOldShifts();

    // Regelmäßiger Cleanup: alle 24 Stunden
    setInterval(async () => {
      await deleteOldShifts();
    }, 24 * 60 * 60 * 1000);

    app.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
  } catch (err) {
    console.error("Fehler beim Starten der Anwendung:", err);
    process.exit(1);
  }
}

// Serverstart
startApp();