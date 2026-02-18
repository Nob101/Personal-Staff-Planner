// dienstplanGenerator.js (NEU, DB-Version)
// ------------------------------------------------------------
// Ziel dieses Moduls:
// - Erzeugt einen Monats-Dienstplan pro Filiale
// - Speichert den Plan (dienste) und die Stunden (stunden) in der Datenbank
//
// Warum ist das komplex?
// - Wir erzeugen nicht nur CRUD-Daten, sondern "berechnen" einen Plan anhand von Regeln.
// - Danach müssen wir einzelne Einträge gezielt korrigieren (Kürzung, A/E-Abdeckung).
// - Dafür brauchen wir Datenstrukturen, die schnelle Zugriffe erlauben (Map/Set).
// ------------------------------------------------------------

const { getAlgorithmus } = require("./algorithmen");
const { getAllDatesOfMonth, getMonthlyHours } = require("./dateUtils");
const { savePlan } = require("./savePlan");

const filialenRepo = require("../repositories/filialen.repo.pg");
const mitarbeiterRepo = require("../repositories/mitarbeiter.repo.pg");
const stundenRepo = require("../repositories/stunden.repo.pg");

// Stunden pro Arbeitstag (A/E). (K/U wird später über Shift-Route korrekt mit 8h gerechnet)
const STUNDEN_PRO_DIENST = 9;

// Puffer über Sollstunden in Phase 1.
// Idee: Phase 1 soll schnell einen "brauchbaren" Plan erzeugen,
// auch wenn er danach noch korrigiert (gekürzt) wird.
const LIMIT_PUFFER_STUNDEN = 100;

// Kürzung: nie die letzte A oder E Schicht eines Tages entfernen.
// MIN_WORKERS_PRO_SCHICHT = 1 heißt: mind. 1x A und mind. 1x E muss bleiben.
const MIN_WORKERS_PRO_SCHICHT = 1;

/**
 * Faktor aus arbeitnehmertyp (20 / 30 / 40).
 * Beispiel:
 * - 40h -> Faktor 1.0
 * - 20h -> Faktor 0.5
 * -> Zielstunden = Monatsstunden * Faktor
 */
function getFaktorFuerMitarbeiter(m) {
  const typNum = Number(m.arbeitnehmertyp ?? 40) || 40;
  return typNum / 40;
}

/**
 * Hilfsfunktion: Datum normalisieren (YYYY-MM-DD).
 *
 * Warum?
 * - Daten aus DB / JS können als Date-Objekt oder ISO-String kommen.
 * - Für Map-Keys brauchen wir eine stabile, identische String-Repräsentation,
 *   sonst hätten wir z.B. "2026-01-03T00:00:00.000Z" und "2026-01-03" als
 *   verschiedene Keys -> wäre ein Bug.
 */
function dateKey(d) {
  const s = String(d);
  return s.length >= 10 ? s.slice(0, 10) : s;
}

/*
 * Diese Funktion macht den Aufruf robust und verhindert "undefined" Fehler.
 */

function resolveMonatsstunden(year, month) {
  const r = getMonthlyHours(year, month);
  if (typeof r === "number") return r;
  if (r && typeof r === "object" && typeof r.monatsstunden === "number")
    return r.monatsstunden;
  return Number(r) || 0;
}

async function generateDienstplan(year, month, fnr) {
  const jahr = Number(year);
  const monat = Number(month);

  const monatsstunden = resolveMonatsstunden(jahr, monat);
  const dates = getAllDatesOfMonth(jahr, monat);

  // Alle Daten einmal laden (Performance):
  // Würden wir pro Mitarbeiter/Tag DB-Abfragen machen, wäre das extrem langsam.
  const alleMitarbeiter = await mitarbeiterRepo.getAllBase({
    onlyActive: true,
  }); //soft delete beachten

  let alleFilialen;

  if (!fnr) {
    alleFilialen = await filialenRepo.getAll();
  } else {
    const filiale = await filialenRepo.getById(fnr);
    if (!filiale) throw new Error(`Filiale mit fnr=${fnr} nicht gefunden.`);
    alleFilialen = [filiale];
  }

  // Neu-Generierung -> alte Stunden für Monat/Jahr entfernen.
  // (Die Dienste selbst werden später via savePlan neu geschrieben.)
  if (fnr) {
    await stundenRepo.deleteStunden(monat, jahr, fnr); // nur diese Filiale
  } else {
    await stundenRepo.deleteStunden(monat, jahr); // alles vom Monat
  }

  // Globale Liste: enthält am Ende alle Dienste aller Filialen.
  // Vorteil: wir speichern später in einem Schritt (savePlan).
  const dienste = [];

  // ============================================================
  // PRO FILIALE generieren
  // ============================================================
  for (const filiale of alleFilialen) {
    // Nur Mitarbeiter der Hauptfiliale werden automatisch eingeplant.
    const mitarbeiterFiliale = alleMitarbeiter.filter(
      (m) => Number(m.hauptfiliale_fnr) === Number(filiale.fnr),
    );

    if (mitarbeiterFiliale.length === 0) continue;

    // ------------------------------------------------------------
    // Tracking-Strukturen (Map/Set)
    // ------------------------------------------------------------

    /**
     * stundenByMnr: Map<mnr, istStunden>
     *
     * Warum Map?
     * - O(1) Zugriff auf Stunden eines Mitarbeiters (sehr oft gebraucht).
     * - Ein normales Array wäre unpraktisch, weil mnr nicht zwingend bei 0 startet
     *   und Lücken haben kann.
     */
    const stundenByMnr = new Map();

    /**
     * idxByMnrDate: Map<"mnr|YYYY-MM-DD", indexInDiensteArray>
     *
     * Warum Map?
     * - Wir müssen später gezielt einen konkreten Dienst finden und ändern,
     *   z.B. in der Kürzung (A/E -> F) oder beim "A/E sicherstellen".
     * - Ohne diese Map müssten wir jedes Mal das gesamte dienste-Array durchsuchen:
     *   O(n) pro Zugriff -> bei vielen Tagen/MAs wird das schnell langsam und fehleranfällig.
     */
    const idxByMnrDate = new Map();

    /**
     * abdeckungByDate: Map<dateKey, { A:Set<mnr>, E:Set<mnr> }>
     *
     * Warum Set?
     * - Wir brauchen "ist jemand in A/E?" ohne Duplikate.
     * - Entfernen muss schnell gehen (delete).
     * - Set garantiert eindeutige Werte und hat schnelle Operationen:
     *   add / has / delete sind praktisch O(1).
     *
     * Damit können wir sicherstellen:
     * - pro Tag existiert mindestens 1x A und 1x E
     * - bei der Kürzung wird nie die letzte A oder E entfernt
     */
    const abdeckungByDate = new Map();

    // ------------------------------------------------------------
    // PHASE 1: Grundplan erzeugen (Pattern + Pufferlimit)
    // ------------------------------------------------------------
    for (const m of mitarbeiterFiliale) {
      // Algorithmusauswahl:
      // - Normaler Mitarbeiter: Filialalgorithmus
      // - Springer: eigener Algorithmus (falls vorhanden), sonst Filialalgorithmus
      const algoId = m.springer
        ? (m.springeralgorithmid ?? filiale.algorithmid)
        : filiale.algorithmid;

      const algorithm = await getAlgorithmus(algoId);

      if (!Array.isArray(algorithm) || algorithm.length === 0) {
        throw new Error(
          `Algorithmus fehlt/leer für fnr=${filiale.fnr}, mnr=${m.mnr}, algoId=${algoId}`,
        );
      }

      // Zielstunden für diesen Mitarbeiter
      const faktor = getFaktorFuerMitarbeiter(m);
      const zielStunden = Math.round(monatsstunden * faktor);

      // Puffer: erlaubt kurzfristig etwas drüber zu liegen,
      // bevor Phase 3 (Kürzung) auf Zielstunden reduziert.
      const limitStunden = zielStunden + LIMIT_PUFFER_STUNDEN;

      // Counter aus der Mitarbeiter DB: bestimmt Startposition im Pattern.
      // Dadurch rotiert der Plan über Monate hinweg.
      let counter = Number(m.counter);
      if (!Number.isFinite(counter) || counter < 0) counter = 0;

      // init IST-Stunden
      if (!stundenByMnr.has(m.mnr)) stundenByMnr.set(m.mnr, 0);

      for (const date of dates) {
        const dk = dateKey(date);

        // Pattern-Index via Counter
        let schicht_typ = algorithm[counter % algorithm.length];

        // Stundenlimit:
        // Wenn bereits >= Limit, dann auf F setzen (damit nicht explodiert)
        const bereits = stundenByMnr.get(m.mnr) || 0;
        if (schicht_typ !== "F" && bereits >= limitStunden) {
          schicht_typ = "F";
        }

        // Dienst in globale Liste schreiben
        const idx = dienste.length;

        dienste.push({
          jahr,
          monat,
          datum: date,
          mnr: m.mnr,
          fnr: filiale.fnr,
          schicht_typ,
        });

        // Index-Mapping merken (für spätere gezielte Änderungen)
        idxByMnrDate.set(`${m.mnr}|${dk}`, idx);

        // Stunden zählen (nur wenn nicht Frei)
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

      // Counter dauerhaft speichern -> nächster Monat startet versetzt
      await mitarbeiterRepo.updateCounter(m.mnr, counter);
    }

    // ------------------------------------------------------------
    // PHASE 2: A/E pro Tag garantieren
    // ------------------------------------------------------------
    /**
     * setFirstFTo(dk, typ)
     * Sucht den ersten Mitarbeiter mit "F" an diesem Tag und setzt auf A/E.
     *
     * Wichtig:
     * - wir ändern gezielt NUR einen Dienst, über idxByMnrDate
     * - dadurch keine teuren Suchen im ganzen Array
     * - Diese Funktion wurde bewusst als Function deklariert, weil sie öfters aufgerufen wird und leichter lesbara als eine Arrow-Funktion ist.
     */
    function setFirstFTo(dk, typ) {
      for (const m of mitarbeiterFiliale) {
        const idx = idxByMnrDate.get(`${m.mnr}|${dk}`);
        if (idx == null) continue;

        if (dienste[idx].schicht_typ === "F") {
          dienste[idx].schicht_typ = typ;

          // Stunden erhöhen, weil aus Frei ein Arbeitstag wurde
          const cur = stundenByMnr.get(m.mnr) || 0;
          stundenByMnr.set(m.mnr, cur + STUNDEN_PRO_DIENST);

          // Abdeckung updaten (Set verhindert Duplikate automatisch)
          if (!abdeckungByDate.has(dk))
            abdeckungByDate.set(dk, { A: new Set(), E: new Set() });
          abdeckungByDate.get(dk)[typ].add(m.mnr);

          return true;
        }
      }
      return false;
    }

    // pro Tag prüfen, ob A und E existieren
    for (const date of dates) {
      const dk = dateKey(date);
      if (!abdeckungByDate.has(dk))
        abdeckungByDate.set(dk, { A: new Set(), E: new Set() });

      const cov = abdeckungByDate.get(dk);
      if (cov.A.size === 0) setFirstFTo(dk, "A");
      if (cov.E.size === 0) setFirstFTo(dk, "E");
    }

    // -------------------------------------------------------------------------
    // PHASE 3: Stunden-Kürzung mit monatlichem Ausgleichspuffer
    // -------------------------------------------------------------------------
    //
    // Hintergrund:
    // Aufgrund fixer Schichtlängen (A/E = 9 Stunden) können die Sollstunden
    // eines Mitarbeiters in vielen Monaten nicht exakt erreicht werden.
    // Typische Werte sind z.B. 171h oder 180h statt exakt 176h.
    //
    // Ziel dieser Logik:
    // - systematische Minusstunden vermeiden
    // - über mehrere Monate hinweg einen natürlichen Ausgleich schaffen
    //
    // Umsetzung:
    // - In geraden Monaten (2,4,6,8,10,12) wird ein Puffer von +9 Stunden erlaubt
    //   → ein zusätzlicher Dienst über den Zielstunden ist möglich
    // - In ungeraden Monaten wird strenger gekürzt (kein Puffer)
    //
    // Dadurch gleichen sich Über- und Unterstunden über das Jahr hinweg aus,
    // ohne starre oder unrealistische Zwangsregeln im Generator zu erzwingen.
    // Die finale Feinjustierung der Stunden erfolgt bewusst manuell im Frontend.
    //

    for (const m of mitarbeiterFiliale) {
      const faktor = getFaktorFuerMitarbeiter(m);
      const zielStunden = Math.round(monatsstunden * faktor);

      let hours = stundenByMnr.get(m.mnr) || 0;

      const puffer = monat % 2 === 0 ? 9 : 0;

      while (hours > zielStunden + puffer) {
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

        if (kandidaten.length === 0) break;

        // zufälligen Kandidaten wählen
        const pick = kandidaten[Math.floor(Math.random() * kandidaten.length)];

        // Dienst auf Frei setzen
        dienste[pick.idx].schicht_typ = "F";

        // Abdeckung aktualisieren: dieser MA zählt dort nicht mehr rein
        abdeckungByDate.get(pick.dk)[pick.typ].delete(m.mnr);

        // Stunden reduzieren
        hours -= STUNDEN_PRO_DIENST;
        if (hours < 0) hours = 0;
        stundenByMnr.set(m.mnr, hours);
      }
    }

    // ------------------------------------------------------------
    // PHASE 4: Endkontrolle (A/E muss trotzdem da sein)
    // ------------------------------------------------------------
    // Nach Random-Kürzung kann theoretisch wieder ein Tag ohne A oder ohne E entstehen.
    // Deshalb nochmal prüfen und notfalls mit setFirstFTo korrigieren.
    for (const date of dates) {
      const dk = dateKey(date);
      if (!abdeckungByDate.has(dk))
        abdeckungByDate.set(dk, { A: new Set(), E: new Set() });

      const cov = abdeckungByDate.get(dk);
      if (cov.A.size === 0) setFirstFTo(dk, "A");
      if (cov.E.size === 0) setFirstFTo(dk, "E");
    }

    // ------------------------------------------------------------
    // PHASE 5: Stunden in DB speichern (nach Kürzung!)
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
  // Alles in DB speichern
  // ============================================================
  await savePlan(jahr, monat, dienste);

  return { count: dienste.length };
}

module.exports = { generateDienstplan };
