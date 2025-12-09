const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;

app.use(express.json());
app.use(cors());


const mitarbeiterRouter = require('./routes/mitarbeiter');
app.use('/api/mitarbeiter', mitarbeiterRouter);

const filialenRouter = require('./routes/filialen');
app.use('/api/filialen', filialenRouter);

const dienstplanRouter = require('./routes/dienstplan');
app.use('/api/dienstplan', dienstplanRouter);



app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});