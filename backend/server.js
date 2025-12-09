// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;

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

const algorithmenRouter = require('./routes/algorithmen.routes');
app.use('/api/algorithmen', algorithmenRouter);

const authRouter = require('./routes/auth.routes');
app.use('/api/auth', authRouter);


// ---------------------
//   SERVER STARTEN
// ---------------------
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
