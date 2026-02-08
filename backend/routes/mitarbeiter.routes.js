const express = require("express");
const router = express.Router();

const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const filialenRepo = require("../repositories/filialen.repo.pg");
const dienstplanRepo = require("../repositories/dienstplan.repo.pg");


const { setCounterForMitarbeiter } = require("../functions/setCounter");
const {
  resetCountersForFiliale,
} = require("../functions/resetCountersForFiliale");
const {
  fromFrontend,
  toFrontend,
  fromFrontendPatch,
} = require("../mappers/mitarbeiter.mapper");

// -----------------------------
// GET: alle Mitarbeiter (inkl. kontakt/telefon/email/nebenfilialen)
// -----------------------------
router.get("/", async (_req, res) => {
  try {
    const [data, filialen] = await Promise.all([
      mitarbeiterRepo.getAllWithDetails(),
      filialenRepo.getAll(),
    ]);
    res.json(data.map((m) => toFrontend(m, filialen)));
  } catch (err) {
    console.error("Fehler GET /mitarbeiter:", err);
    res.status(500).json({ error: "Fehler beim Laden der Mitarbeiter" });
  }
});   

// -----------------------------
// GET: Mitarbeiter by mnr (inkl. details)
// -----------------------------
router.get("/:mnr", async (req, res) => {
  try {
    const mnr = Number(req.params.mnr);
    if (!Number.isFinite(mnr)) {
      return res.status(400).json({ error: "Ungültige mnr" });
    }

    const [ma, filialen] = await Promise.all([
      mitarbeiterRepo.getByIdWithDetails(mnr),
      filialenRepo.getAll(),
    ]);

    if (!ma) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }

    res.json(toFrontend(ma, filialen));
  } catch (err) {
    console.error("Fehler GET /mitarbeiter/:mnr:", err);
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});
// -----------------------------
// POST: Mitarbeiter anlegen (inkl. kontakt/telefon/email/nebenfilialen)
// -----------------------------
router.post("/", async (req, res) => {
  try {
    const b = req.body;
    if (!b.vorname || !b.nachname) {
      return res
        .status(400)
        .json({ error: "vorname und nachname sind Pflicht" });
    }
    console.log("POST /mitarbeiter body:", JSON.stringify(req.body, null, 2));
    const payload = fromFrontend(b);
    if (payload.springer === true && payload.hauptfiliale_fnr) {
      const filiale = await filialenRepo.getById(payload.hauptfiliale_fnr);
      payload.springeralgorithmid = getGegenwertAlgoId(filiale.algorithmid);
    } else {
      payload.springeralgorithmid = null;
    }
    // Fehlersuche console.log("mapped payload:", payload);
    const created = await mitarbeiterRepo.addWithDetails(payload);

    if (created?.hauptfiliale_fnr) {
      await resetCountersForFiliale(created.hauptfiliale_fnr);
      await setCounterForMitarbeiter(created.hauptfiliale_fnr);
    }

    const fresh = await mitarbeiterRepo.getByIdWithDetails(created.mnr);
    const filialen = await filialenRepo.getAll();
    res.status(201).json(toFrontend(fresh, filialen));
  } catch (err) {
    console.error("Fehler POST /mitarbeiter:", err);
    res.status(500).json({ error: "Fehler beim Anlegen" });
  }
});

router.put("/:mnr", async (req, res) => {
  try {
    const mnr = Number(req.params.mnr);
    if (!Number.isFinite(mnr)) {
      return res.status(400).json({ error: "Ungültige mnr" });
    }

    const before = await mitarbeiterRepo.getByIdWithDetails(mnr);
    if (!before) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }

    const updates = fromFrontendPatch(req.body);

    const springerAfter =
      updates.springer !== undefined ? updates.springer : before.springer;

    const hfAfter =
      updates.hauptfiliale_fnr !== undefined
        ? updates.hauptfiliale_fnr
        : before.hauptfiliale_fnr;

    if (springerAfter === true) {
      if (hfAfter) {
        const filiale = await filialenRepo.getById(hfAfter);
        updates.springeralgorithmid = getGegenwertAlgoId(filiale.algorithmid);
      } else {
        updates.springeralgorithmid = null;
      }
    }

    if (springerAfter === false) {
      updates.springeralgorithmid = null;
    }

    const updated = await mitarbeiterRepo.updateWithDetails(mnr, updates);
    if (!updated) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }

    const oldF = before.hauptfiliale_fnr ?? null;
    const newF = updated.hauptfiliale_fnr ?? null;

    if (oldF !== newF) {
      if (oldF) {
        await resetCountersForFiliale(oldF);
        await setCounterForMitarbeiter(oldF);
      }
      if (newF) {
        await resetCountersForFiliale(newF);
        await setCounterForMitarbeiter(newF);
      }
    }

    const [fresh, filialen] = await Promise.all([
      mitarbeiterRepo.getByIdWithDetails(mnr),
      filialenRepo.getAll(),
    ]);

    res.json(toFrontend(fresh, filialen));
  } catch (err) {
    console.error("Fehler PUT /mitarbeiter/:mnr:", err);
    res.status(500).json({ error: "Fehler beim Bearbeiten" });
  }
});

router.delete("/:mnr", async (req, res) => {
  try {
    const mnr = Number(req.params.mnr);
    if (!Number.isFinite(mnr)) {
      return res.status(400).json({ error: "Ungültige mnr" });
    }

    // Vorher holen (damit wir wissen, welche Filiale betroffen ist)
    const before = await mitarbeiterRepo.getByIdWithDetails(mnr);
    if (!before) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }

    const removed = await mitarbeiterRepo.remove(mnr);
    if (!removed) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }

    // Counter der Filiale neu verteilen
    if (before.hauptfiliale_fnr) {
      await resetCountersForFiliale(before.hauptfiliale_fnr);
      await setCounterForMitarbeiter(before.hauptfiliale_fnr);
    }

    res.json({ message: "Mitarbeiter gelöscht" });
  } catch (err) {
    console.error("Fehler DELETE /mitarbeiter/:mnr:", err);
    res.status(500).json({ error: "Fehler beim Löschen" });
  }
});

/* 
Hilfsfunktion: Gegenwert-Algorithmus-ID holen
Wenn Filiale Algorithmus-ID 1 hat, dann Gegenwert 2, und umgekehrt.
Falls was anderes kommt, wird das gleiche zurückgegeben (Fallback).
 */

function getGegenwertAlgoId(filialAlgoId) {
  const id = Number(filialAlgoId);
  if (id === 1) return 2;
  if (id === 2) return 1;
  return id; //
}

module.exports = router;
