const express = require("express");
const router = express.Router();
 
// Repositories kapseln den Datenbankzugriff (CRUD + komplexere Queries)
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const filialenRepo = require("../repositories/filialen.repo.pg");
 
// Counter-Logik für faire Startpositionen im Algorithmus (Rotation im Dienstplan)
const { setCounterForMitarbeiter } = require("../functions/setCounter");
const {
  resetCountersForFiliale,
} = require("../functions/resetCountersForFiliale");
 
// Mapper: trennt Frontend-Format (UI) von Backend/DB-Format (DTO)
const {
  fromFrontend,
  toFrontend,
  fromFrontendPatch,
} = require("../mappers/mitarbeiter.mapper");
 
// ============================================================================
// GET /mitarbeiter
// ----------------------------------------------------------------------------
// // Liefert alle AKTIVEN Mitarbeiter inkl. Detaildaten
// - kontakt, telefone, emails, nebenfilialen
//
// Zusätzlich werden Filial-Daten geladen, um im Response nicht nur fnr,
// sondern auch lesbare Namen (z.B. "Graz") zurückzugeben.
// ============================================================================
router.get("/", async (_req, res) => {
  try {
    // Parallel laden -> reduziert Wartezeit, weil DB-Abfragen unabhängig sind
    const [data, filialen] = await Promise.all([
      mitarbeiterRepo.getAllWithDetails(),
      filialenRepo.getAll(),
    ]);
 
    // Mapping in ein Frontend-freundliches Format (IDs + Namen, flache Felder)
    // nur aktive MA zurückgeben
    res.json(
      data.filter((m) => m.aktiv === true).map((m) => toFrontend(m, filialen)),
    ); 
  } catch (err) {
    console.error("Fehler GET /mitarbeiter:", err);
    res.status(500).json({ error: "Fehler beim Laden der Mitarbeiter" });
  }
});
 
// ============================================================================
// GET /mitarbeiter/archiv
// ----------------------------------------------------------------------------
// Liefert alle INAKTIVEN Mitarbeiter (Archiv).
// Zweck:
// - Einsicht in frühere Mitarbeiter
// - Kontakt-/Historienabfragen
// - NICHT für Dienstplan-Generierung
// ============================================================================
router.get("/archiv", async (_req, res) => {
  try {
    const [data, filialen] = await Promise.all([
      mitarbeiterRepo.getAllWithDetails(),
      filialenRepo.getAll(),
    ]);
 
    // nur inaktive Mitarbeiter
    const archiv = data.filter((m) => m.aktiv === false);
 
    res.json(archiv.map((m) => toFrontend(m, filialen)));
  } catch (err) {
    console.error("Fehler GET /mitarbeiter/archiv:", err);
    res.status(500).json({ error: "Fehler beim Laden des Archivs" });
  }
});
 
// ============================================================================
// GET /mitarbeiter/:mnr
// ----------------------------------------------------------------------------
// Liefert einen einzelnen Mitarbeiter inkl. Details.
// Validiert Parameter (mnr muss Zahl sein) und gibt passende HTTP-Statuscodes.
// ============================================================================
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
 
// ============================================================================
// POST /mitarbeiter
// ----------------------------------------------------------------------------
// Legt einen Mitarbeiter an (inkl. Kontakt/Telefon/E-Mail/Nebenfilialen).
//
// Wichtiger Punkt für die Dienstplan-Generierung:
// Nach dem Anlegen wird der Counter der betroffenen Hauptfiliale neu verteilt,
// damit Startpositionen im Schichtmuster fair bleiben.
// ============================================================================
router.post("/", async (req, res) => {
  try {
    const b = req.body;
 
    // Minimalvalidierung (weitere Checks können im Mapper/Repo folgen)
    if (!b.vorname || !b.nachname || !b.hauptfiliale) {
  return res.status(400).json({ error: "vorname, nachname und hauptfiliale sind Pflicht" });
}
 
    // Frontend -> DB DTO (Formatvereinheitlichung + Typkonvertierung)
    const payload = fromFrontend(b);
 
    // Springer-Logik:
    // Für Springer wird ein "Gegenwert"-Algorithmus vergeben (1 <-> 2),
    // um Überschneidungen zu reduzieren und die Abdeckung zu verbessern.
    if (payload.springer === true && payload.hauptfiliale_fnr) {
      const filiale = await filialenRepo.getById(payload.hauptfiliale_fnr);
      payload.springeralgorithmid = getGegenwertAlgoId(filiale.algorithmid);
    } else {
      payload.springeralgorithmid = null;
    }
 
    // DB Insert (inkl. Detailtabellen)
    const created = await mitarbeiterRepo.addWithDetails(payload);
 
    // Counter neu verteilen, weil sich die Mitarbeiteranzahl in der Filiale geändert hat
    if (created?.hauptfiliale_fnr) {
      await resetCountersForFiliale(created.hauptfiliale_fnr);
      await setCounterForMitarbeiter(created.hauptfiliale_fnr);
    }
 
    // Frischen Datensatz inkl. Details zurückgeben (konsistenter Response)
    const fresh = await mitarbeiterRepo.getByIdWithDetails(created.mnr);
    const filialen = await filialenRepo.getAll();
    res.status(201).json(toFrontend(fresh, filialen));
  } catch (err) {
    console.error("Fehler POST /mitarbeiter:", err);
    res.status(500).json({ error: "Fehler beim Anlegen" });
  }
});
 
// ============================================================================
// PUT /mitarbeiter/:mnr
// ----------------------------------------------------------------------------
// Bearbeitet einen Mitarbeiter (partiell über fromFrontendPatch).
//
// Zusätzlich:
// - Springer-Status kann springeralgorithmid setzen/entfernen
// - Bei Änderung der Hauptfiliale müssen Counter in alter UND neuer Filiale
//   neu verteilt werden, damit der Dienstplan-Generator sauber rotiert.
// ============================================================================
router.put("/:mnr", async (req, res) => {
  try {
    const mnr = Number(req.params.mnr);
    if (!Number.isFinite(mnr)) {
      return res.status(400).json({ error: "Ungültige mnr" });
    }
 
    // Vorzustand laden (für Vergleich: Filiale alt vs neu, Springer alt vs neu)
    const before = await mitarbeiterRepo.getByIdWithDetails(mnr);
    if (!before) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }
 
    // Nur übermittelte Felder übernehmen, damit nichts unbeabsichtigt überschrieben wird
    const updates = fromFrontendPatch(req.body);
 
    // Effektiver Wert nach Update (wenn nicht gesendet -> vorheriger Wert bleibt)
    const springerAfter =
      updates.springer !== undefined ? updates.springer : before.springer;
    const hfAfter =
      updates.hauptfiliale_fnr !== undefined
        ? updates.hauptfiliale_fnr
        : before.hauptfiliale_fnr;
 
    // Wenn Springer aktiv: passenden Springer-Algorithmus setzen
    if (springerAfter === true) {
      if (hfAfter) {
        const filiale = await filialenRepo.getById(hfAfter);
        updates.springeralgorithmid = getGegenwertAlgoId(filiale.algorithmid);
        await resetCountersForFiliale(hfAfter); // Counter neu verteilen, da sich die Abdeckung ändert
        await setCounterForMitarbeiter(hfAfter);
      } else {
        updates.springeralgorithmid = null;
      }
    }
 
    // Wenn Springer deaktiviert: springeralgorithmid entfernen
    if (springerAfter === false) {
      await resetCountersForFiliale(hfAfter); // Counter neu verteilen, da sich die Abdeckung ändert
      await setCounterForMitarbeiter(hfAfter);
      updates.springeralgorithmid = null;
    }
 
    // Update in DB durchführen (inkl. Details)
    const updated = await mitarbeiterRepo.updateWithDetails(mnr, updates);
    if (!updated) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }
 
    // Wenn die Hauptfiliale gewechselt wurde: Counter beider Filialen neu verteilen
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
 
    // Frische Daten zurückgeben
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
 
// ============================================================================
// DELETE /mitarbeiter/:mnr
// ----------------------------------------------------------------------------
// Deaktiviert einen Mitarbeiter (Soft Delete).
// Danach wird der Counter der betroffenen Hauptfiliale neu verteilt,
// da sich die Mitarbeiteranzahl geändert hat.
// ============================================================================
router.delete("/:mnr", async (req, res) => {
  try {
    const mnr = Number(req.params.mnr);
    if (!Number.isFinite(mnr)) {
      return res.status(400).json({ error: "Ungültige mnr" });
    }
 
    // Vorher holen: wichtig, um zu wissen welche Filiale betroffen ist
    const before = await mitarbeiterRepo.getByIdWithDetails(mnr);
    if (!before) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }
 
    const removed = await mitarbeiterRepo.deactivate(mnr); // Soft Delete
    if (!removed) {
      return res.status(404).json({ error: "Mitarbeiter nicht gefunden" });
    }
 
    // Counter neu verteilen (faire Rotation bleibt erhalten)
    if (before.hauptfiliale_fnr) {
      await resetCountersForFiliale(before.hauptfiliale_fnr);
      await setCounterForMitarbeiter(before.hauptfiliale_fnr);
    }
 
    res.json({ message: "Mitarbeiter deaktiviert" });
  } catch (err) {
    console.error("Fehler DELETE /mitarbeiter/:mnr:", err);
    res.status(500).json({ error: "Fehler beim Löschen" });
  }
});
 
// ============================================================================
// Hilfsfunktion: Gegenwert-Algorithmus bestimmen
// ----------------------------------------------------------------------------
// Ziel: Springer sollen bewusst ein anderes Schichtmuster als die Filiale
// verwenden (1 <-> 2), um Überschneidungen zu reduzieren.
// Fallback: wenn unbekannt, gleiche ID zurückgeben.
// ============================================================================
function getGegenwertAlgoId(filialAlgoId) {
  const id = Number(filialAlgoId);
  if (id === 1) return 2;
  if (id === 2) return 1;
  return id;
}
 
module.exports = router;