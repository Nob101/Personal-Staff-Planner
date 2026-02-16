const express = require("express");
const router = express.Router();
const filialeRepo = require("../repositories/filialen.repo.pg");

function toFrontendFiliale(f) {
  if (!f) return f;
  return {
    ...f,
    anmerkungen: f.anmerkung ?? null,
  };
}

/**
 * ============================================================================
 * FILIALEN ROUTES
 * ----------------------------------------------------------------------------
 * Diese Routes kapseln alle HTTP-Endpunkte für die Verwaltung von Filialen.
 *
 * Grundidee:
 * - Die Route ist nur für Request/Response zuständig (Input prüfen, HTTP-Codes)
 * - Die eigentliche DB-Arbeit passiert im Repository (filialen.repo.pg)
 *
 * Vorteil:
 * - saubere Schichtung (Route -> Repo)
 * - leichter testbar und wartbar
 * ============================================================================
 */

/**
 * ----------------------------------------------------------------------------
 * POST /filialen
 * Legt eine neue Filiale an.
 *
 * Validierung:
 * - filialname ist Pflicht, da ohne Namen keine sinnvolle Anzeige/Zuordnung möglich ist
 *
 * Defaults:
 * - land: "Österreich" (Standardfall im Projekt)
 * - farbe: "#3498db" (Fallback, falls keine Filialfarbe gesetzt wurde)
 * ----------------------------------------------------------------------------
 */
router.post("/", async (req, res) => {
  try {
    const {
      filialname,
      strasse,
      plz,
      land,
      telefon,
      email,
      anmerkungen,
      farbe,
      ort,
      algorithmid,
    } = req.body;

    if (!filialname) {
      return res.status(400).json({ error: "filialname ist Pflicht" });
    }

    // Hinweis: Hier werden Felder bewusst auf NULL gesetzt,
    // damit die DB keine leeren Strings speichern muss.
    const created = await filialeRepo.add({
      filialname,
      strasse: strasse ?? null,
      plz: plz ?? null,
      ort: ort ?? null,
      land: land ?? "Österreich",
      telefon: telefon ?? null,
      email: email ?? null,
      anmerkung: anmerkungen ?? null,
      farbe: farbe ?? "#3498db",
      algorithmid: algorithmid, // Algorithmus-ID steuert das Schichtmuster in der Generierung
    });

    res.status(201).json(toFrontendFiliale(created));
  } catch (err) {
    console.error("Fehler POST /filialen:", err);
    // err.message ist für Debug ok, aber in echten Systemen würde man hier eher generisch antworten
    res.status(500).json({ error: err.message });
  }
});

/**
 * ----------------------------------------------------------------------------
 * GET /filialen
 * Liefert alle Filialen.
 * ----------------------------------------------------------------------------
 */
router.get("/", async (_req, res) => {
  try {
    const data = await filialeRepo.getAll();
    res.json(data.map(toFrontendFiliale));
  } catch (err) {
    console.error("Fehler GET /filialen:", err);
    res.status(500).json({ error: "Fehler beim Laden der Filialen" });
  }
});

/**
 * ----------------------------------------------------------------------------
 * GET /filialen/:fnr
 * Liefert eine einzelne Filiale anhand der Filialnummer (fnr).
 *
 * HTTP-Status:
 * - 404, wenn keine Filiale gefunden wurde
 * ----------------------------------------------------------------------------
 */
router.get("/:fnr", async (req, res) => {
  try {
    const fnr = Number(req.params.fnr);

    const filiale = await filialeRepo.getById(fnr);
    if (!filiale) {
      return res.status(404).json({ error: "Filiale nicht gefunden" });
    }

    res.json(toFrontendFiliale(filiale));
  } catch (err) {
    console.error("Fehler GET /filialen/:fnr:", err);
    res.status(500).json({ error: "Fehler beim Laden der Filiale" });
  }
});

/**
 * ----------------------------------------------------------------------------
 * PUT /filialen/:fnr
 * Aktualisiert eine bestehende Filiale.
 *
 * Wichtig:
 * - Updates sollten kontrolliert werden (Whitelist),
 *   damit keine unerwarteten Felder in die DB geschrieben werden.
 * ----------------------------------------------------------------------------
 */
router.put("/:fnr", async (req, res) => {
  try {
    const fnr = Number(req.params.fnr);

    // Whitelist: nur diese Felder dürfen aktualisiert werden
    const allowed = [
      "filialname",
      "strasse",
      "plz",
      "ort",
      "land",
      "telefon",
      "email",
      "anmerkungen",
      "farbe",
      "algorithmid",
    ];

    const updates = {};
    for (const k of allowed) {
      if (k in req.body) updates[k] = req.body[k];
    }

    const updated = await filialeRepo.update(fnr, updates);
    if (!updated) {
      return res.status(404).json({ error: "Filiale nicht gefunden" });
    }

    res.json(toFrontendFiliale(updated));
  } catch (err) {
    console.error("Fehler PUT /filialen/:fnr:", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren der Filiale" });
  }
});

/**
 * ----------------------------------------------------------------------------
 * DELETE /filialen/:fnr
 * Löscht eine Filiale.
 *
 * Hinweis:
 * - In der Praxis muss man auf Referenzen achten (FKs),
 *   z.B. Mitarbeiter oder Dienstpläne, die auf die Filiale zeigen.
 * ----------------------------------------------------------------------------
 */
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