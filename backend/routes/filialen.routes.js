const express = require("express");
const router = express.Router();
const filialeRepo = require("../repositories/filialen.repo.pg");

router.post("/", async (req, res) => {
  try {
    const { filialname, strasse, plz, land, telefon, email, farbe, ort, algorithmid } = req.body;

    if (!filialname) {
      return res.status(400).json({ error: "filialname ist Pflicht" });
    }

    const created = await filialeRepo.add({
      filialname,
      strasse: strasse ?? null,
      plz: plz ?? null,
      ort: ort ?? null,
      land: land ?? "Österreich",
      telefon: telefon ?? null,
      email: email ?? null,
      farbe: farbe ?? "#3498db",
      algorithmid: algorithmid, 
    });

    res.status(201).json(created);
  } catch (err) {
    console.error("Fehler POST /filialen:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", async (_req, res) => {
  try {
    const data = await filialeRepo.getAll();
    res.json(data);
  } catch (err) {
    console.error("Fehler GET /filialen:", err);
    res.status(500).json({ error: "Fehler beim Laden der Filialen" });
  }
});

router.get("/:fnr", async (req, res) => {
  try {
    const fnr = Number(req.params.fnr);
    const filiale = await filialeRepo.getById(fnr);
    if (!filiale) {
      return res.status(404).json({ error: "Filiale nicht gefunden" });
    }
    res.json(filiale);
  } catch (err) {
    console.error("Fehler GET /filialen/:id:", err);
    res.status(500).json({ error: "Fehler beim Laden der Filiale" });
  }
});

router.put("/:fnr", async (req, res) => {
  try {
    const fnr = Number(req.params.fnr);
    const updates = req.body;

    const updated = await filialeRepo.update(fnr, updates);
    if (!updated) {
      return res.status(404).json({ error: "Filiale nicht gefunden" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Fehler PUT /filialen/:fnr:", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Filiale" });
  }
});

router.delete("/:fnr", async (req, res) => {
  try {
    const fnr = Number(req.params.fnr);
    const deleted = await filialeRepo.remove(fnr);
    if (!deleted) {
      return res.status(404).json({ error: "Filiale nicht gefunden" });
    }
    res.json({ message: "Filiale gelöscht" });
  } catch (err) {
    console.error("Fehler DELETE /filialen/:fnr:", err);
    res.status(500).json({ error: "Fehler beim Löschen der Filiale" });
  }
});

module.exports = router;




