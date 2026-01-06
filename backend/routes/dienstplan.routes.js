const express = require('express');
const router = express.Router();

const dienstplanRepo   = require('../repositories/dienstplan.repo.pg');
const { generateDienstplan } = require('../functions/dienstplanGenerator');
const mitarbeiterRepo  = require('../repositories/mitarbeiter.repo.pg');
const {savePlan} = require('../functions/savePlan');


router.get("/", async (req, res) => {
  const jahr = Number(req.query.jahr);
  const monat = Number(req.query.monat);

  if (!jahr || !monat) {
    return res.status(400).json({ error: "jahr und monat Pflicht." });
  }

  try {
    const dienste = await dienstplanRepo.getByDate(jahr, monat);
    res.json({ jahr, monat, dienste });
  } catch (err) {
    console.error("GET /dienstplan", err);
    res.status(500).json({ error: "Fehler beim Laden." });
  }
});


router.post('/generate', async (req, res) => {
  const { jahr, monat } = req.body;

  if (!jahr || !monat) {
    return res.status(400).json({ error: 'jahr und monat Pflicht.' });
  }

  try {
    const j = Number(jahr);
    const m = Number(monat);

    const plan = await generateDienstplan(j, m);
   


    

    res.json(plan); 
  } catch (err) {
    console.error('POST /dienstplan/generate', err);
    res.status(500).json({ error: 'Fehler beim Generieren.' });
  }
});


router.delete("/:jahr/:monat", async (req, res) => {
  try {
    const jahr = Number(req.params.jahr);
    const monat = Number(req.params.monat);

    if (!Number.isInteger(jahr) || !Number.isInteger(monat)) {
      return res.status(400).json({ error: "jahr und monat ungültig" });
    }

    const deleted = await dienstplanRepo.deleteByMonth(jahr, monat);

    res.json({
      message: "Dienstplan gelöscht",
      jahr,
      monat,
      deletedEintraege: deleted,
    });
  } catch (err) {
    console.error("Fehler DELETE /dienstplan/:jahr/:monat", err);
    res.status(500).json({ error: "Fehler beim Löschen des Dienstplans" });
  }
});



module.exports = router;





