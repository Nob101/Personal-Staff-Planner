// dienstplanGenerator.js (NEU, DB-Version)
// ------------------------------------------------------------
// Features:
// ✅ Plant pro Filiale nur Mitarbeiter der Hauptfiliale ein
// ✅ Pattern/Algorithmus pro Filiale + optional Springer-Algorithmus pro MA
// ✅ Counter je Mitarbeiter wird weitergedreht und in DB gespeichert
// ✅ Stundenlimit mit Puffer beim Erzeugen (damit nicht zu viele Stunden entstehen)
// ✅ Danach: Stunden-KÜRZUNG auf Zielstunden (wie deine alte Version)
//    -> dabei wird NIE die letzte A oder E Schicht eines Tages entfernt
// ✅ Danach: Endkontrolle, dass A und E pro Tag vorhanden sind
// ✅ Speichert final dienste in dienstplaene + stunden in stunden Tabelle
// ------------------------------------------------------------

const { getAlgorithmus } = require("./algorithmen");
const { getAllDatesOfMonth, getMonthlyHours } = require("./dateUtils");
const { savePlan } = require("./savePlan");

const filialenRepo = require("../repositories/filialen.repo.pg");
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const stundenRepo = require("../repositories/stunden.repo.pg");

// Stunden pro Arbeitstag (A/E). (K/U wird später über Shift-Route korrekt mit 8h gerechnet)
const STUNDEN_PRO_DIENST = 9;

// Wie viel Puffer über Sollstunden darf in Phase 1 entstehen, bevor wir zwangsweise F setzen?
// (Ziel: Generator bleibt stabil und produziert nicht absurd viele Stunden)
const LIMIT_PUFFER_STUNDEN = 10;

// Kürzung: nie letzte A/E pro Tag entfernen
const MIN_WORKERS_PRO_SCHICHT = 1;

// Faktor aus arbeitnehmertyp (20 / 30 / 40)
function getFaktorFuerMitarbeiter(m) {
  const typNum = Number(m.arbeitnehmertyp ?? 40) || 40;
  return typNum / 40;
}

// Hilfsfunktion: Datum in "YYYY-MM-DD" bringen (damit Map-Keys stabil sind)
function dateKey(d) {
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

// getMonthlyHours kann bei dir manchmal { monatsstunden } liefern.
// Wir machen es robust:
function resolveMonatsstunden(year, month) {
  const r = getMonthlyHours(year, month);
  if (typeof r === "number") return r;
  if (r && typeof r === "object" && typeof r.monatsstunden === "number") return r.monatsstunden;
  // Fallback (sollte nie passieren)
  return Number(r) || 0;
}

async function generateDienstplan(year, month) {
  const jahr = Number(year);
  const monat = Number(month);

  const monatsstunden = resolveMonatsstunden(jahr, monat);
  const dates = getAllDatesOfMonth(jahr, monat);

  // Alle Daten einmal laden (wichtig: DB Calls minimieren)
  const alleMitarbeiter = await mitarbeiterRepo.getAllBase();
  const alleFilialen = await filialenRepo.getAll();

  // Alles neu generieren -> Stunden-Tabelle für Monat/Jahr leeren
  await stundenRepo.deleteStunden(monat, jahr);

  // Hier sammeln wir ALLE Dienste für den Monat (alle Filialen)
  const dienste = [];

  // ============================================================
  // PRO FILIALE generieren (wie bisher)
  // ============================================================
  for (const filiale of alleFilialen) {
    // Mitarbeiter dieser Filiale (nur Hauptfiliale!)
    const mitarbeiterFiliale = alleMitarbeiter.filter(
      (m) => Number(m.hauptfiliale_fnr) === Number(filiale.fnr)
    );

    if (mitarbeiterFiliale.length === 0) {
      // keine Mitarbeiter -> einfach nächste Filiale
      continue;
    }

    // ------------------------------------------------------------
    // Tracking-Strukturen (damit Kürzung & Kontrolle möglich sind)
    // ------------------------------------------------------------

    // IST-Stunden pro Mitarbeiter (mnr -> Stunden)
    const stundenByMnr = new Map();

    // Index-Mapping: welche dienste[]-Position gehört zu (mnr|datum)?
    // -> damit wir später gezielt einzelne Dienste ändern können (A/E -> F)
    const idxByMnrDate = new Map();

    // Abdeckung pro Tag: welche Mitarbeiter haben an dem Tag A/E?
    // -> wichtig für "nie letzte A/E entfernen"
    const abdeckungByDate = new Map(); // dateKey -> { A:Set, E:Set }

    // ------------------------------------------------------------
    // PHASE 1: Grundplan erzeugen (mit Pufferlimit)
    // ------------------------------------------------------------
    for (const m of mitarbeiterFiliale) {
      // Welcher Algorithmus gilt für diesen Mitarbeiter?
      // Springer bekommen optional eigenen Algorithmus
      const algoId = m.springer
        ? m.springeralgorithmid ?? filiale.algorithmid
        : filiale.algorithmid;

      const algorithm = await getAlgorithmus(algoId);

      if (!Array.isArray(algorithm) || algorithm.length === 0) {
        throw new Error(
          `Algorithmus fehlt/leer für fnr=${filiale.fnr}, mnr=${m.mnr}, algoId=${algoId}`
        );
      }

      // Sollstunden = monatsstunden * Faktor (20/30/40)
      const faktor = getFaktorFuerMitarbeiter(m);
      const zielStunden = Math.round(monatsstunden * faktor);

      // Puffer-Limit = Soll + Puffer
      const limitStunden = zielStunden + LIMIT_PUFFER_STUNDEN;

      // Counter aus DB (rotierender Start)
      let counter = Number(m.counter);
      if (!Number.isFinite(counter) || counter < 0) counter = 0;

      // init IST-Stunden
      if (!stundenByMnr.has(m.mnr)) stundenByMnr.set(m.mnr, 0);

      // Tage durchgehen
      for (const date of dates) {
        const dk = dateKey(date);

        // Schicht aus Pattern
        let schicht_typ = algorithm[counter % algorithm.length];

        // Stundenlimit prüfen:
        // Wenn Mitarbeiter schon über Limit, dann "F" erzwingen
        const bereits = stundenByMnr.get(m.mnr) || 0;
        if (schicht_typ !== "F" && bereits >= limitStunden) {
          schicht_typ = "F";
        }

        // Dienst speichern (in globaler Liste)
        const idx = dienste.length;

        dienste.push({
          jahr,
          monat,
          datum: date,        // so wie bisher (Date oder string)
          mnr: m.mnr,
          fnr: filiale.fnr,   // wichtig: Dienst gehört zur Arbeitsfiliale
          schicht_typ,
        });

        // Index merken
        idxByMnrDate.set(`${m.mnr}|${dk}`, idx);

        // Stunden zählen
        if (schicht_typ !== "F") {
          stundenByMnr.set(m.mnr, bereits + STUNDEN_PRO_DIENST);
        }

        // Abdeckung tracken (A/E)
        if (!abdeckungByDate.has(dk)) {
          abdeckungByDate.set(dk, { A: new Set(), E: new Set() });
        }
        if (schicht_typ === "A") abdeckungByDate.get(dk).A.add(m.mnr);
        if (schicht_typ === "E") abdeckungByDate.get(dk).E.add(m.mnr);

        // Counter weiterdrehen
        counter = (counter + 1) % algorithm.length;
      }

      // Counter nach Monatsplanung in DB speichern
      await mitarbeiterRepo.updateCounter(m.mnr, counter);

      // Sollstunden speichern wir später NACH Kürzung (Phase 4),
      // weil IST sich noch ändert.
    }

    // ------------------------------------------------------------
    // PHASE 2: A/E pro Tag garantieren (wie in der alten Version)
    // ------------------------------------------------------------
    // Idee: Wenn an einem Tag kein A oder kein E existiert,
    // dann suchen wir den ersten Mitarbeiter der an dem Tag "F" hat
    // und setzen ihn auf A/E.
    function setFirstFTo(dk, typ) {
      for (const m of mitarbeiterFiliale) {
        const idx = idxByMnrDate.get(`${m.mnr}|${dk}`);
        if (idx == null) continue;

        if (dienste[idx].schicht_typ === "F") {
          dienste[idx].schicht_typ = typ;

          // Stunden hoch
          const cur = stundenByMnr.get(m.mnr) || 0;
          stundenByMnr.set(m.mnr, cur + STUNDEN_PRO_DIENST);

          // Abdeckung updaten
          if (!abdeckungByDate.has(dk)) abdeckungByDate.set(dk, { A: new Set(), E: new Set() });
          abdeckungByDate.get(dk)[typ].add(m.mnr);

          return true;
        }
      }
      return false;
    }

    for (const date of dates) {
      const dk = dateKey(date);
      if (!abdeckungByDate.has(dk)) abdeckungByDate.set(dk, { A: new Set(), E: new Set() });

      const cov = abdeckungByDate.get(dk);
      const hasA = cov.A.size > 0;
      const hasE = cov.E.size > 0;

      if (!hasA) setFirstFTo(dk, "A");
      if (!hasE) setFirstFTo(dk, "E");
    }

    // ------------------------------------------------------------
    // PHASE 3: Stunden-KÜRZUNG auf Zielstunden
    // ------------------------------------------------------------
    // Ziel: Wenn Stunden > Zielstunden:
    // -> suche zufällige A/E Kandidaten
    // -> aber NIE letzte A/E pro Tag wegnehmen
    for (const m of mitarbeiterFiliale) {
      const faktor = getFaktorFuerMitarbeiter(m);
      const zielStunden = Math.round(monatsstunden * faktor);

      let hours = stundenByMnr.get(m.mnr) || 0;

      while (hours > zielStunden+10) {
        const kandidaten = [];

        for (const date of dates) {
          const dk = dateKey(date);
          const idx = idxByMnrDate.get(`${m.mnr}|${dk}`);
          if (idx == null) continue;

          const typ = String(dienste[idx].schicht_typ || "F").toUpperCase();
          if (typ !== "A" && typ !== "E") continue;

          const cov = abdeckungByDate.get(dk);
          if (!cov) continue;

          // nicht die letzte A/E des Tages entfernen
          if (cov[typ].size <= MIN_WORKERS_PRO_SCHICHT) continue;

          kandidaten.push({ dk, idx, typ });
        }

        // keine Kandidaten -> keine Kürzung mehr möglich
        if (kandidaten.length === 0) break;

        // zufällig einen Kandidaten wählen
        const pick = kandidaten[Math.floor(Math.random() * kandidaten.length)];

        // Dienst auf F setzen
        dienste[pick.idx].schicht_typ = "F";

        // Abdeckung reduzieren
        abdeckungByDate.get(pick.dk)[pick.typ].delete(m.mnr);

        // Stunden runter
        hours -= STUNDEN_PRO_DIENST;
        if (hours < 0) hours = 0;
        stundenByMnr.set(m.mnr, hours);
      }
    }

    // ------------------------------------------------------------
    // PHASE 4: Endkontrolle (A/E muss trotzdem da sein)
    // ------------------------------------------------------------
    // Nach Kürzung kann es theoretisch passieren, dass A/E fehlt,
    // deshalb nochmal kontrollieren und notfalls F -> A/E setzen.
    for (const date of dates) {
      const dk = dateKey(date);
      if (!abdeckungByDate.has(dk)) abdeckungByDate.set(dk, { A: new Set(), E: new Set() });

      const cov = abdeckungByDate.get(dk);
      const hasA = cov.A.size > 0;
      const hasE = cov.E.size > 0;

      if (!hasA) setFirstFTo(dk, "A");
      if (!hasE) setFirstFTo(dk, "E");
    }

    // ------------------------------------------------------------
    // PHASE 5: Stunden in DB speichern (NACH Kürzung!)
    // ------------------------------------------------------------
    for (const m of mitarbeiterFiliale) {
      const faktor = getFaktorFuerMitarbeiter(m);
      const zielStunden = Math.round(monatsstunden * faktor);
      const ist = stundenByMnr.get(m.mnr) || 0;

      await stundenRepo.saveStunden({
        mnr: m.mnr,
        jahr,
        monat,
        soll_stunden_monat: zielStunden,
        ist_stunden_monat: ist,
        differenz: ist - zielStunden,
      });
    }
  }

  // ============================================================
  // Alles speichern
  // ============================================================
  await savePlan(jahr, monat, dienste);

  return { count: dienste.length };
}

module.exports = { generateDienstplan };