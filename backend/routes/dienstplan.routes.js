const express = require("express");
const router = express.Router();

const dienstplanRepo = require("../repositories/dienstplan.repo.pg");
const { generateDienstplan } = require("../functions/dienstplanGenerator");
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const { savePlan } = require("../functions/savePlan");


const filialenRepo = require("../repositories/filialen.repo.pg");
const stundenRepo = require("../repositories/stunden.repo.pg");
const { getAllDatesOfMonth } = require("../functions/dateUtils");

const pool = require("../db/pool");

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

router.post("/generate", async (req, res) => {
  const { jahr, monat } = req.body;

  if (!jahr || !monat) {
    return res.status(400).json({ error: "jahr und monat Pflicht." });
  }

  try {  
    const j = Number(jahr);
    const m = Number(monat);

    const plan = await generateDienstplan(j, m);

    res.json(plan);
  } catch (err) {
    
    res.status(500).json({ error: "Fehler beim Generieren." });
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

const ALLOWED = new Set(["A", "E", "F", "K", "U"]);

const STUNDEN_BY_TYP = {
  A: 9,
  E: 9,
  K: 8,
  U: 8,
  F: 0,
};

function stundenVonTyp(typ) {
  const t = String(typ ?? "F")
    .trim()
    .toUpperCase();
  return STUNDEN_BY_TYP[t] ?? 0;
}

function deltaStunden(altTyp, neuTyp) {
  return stundenVonTyp(neuTyp) - stundenVonTyp(altTyp);
}

router.post("/shift", async (req, res) => {
  const client = await pool.connect();

  try {
    const id = Number(req.body.id);
    const neuTyp = String(req.body.schicht_typ ?? "")
      .trim()
      .toUpperCase();

    if (!Number.isFinite(id) || !neuTyp) {
      return res
        .status(400)
        .json({ error: "id und schicht_typ sind Pflicht." });
    }
    if (!ALLOWED.has(neuTyp)) {
      return res.status(400).json({ error: "Ungültiger schicht_typ." });
    }

    await client.query("BEGIN");

    const before = await dienstplanRepo.getByIdTx(client, id);
    if (!before) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Dienst nicht gefunden." });
    }

    const delta = deltaStunden(before.schicht_typ, neuTyp);

    const updated = await dienstplanRepo.dienstShiftTx(client, id, neuTyp);
    if (!updated) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Dienst nicht gefunden." });
    }

    let stunden = null;
    if (delta !== 0) {
      stunden = await stundenRepo.updateIstStundenTx(
        client,
        before.mnr,
        before.jahr,
        before.monat,
        delta,
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Schicht aktualisiert",
      delta,
      dienst: updated,
      stunden,
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    console.error("Fehler POST /dienstplan/shift", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Schicht" });
  } finally {
    client.release();
  }
});

router.post("/shiftMitErsatz", async (req, res) => {
  const altId = Number(req.body.altId);
  const neuId = Number(req.body.neuId);
  const neuTypAltDienst = String(req.body.schicht_typ ?? "")
    .trim()
    .toUpperCase();

  if (!Number.isFinite(altId) || !Number.isFinite(neuId)) {
    return res
      .status(400)
      .json({ error: "altId und neuId müssen Zahlen sein." });
  }
  if (altId === neuId) {
    return res
      .status(400)
      .json({ error: "altId und neuId dürfen nicht gleich sein." });
  }
  if (!ALLOWED.has(neuTypAltDienst)) {
    return res.status(400).json({ error: "Ungültiger schicht_typ." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const dienstAlt = await dienstplanRepo.getByIdTx(client, altId);
    const dienstNeu = await dienstplanRepo.getByIdTx(client, neuId);

    if (!dienstAlt || !dienstNeu) {
      await client.query("ROLLBACK");
      return res
        .status(404)
        .json({ error: "Dienst (alt oder neu) nicht gefunden." });
    }

    // Datum normalisieren (YYYY-MM-DD), sonst String-Vergleich kann falsche Unterschiede zeigen
    const dAlt = String(dienstAlt.datum).slice(0, 10);
    const dNeu = String(dienstNeu.datum).slice(0, 10);
    if (dAlt !== dNeu) {
      await client.query("ROLLBACK");
      return res
        .status(400)
        .json({ error: "Ersatz muss am selben Datum sein." });
    }

    // Ersatz übernimmt den ALTEN Typ vom Alt-Dienst (BEVOR er geändert wird!)
    const neuTypErsatzDienst = String(dienstAlt.schicht_typ ?? "F")
      .trim()
      .toUpperCase();
    if (!ALLOWED.has(neuTypErsatzDienst)) {
      await client.query("ROLLBACK");
      return res
        .status(409)
        .json({ error: "Alt-Dienst hat ungültigen schicht_typ." });
    }

    // Updates
    const updatedAlt = await dienstplanRepo.dienstShiftTx(
      client,
      altId,
      neuTypAltDienst,
    );
    const updatedNeu = await dienstplanRepo.dienstShiftMitErsatzTx(
      client,
      neuId,
      neuTypErsatzDienst,
      dienstAlt.fnr,
    );

    if (!updatedAlt || !updatedNeu) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Update nicht möglich (Dienst nicht gefunden/keine Änderung).",
      });
    }

    // Stunden-Deltas erst NACH erfolgreichen Updates
    const deltaAlt = deltaStunden(dienstAlt.schicht_typ, neuTypAltDienst);
    const deltaNeu = deltaStunden(dienstNeu.schicht_typ, neuTypErsatzDienst);

    let stundenAlt = null;
    let stundenNeu = null;

    if (deltaAlt !== 0) {
      stundenAlt = await stundenRepo.updateIstStundenTx(
        client,
        dienstAlt.mnr,
        dienstAlt.jahr,
        dienstAlt.monat,
        deltaAlt,
      );
    }

    if (deltaNeu !== 0) {
      stundenNeu = await stundenRepo.updateIstStundenTx(
        client,
        dienstNeu.mnr,
        dienstNeu.jahr,
        dienstNeu.monat,
        deltaNeu,
      );
    }
    
    await client.query("COMMIT");

    res.json({
      message: "Schicht mit Ersatz aktualisiert",
      delta: {
        alt: deltaAlt,
        neu: deltaNeu,
      },
      dienstAlt: updatedAlt,
      dienstNeu: updatedNeu,
      stunden: {
        alt: stundenAlt,
        neu: stundenNeu,
      },
    });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {}

    console.error("Fehler POST /dienstplan/shiftMitErsatz", err);
    res
      .status(500)
      .json({ error: "Fehler beim Aktualisieren der Schicht mit Ersatz" });
  } finally {
    client.release();
  }
});

router.get("/view", async (req, res) => {
  const jahr = Number(req.query.jahr);
  const monat = Number(req.query.monat);

  if (!Number.isInteger(jahr) || !Number.isInteger(monat)) {
    return res.status(400).json({ error: "jahr und monat Pflicht." });
  }

  try {
    const [dienste, filialen, mitarbeiter, stunden] = await Promise.all([
      dienstplanRepo.getByDate(jahr, monat),
      filialenRepo.getAll(),
      mitarbeiterRepo.getAllBase(),
      stundenRepo.getStundenForMonthYear(monat, jahr),
    ]);

    const tage = getAllDatesOfMonth(jahr, monat).map((d) => {
      if (d instanceof Date) return d.toISOString().slice(0, 10);

      const s = String(d);
      return s.length >= 10 ? s.slice(0, 10) : s;
    });

    res.json({ jahr, monat, tage, dienste, filialen, mitarbeiter, stunden });
  } catch (err) {
    console.error("GET /dienstplan/view", err);
    res.status(500).json({ error: "Fehler beim Laden." });
  }
});

router.get("/:id/ersatz", async (req, res) => {
  try {
    const dienstId = Number(req.params.id);
    if (!Number.isFinite(dienstId)) {
      return res.status(400).json({ error: "Ungültige dienstId." });
    }

    const kandidaten =
      await dienstplanRepo.findErsatzKandidatenByDienstId(dienstId);
    res.json({ dienstId, kandidaten });
  } catch (err) {
    console.error("Fehler GET /dienstplan/:id/ersatz", err);
    res.status(500).json({ error: "Fehler beim Laden der Ersatz-Kandidaten" });
  }
});

router.put("/stunden", async (req, res) => {
  const client = await pool.connect();

  try {
    const mnr = Number(req.body.mnr);
    const jahr = Number(req.body.jahr);
    const monat = Number(req.body.monat);
    const ist = Number(req.body.ist_stunden_monat);

    if (!Number.isFinite(mnr) || !Number.isInteger(jahr) || !Number.isInteger(monat)) {
      return res.status(400).json({ error: "mnr, jahr, monat sind Pflicht." });
    }

    if (!Number.isFinite(ist) || ist < 0) {
      return res.status(400).json({ error: "ist_stunden_monat ungültig." });
    }

    await client.query("BEGIN");

    const updated = await stundenRepo.updateIstStundenManuellTx(
      client,
      { mnr, jahr, monat, ist }
    );

    if (!updated) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Stunden-Datensatz nicht gefunden." });
    }

    await client.query("COMMIT");
    res.json({ message: "IST-Stunden aktualisiert", stunden: updated });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("PUT /dienstplan/stunden", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Stunden" });
  } finally {
    client.release();
  }
});



module.exports = router;
