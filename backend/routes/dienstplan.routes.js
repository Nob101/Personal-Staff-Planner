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

/**
 * ============================================================================
 * Routen: /dienstplan
 * ----------------------------------------------------------------------------
 * Diese Routen bilden die REST-Schnittstelle für:
 * - Laden eines Dienstplans (Monat/Jahr)
 * - Generieren und Löschen von Monatsplänen
 * - Nachbearbeitung einzelner Dienste (Shift / Ersatz)
 * - manuelle Anpassung des Stundenkontos
 *
 * Hinweis zur Datenkonsistenz:
 * Bei Operationen, die Dienstplan + Stunden verändern, werden Transaktionen
 * verwendet (BEGIN/COMMIT/ROLLBACK), damit keine halbfertigen Zustände entstehen.
 * ============================================================================
 */

/* ============================================================================
 * GET /dienstplan?jahr=YYYY&monat=M
 * ----------------------------------------------------------------------------
 * Liefert alle Dienste für einen Monat (ohne Zusatzdaten wie Filialen etc.).
 * Wird typischerweise verwendet, wenn nur der Roh-Dienstplan benötigt wird.
 * ============================================================================
 */
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

/* ============================================================================
 * POST /dienstplan/generate
 * ----------------------------------------------------------------------------
 * Generiert den Dienstplan für einen Monat auf Basis:
 * - Filial-Algorithmus (Pattern)
 * - Mitarbeiter-Counter (rotierender Startpunkt)
 * - Sonderlogik (z.B. Springer)
 * - Stundenbegrenzung + Kürzungsphase (im Generator implementiert)
 *
 * Der Generator speichert intern die Ergebnisse in der Datenbank.
 * ============================================================================
 */


router.post("/generate", async (req, res) => {
  const { jahr, monat, fnr } = req.body;

  if (jahr == null || monat == null) {
    return res.status(400).json({ error: "jahr und monat Pflicht." });
  }

  try {
    const j = Number(jahr);
    const m = Number(monat);

    if (!Number.isInteger(j) || !Number.isInteger(m) || m < 1 || m > 12) {
      return res.status(400).json({ error: "Ungültiges jahr/monat." });
    }

    // fnr optional
    let f = null;
    if (fnr !== undefined && fnr !== null && fnr !== "") {
      f = Number(fnr);
      if (!Number.isInteger(f) || f <= 0) {
        return res.status(400).json({ error: "Ungültige fnr." });
      }
    }

    const plan = await generateDienstplan(j, m, f); // f kann null sein
    res.json(plan);
  } catch (err) {
    console.error("POST /dienstplan/generate", err);
    res.status(500).json({ error: "Fehler beim Generieren." });
  }
});

/* ============================================================================
 * DELETE /dienstplan/:jahr/:monat
 * ----------------------------------------------------------------------------
 * Löscht den kompletten Monatsplan aus der Datenbank.
 * Sinnvoll bei kompletter Neugenerierung oder Testläufen.
 * ============================================================================
 */
router.delete("/:jahr/:monat", async (req, res) => {
  try {
    const jahr = Number(req.params.jahr);
    const monat = Number(req.params.monat);
    const fnr = req.query.fnr ? Number(req.query.fnr) : null;

    if (!Number.isInteger(jahr) || !Number.isInteger(monat)) {
      return res.status(400).json({ error: "jahr und monat ungültig" });
    }

    if (fnr !== null && (!Number.isInteger(fnr) || fnr <= 0)) {
      return res.status(400).json({ error: "Ungültige fnr." });
    }

    let deleted;

    if (fnr) {
      deleted = await dienstplanRepo.deleteByMonth(jahr, monat, fnr);
    } else {
      deleted = await dienstplanRepo.deleteByMonth(jahr, monat);
    }

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

/* ============================================================================
 * Schichttypen + Stundenlogik
 * ----------------------------------------------------------------------------
 * Im System existieren folgende Schichttypen:
 * A = Frühdienst (9h)
 * E = Spätdienst (9h)
 * K = Krank (8h)   -> Sonderfall: zählt weniger als A/E
 * U = Urlaub (8h)  -> Sonderfall: zählt weniger als A/E
 * F = Frei (0h)
 *
 * Für nachträgliche Änderungen (Shift / Ersatz) wird die Stunden-Differenz
 * als Delta berechnet und in der stunden-Tabelle fortgeschrieben.
 * ============================================================================
 */
const ALLOWED = new Set(["A", "E", "F", "K", "U"]);

const STUNDEN_BY_TYP = {
  A: 9,
  E: 9,
  K: 8,
  U: 8,
  F: 0,
};

/**
 * Liefert die Soll-/Ist-Stunden, die ein Diensttyp "wert" ist.
 * Unbekannte Werte fallen kontrolliert auf 0 zurück.
 */
function stundenVonTyp(typ) {
  const t = String(typ ?? "F").trim().toUpperCase();
  return STUNDEN_BY_TYP[t] ?? 0;
}

/**
 * Berechnet die Stundenänderung, wenn ein Diensttyp geändert wird.
 * Beispiel: A(9) -> F(0) => -9
 *           E(9) -> K(8) => -1
 */
function deltaStunden(altTyp, neuTyp) {
  return stundenVonTyp(neuTyp) - stundenVonTyp(altTyp);
}

/* ============================================================================
 * POST /dienstplan/shift
 * ----------------------------------------------------------------------------
 * Ändert einen einzelnen Dienst (schicht_typ) und passt das Stundenkonto an.
 *
 * Warum Transaktion?
 * - Dienständerung und Stundenupdate müssen gemeinsam passieren.
 * - Bei Fehlern darf nicht nur eines von beiden gespeichert werden.
 * ============================================================================
 */
router.post("/shift", async (req, res) => {
  const client = await pool.connect();

  try {
    const id = Number(req.body.id);
    const neuTyp = String(req.body.schicht_typ ?? "").trim().toUpperCase();

    if (!Number.isFinite(id) || !neuTyp) {
      return res.status(400).json({ error: "id und schicht_typ sind Pflicht." });
    }
    if (!ALLOWED.has(neuTyp)) {
      return res.status(400).json({ error: "Ungültiger schicht_typ." });
    }

    await client.query("BEGIN");

    // Dienst vor der Änderung laden -> wird für Delta-Berechnung benötigt
    const before = await dienstplanRepo.getByIdTx(client, id);
    if (!before) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Dienst nicht gefunden." });
    }

    const delta = deltaStunden(before.schicht_typ, neuTyp);

    // Diensttyp aktualisieren
    const updated = await dienstplanRepo.dienstShiftTx(client, id, neuTyp);
    if (!updated) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Dienst nicht gefunden." });
    }

    // Stundenkonto nur dann verändern, wenn sich effektiv etwas ändert
    let stunden = null;
    if (delta !== 0) {
      stunden = await stundenRepo.updateIstStundenTx(
        client,
        before.mnr,
        before.jahr,
        before.monat,
        delta
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

/* ============================================================================
 * POST /dienstplan/shiftMitErsatz
 * ----------------------------------------------------------------------------
 * Spezialfall „Ersatzdienst“:
 * - Alt-Dienst: Mitarbeiter fällt aus -> bekommt z.B. K oder U
 * - Neu-Dienst: ein anderer Mitarbeiter übernimmt den ursprünglichen Diensttyp
 * - Zusätzlich wird die Arbeitsfiliale (fnr) beim Ersatz übernommen
 *
 * Warum Transaktion?
 * - Es werden zwei Dienste angepasst + zwei Stundenkonten aktualisiert.
 * - Der Vorgang muss atomar sein (alles oder nichts).
 * ============================================================================
 */
router.post("/shiftMitErsatz", async (req, res) => {
  const altId = Number(req.body.altId);
  const neuId = Number(req.body.neuId);
  const neuTypAltDienst = String(req.body.schicht_typ ?? "").trim().toUpperCase();

  if (!Number.isFinite(altId) || !Number.isFinite(neuId)) {
    return res.status(400).json({ error: "altId und neuId müssen Zahlen sein." });
  }
  if (altId === neuId) {
    return res.status(400).json({ error: "altId und neuId dürfen nicht gleich sein." });
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
      return res.status(404).json({ error: "Dienst (alt oder neu) nicht gefunden." });
    }

    // Ersatz ist nur sinnvoll, wenn beide Dienste am selben Datum stattfinden
    // (Normalisierung auf YYYY-MM-DD verhindert falsche Vergleiche mit Zeitanteil)
    const dAlt = String(dienstAlt.datum).slice(0, 10);
    const dNeu = String(dienstNeu.datum).slice(0, 10);
    if (dAlt !== dNeu) {
      await client.query("ROLLBACK");
      return res.status(400).json({ error: "Ersatz muss am selben Datum sein." });
    }

    // Der Ersatz übernimmt den ursprünglichen Typ des Alt-Dienstes
    const neuTypErsatzDienst = String(dienstAlt.schicht_typ ?? "F").trim().toUpperCase();
    if (!ALLOWED.has(neuTypErsatzDienst)) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Alt-Dienst hat ungültigen schicht_typ." });
    }

    // 1) Alt-Dienst wird auf K/U/F/... gesetzt
    const updatedAlt = await dienstplanRepo.dienstShiftTx(client, altId, neuTypAltDienst);

    // 2) Neu-Dienst übernimmt Typ + Arbeitsfiliale vom Alt-Dienst
    const updatedNeu = await dienstplanRepo.dienstShiftMitErsatzTx(
      client,
      neuId,
      neuTypErsatzDienst,
      dienstAlt.fnr
    );

    if (!updatedAlt || !updatedNeu) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Update nicht möglich (Dienst nicht gefunden/keine Änderung).",
      });
    }

    // Stunden erst nach erfolgreichem Update anpassen
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
        deltaAlt
      );
    }

    if (deltaNeu !== 0) {
      stundenNeu = await stundenRepo.updateIstStundenTx(
        client,
        dienstNeu.mnr,
        dienstNeu.jahr,
        dienstNeu.monat,
        deltaNeu
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
    res.status(500).json({ error: "Fehler beim Aktualisieren der Schicht mit Ersatz" });
  } finally {
    client.release();
  } 
});

/* ============================================================================
 * GET /dienstplan/view?jahr=YYYY&monat=M
 * ----------------------------------------------------------------------------
 * View-Route für das Frontend:
 * Liefert in einem Call alles, was zur Anzeige benötigt wird:
 * - Tage im Monat (für Spalten/Headers)
 * - Dienste
 * - Filialen
 * - Mitarbeiter (Basisdaten)
 * - Stundenkonto pro Mitarbeiter
 *
 * Vorteil: Frontend muss nicht mehrere Requests koordinieren.
 * ============================================================================
 */
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
      mitarbeiterRepo.getForDienstplanMonat(jahr, monat),//soft delete beachten
      stundenRepo.getStundenForMonthYear(monat, jahr),
    ]);

    // Datumsliste normalisieren (YYYY-MM-DD), damit das Frontend stabile Keys hat
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

/* ============================================================================
 * GET /dienstplan/:id/ersatz
 * ----------------------------------------------------------------------------
 * Liefert Kandidaten, die als Ersatz für einen konkreten Dienst in Frage kommen.
 * Die eigentliche Auswahl/Logik liegt im Repository (SQL/Regeln).
 * ============================================================================
 */
router.get("/:id/ersatz", async (req, res) => {
  try {
    const dienstId = Number(req.params.id);
    if (!Number.isFinite(dienstId)) {
      return res.status(400).json({ error: "Ungültige dienstId." });
    }

    const kandidaten = await dienstplanRepo.findErsatzKandidatenByDienstId(dienstId);
    res.json({ dienstId, kandidaten });
  } catch (err) {
    console.error("Fehler GET /dienstplan/:id/ersatz", err);
    res.status(500).json({ error: "Fehler beim Laden der Ersatz-Kandidaten" });
  }
});

/* ============================================================================
 * PUT /dienstplan/stunden
 * ----------------------------------------------------------------------------
 * Manuelle Nachbearbeitung des Stundenkontos.
 * Hintergrund: Der Dienstplan-Generator kann Soll/Ist berechnen,
 * aber der Auftraggeber soll Korrekturen (z.B. Auszahlungen/Anpassungen)
 * bewusst manuell eintragen können.
 *
 * Implementierung:
 * - Update erfolgt transaktional
 * - Differenz wird im Repo neu berechnet (Ist - Soll)
 * ============================================================================
 */
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

    const updated = await stundenRepo.updateIstStundenManuellTx(client, {
      mnr,
      jahr,
      monat,
      ist,
    });

    if (!updated) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Stunden-Datensatz nicht gefunden." });
    }

    await client.query("COMMIT");
    res.json({ message: "IST-Stunden aktualisiert", stunden: updated });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    console.error("PUT /dienstplan/stunden", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Stunden" });
  } finally {
    client.release();
  }
});

module.exports = router;