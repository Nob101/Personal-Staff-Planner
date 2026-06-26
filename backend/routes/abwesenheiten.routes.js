const express = require("express");
const router = express.Router();

const abwesenheitenRepo = require("../repositories/abwesenheiten.repo.pg.js");

router.get("/mitarbeiter/:mnr", async (req, res) => {
  const mnr = Number(req.params.mnr);
  const data = await abwesenheitenRepo.findByMitarbeiter(mnr);
  res.json(data);
});

router.post("/", async (req, res) => {
  try {
    const { mnr, von, bis, typ, anmerkung } = req.body;

    const created = await abwesenheitenRepo.create({
      mnr,
      von,
      bis,
      typ,
      anmerkung,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(err.status || 500).json({
      error: err.message || "Abwesenheit konnte nicht gespeichert werden",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const deleted = await abwesenheitenRepo.remove(id);

  if (!deleted) {
    return res.status(404).json({ message: "Abwesenheit nicht gefunden" });
  }

  res.json({ message: "Abwesenheit gelöscht" });
});

/* test */
router.get("/", async (req, res) => {
  const jahr = Number(req.query.jahr);
  const monat = Number(req.query.monat);

  if (jahr && monat) {
    const data = await abwesenheitenRepo.findByMonat(jahr, monat);
    return res.json(data);
  }

  const data = await abwesenheitenRepo.findAll();
  res.json(data);
});

module.exports = router;