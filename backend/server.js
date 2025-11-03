const express = require('express');
const app = express();
const cors = require('cors');
const PORT = 3000;

const mitarbeiterRouter = require('./routes/mitarbeiter.js');

app.use(express.json());
app.use(cors());


app.use('/api/mitarbeiter', mitarbeiterRouter);




app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
