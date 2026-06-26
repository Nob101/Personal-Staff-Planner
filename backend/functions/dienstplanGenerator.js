// dienstplanGenerator.js
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
const dienstplanRepo = require("../repositories/dienstplan.repo.pg");
const abwesenheitenRepo = require("../repositories/abwesenheiten.repo.pg");

// Stunden pro Arbeitstag (A/E). (K/U wird später über Shift-Route korrekt mit 8h gerechnet)
const STUNDEN_PRO_DIENST = 9;
const STUNDEN_PRO_KU = 8;

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
 */
function dateKey(d) {
  if (d instanceof Date) {
    return d.toISOString().slice(0, 10);
  }

  return String(d).slice(0, 10);
}

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function istArbeitsTyp(typ) {
  const t = String(typ || "F").toUpperCase();
  return t === "A" || t === "E";
}

/**
 * Diese Funktion macht den Aufruf robust und verhindert "undefined" Fehler.
 */
function resolveMonatsstunden(year, month) {
  const r = getMonthlyHours(year, month);
  if (typeof r === "number") return r;
  if (r && typeof r === "object" && typeof r.monatsstunden === "number") {
    return r.monatsstunden;
  }
  return Number(r) || 0;
}

async function generateDienstplan(year, month, fnr) {
  const jahr = Number(year);
  const monat = Number(month);
  const hasFnr = fnr !== undefined && fnr !== null && fnr !== "";
  const filialeFnr = hasFnr ? Number(fnr) : null;

  if (
    !Number.isInteger(jahr) ||
    !Number.isInteger(monat) ||
    monat < 1 ||
    monat > 12
  ) {
    throw new Error(
      `Ungültiges Jahr/Monat für die Generierung: jahr=${year}, monat=${month}`,
    );
  }

  if (hasFnr && (!Number.isInteger(filialeFnr) || filialeFnr <= 0)) {
    throw new Error(`Ungültige Filialnummer für die Generierung: fnr=${fnr}`);
  }

  const monatsstunden = resolveMonatsstunden(jahr, monat);
  const dates = getAllDatesOfMonth(jahr, monat);
  const abwesenheiten = await abwesenheitenRepo.findByMonat(jahr, monat);

  // Alle Daten einmal laden (Performance)
  const alleMitarbeiter = await mitarbeiterRepo.getAllBase({
    onlyActive: true,
  });

  function getAbwesenheit(mnr, datum) {
    const dk = dateKey(datum);

    return abwesenheiten.find((a) => {
      const von = dateKey(a.von);
      const bis = dateKey(a.bis);

      return Number(a.mnr) === Number(mnr) && dk >= von && dk <= bis;
    });
  }

  let alleFilialen;

  if (!hasFnr) {
    alleFilialen = await filialenRepo.getAll();
  } else {
    const filiale = await filialenRepo.getById(filialeFnr);
    if (!filiale) {
      throw new Error(`Filiale mit fnr=${filialeFnr} nicht gefunden.`);
    }
    alleFilialen = [filiale];
  }

  /*   // Neu-Generierung -> alte Stunden für Monat/Jahr entfernen.
  if (hasFnr) {
    await stundenRepo.deleteStunden(monat, jahr, filialeFnr);
  } else {
    await stundenRepo.deleteStunden(monat, jahr);
  } */

  // Globale Liste: enthält am Ende alle Dienste aller Filialen.
  const dienste = [];
  const globaleStundenByMnr = new Map();
  const globaleDienstKey = new Set();

  function addStunden(mnr, stunden) {
    const cur = globaleStundenByMnr.get(mnr) || 0;
    globaleStundenByMnr.set(mnr, cur + stunden);
  }

  function removeStunden(mnr, stunden) {
    const cur = globaleStundenByMnr.get(mnr) || 0;
    globaleStundenByMnr.set(mnr, Math.max(0, cur - stunden));
  }

  // ============================================================
  // PRO FILIALE generieren
  // ============================================================
  for (const filiale of alleFilialen) {
    // Nur Mitarbeiter der Hauptfiliale werden automatisch eingeplant.
    const mitarbeiterFilialeAlle = alleMitarbeiter
      .filter((m) => Number(m.hauptfiliale_fnr) === Number(filiale.fnr))
      .sort((a, b) => Number(a.mnr) - Number(b.mnr));

    // Normale Mitarbeiter werden regulär nach Algorithmus geplant
    const mitarbeiterFiliale = mitarbeiterFilialeAlle.filter(
      (m) => m.springer !== true,
    );

    // Springer werden NICHT in Phase 1 verplant.
    // Sie bleiben Reserve für spätere Phasen.
    const springerFiliale = alleMitarbeiter.filter((m) => {
      if (m.springer !== true) return false;

      if (hasFnr) {
        return Number(m.hauptfiliale_fnr) === Number(filiale.fnr);
      }

      const istHauptfiliale =
        Number(m.hauptfiliale_fnr) === Number(filiale.fnr);

      const istNebenfiliale = (m.nebenfilialen || []).some(
        (fnr) => Number(fnr) === Number(filiale.fnr),
      );

      return istHauptfiliale || istNebenfiliale;
    });

    if (mitarbeiterFiliale.length === 0) continue;

    if (
      await dienstplanRepo.findDienstplanByDateAndFnr(jahr, monat, filiale.fnr)
    )
      continue;
    await stundenRepo.deleteStunden(monat, jahr, filiale.fnr);

    // ------------------------------------------------------------
    // Tracking-Strukturen (Map/Set)
    // ------------------------------------------------------------
    const stundenByMnr = new Map();
    const idxByMnrDate = new Map();
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

      const algorithm = getAlgorithmus(algoId);

      if (!Array.isArray(algorithm) || algorithm.length === 0) {
        throw new Error(
          `Algorithmus fehlt/leer für fnr=${filiale.fnr}, mnr=${m.mnr}, algoId=${algoId}`,
        );
      }

      const faktor = getFaktorFuerMitarbeiter(m);
      const zielStunden = Math.round(monatsstunden * faktor);
      const limitStunden = zielStunden + LIMIT_PUFFER_STUNDEN;

      let counter = Number(m.counter);
      if (!Number.isFinite(counter) || counter < 0) counter = 0;

      if (!stundenByMnr.has(m.mnr)) stundenByMnr.set(m.mnr, 0);

      for (const date of dates) {
        const dk = dateKey(date);

        let schicht_typ = algorithm[counter % algorithm.length];

        const abwesenheit = getAbwesenheit(m.mnr, date);

        if (abwesenheit) {
          schicht_typ = abwesenheit.typ;
        }

        const bereits = stundenByMnr.get(m.mnr) || 0;
        if (schicht_typ !== "F" && bereits >= limitStunden) {
          schicht_typ = "F";
        }

        const idx = dienste.length;
        if (schicht_typ !== "F") {
          globaleDienstKey.add(`${m.mnr}|${dk}`);
        }
        dienste.push({
          jahr,
          monat,
          datum: date,
          mnr: m.mnr,
          fnr: filiale.fnr,
          schicht_typ,
        });

        idxByMnrDate.set(`${m.mnr}|${dk}`, idx);

        if (schicht_typ === "K" || schicht_typ === "U") {
          const realStunden = Math.round(STUNDEN_PRO_KU * faktor);

          stundenByMnr.set(m.mnr, bereits + realStunden);
          addStunden(m.mnr, realStunden);
        } else if (schicht_typ !== "F") {
          stundenByMnr.set(m.mnr, bereits + STUNDEN_PRO_DIENST);
          addStunden(m.mnr, STUNDEN_PRO_DIENST);
        }

        if (!abdeckungByDate.has(dk)) {
          abdeckungByDate.set(dk, { A: new Set(), E: new Set() });
        }
        if (schicht_typ === "A") abdeckungByDate.get(dk).A.add(m.mnr);
        if (schicht_typ === "E") abdeckungByDate.get(dk).E.add(m.mnr);

        counter = (counter + 1) % algorithm.length;
      }

      // Counter dauerhaft speichern -> nächster Monat startet versetzt
      await mitarbeiterRepo.updateCounter(m.mnr, counter);
    }

    // ------------------------------------------------------------
    // PHASE 2: A/E pro Tag garantieren
    // ------------------------------------------------------------
    function setBestFTo(dk, typ) {
      const kandidaten = [];

      for (const m of mitarbeiterFiliale) {
        const idx = idxByMnrDate.get(`${m.mnr}|${dk}`);
        if (idx == null) continue;

        if (dienste[idx].schicht_typ !== "F") continue;

        const faktor = getFaktorFuerMitarbeiter(m);
        const zielStunden = Math.round(monatsstunden * faktor);
        const ist = stundenByMnr.get(m.mnr) || 0;
        const differenz = ist - zielStunden;

        kandidaten.push({
          m,
          idx,
          ist,
          zielStunden,
          differenz,
          arbeitnehmertyp: Number(m.arbeitnehmertyp ?? 40) || 40,
          springer: m.springer === true,
        });
      }

      if (kandidaten.length === 0) return false;

      kandidaten.sort((a, b) => {
        // zuerst der mit den wenigsten Überstunden / meisten fehlenden Stunden
        if (a.differenz !== b.differenz) return a.differenz - b.differenz;

        // Teilzeit etwas bevorzugen, damit 20h/30h nicht untergehen
        if (a.arbeitnehmertyp !== b.arbeitnehmertyp) {
          return a.arbeitnehmertyp - b.arbeitnehmertyp;
        }

        // normale Mitarbeiter vor Springern bevorzugen
        if (a.springer !== b.springer) {
          return Number(a.springer) - Number(b.springer);
        }

        // stabiler Tie-Break
        return Number(a.m.mnr) - Number(b.m.mnr);
      });

      const pick = kandidaten[0];

      dienste[pick.idx].schicht_typ = typ;

      const cur = stundenByMnr.get(pick.m.mnr) || 0;
      stundenByMnr.set(pick.m.mnr, cur + STUNDEN_PRO_DIENST);
      addStunden(pick.m.mnr, STUNDEN_PRO_DIENST);

      if (!abdeckungByDate.has(dk)) {
        abdeckungByDate.set(dk, { A: new Set(), E: new Set() });
      }
      abdeckungByDate.get(dk)[typ].add(pick.m.mnr);

      return true;
    }

    for (const date of dates) {
      const dk = dateKey(date);

      if (!abdeckungByDate.has(dk)) {
        abdeckungByDate.set(dk, { A: new Set(), E: new Set() });
      }

      const cov = abdeckungByDate.get(dk);
      if (cov.A.size === 0) setBestFTo(dk, "A");
      if (cov.E.size === 0) setBestFTo(dk, "E");
    }

    // -------------------------------------------------------------------------
    // PHASE 3: Stunden-Kürzung mit monatlichem Ausgleichspuffer
    // -------------------------------------------------------------------------
    // Teilzeit zuerst kürzen, dann Vollzeit, Springer optional zuletzt.
    const sortedMitarbeiterFuerKuerzung = [...mitarbeiterFiliale].sort(
      (a, b) => {
        const aTeilzeit = Number(a.arbeitnehmertyp ?? 40) < 40 ? 0 : 1;
        const bTeilzeit = Number(b.arbeitnehmertyp ?? 40) < 40 ? 0 : 1;

        // zuerst Teilzeit
        if (aTeilzeit !== bTeilzeit) return aTeilzeit - bTeilzeit;

        // Springer zuletzt
        if (a.springer !== b.springer) return a.springer ? 1 : -1;

        // stabil
        return Number(a.mnr) - Number(b.mnr);
      },
    );

    for (const m of sortedMitarbeiterFuerKuerzung) {
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

        kandidaten.sort((a, b) => {
          // zuerst spätere Dienste kürzen
          if (a.idx !== b.idx) return b.idx - a.idx;

          // stabiler Tie-Break
          return String(a.dk).localeCompare(String(b.dk));
        });

        const pick = shuffleArray(kandidaten)[0];

        dienste[pick.idx].schicht_typ = "F";
        abdeckungByDate.get(pick.dk)[pick.typ].delete(m.mnr);

        hours -= STUNDEN_PRO_DIENST;
        if (hours < 0) hours = 0;
        stundenByMnr.set(m.mnr, hours);
        removeStunden(m.mnr, STUNDEN_PRO_DIENST);
      }
    }

    // ------------------------------------------------------------
    // PHASE 4: Endkontrolle (A/E muss trotzdem da sein)
    // ------------------------------------------------------------
    for (const date of dates) {
      const dk = dateKey(date);

      if (!abdeckungByDate.has(dk)) {
        abdeckungByDate.set(dk, { A: new Set(), E: new Set() });
      }

      const cov = abdeckungByDate.get(dk);
      if (cov.A.size === 0) setBestFTo(dk, "A");
      if (cov.E.size === 0) setBestFTo(dk, "E");
    }

    // ------------------------------------------------------------
    // PHASE 4.5: Überstunden durch Springer entlasten
    // ------------------------------------------------------------
    /* const springerFiliale = mitarbeiterFilialeAlle.filter(
  (m) => m.springer === true,
); */

    function findeFreienSpringer(dk) {
      for (const s of springerFiliale) {
        const globalKey = `${s.mnr}|${dk}`;

        // Springer darf an diesem Tag nirgends anders arbeiten
        if (globaleDienstKey.has(globalKey)) continue;

        // Springer darf nicht Urlaub/Krank/Abwesend sein
        if (getAbwesenheit(s.mnr, dk)) continue;

        return s;
      }

      return null;
    }

    const ueberlasteteMitarbeiter = [...mitarbeiterFiliale]
      .map((m) => {
        const faktor = getFaktorFuerMitarbeiter(m);
        const zielStunden = Math.round(monatsstunden * faktor);
        const ist = stundenByMnr.get(m.mnr) || 0;

        return {
          mitarbeiter: m,
          zielStunden,
          istStunden: ist,
          differenz: ist - zielStunden,
        };
      })
      .filter((x) => x.differenz > 0)
      .sort((a, b) => b.differenz - a.differenz);

    for (const x of ueberlasteteMitarbeiter) {
      const m = x.mitarbeiter;

      let aktuelleDifferenz = x.differenz;

      for (const date of shuffleArray(dates)) {
        if (aktuelleDifferenz <= STUNDEN_PRO_DIENST) break;

        const dk = dateKey(date);
        const idx = idxByMnrDate.get(`${m.mnr}|${dk}`);

        if (idx == null) continue;

        const dienst = dienste[idx];
        const typ = String(dienst.schicht_typ || "F").toUpperCase();

        if (typ !== "A" && typ !== "E") continue;

        const cov = abdeckungByDate.get(dk);
        if (!cov) continue;

        // Nur Dienste entlasten, die aktuell NICHT kürzbar sind,
        // weil sie die einzige A/E-Abdeckung darstellen.
        if (cov[typ].size !== 1) continue;

        const springer = findeFreienSpringer(dk);
        if (!springer) continue;

        if (verletztRuhezeit(springer.mnr, dk, typ)) continue;
        if (verletztMaxFolge(springer.mnr, dk)) continue;
        if (verletzt2TageRuheNach4(springer.mnr, dk)) continue;

        const globalSpringerKey = `${springer.mnr}|${dk}`;

        if (globaleDienstKey.has(globalSpringerKey)) continue;

        const springerIdx = idxByMnrDate.get(`${springer.mnr}|${dk}`);

        if (springerIdx == null) {
          const neuerIdx = dienste.length;

          dienste.push({
            jahr,
            monat,
            datum: date,
            mnr: springer.mnr,
            fnr: filiale.fnr,
            schicht_typ: typ,
          });

          idxByMnrDate.set(`${springer.mnr}|${dk}`, neuerIdx);
        } else {
          dienste[springerIdx].schicht_typ = typ;
        }
        globaleDienstKey.add(globalSpringerKey);

        // Springer bekommt Stunden
        const springerIst = stundenByMnr.get(springer.mnr) || 0;
        stundenByMnr.set(springer.mnr, springerIst + STUNDEN_PRO_DIENST);
        addStunden(springer.mnr, STUNDEN_PRO_DIENST);

        // Springer übernimmt A/E-Abdeckung
        cov[typ].add(springer.mnr);

        // Überlasteter Mitarbeiter wird frei
        dienste[idx].schicht_typ = "F";
        cov[typ].delete(m.mnr);

        const mIst = stundenByMnr.get(m.mnr) || 0;
        stundenByMnr.set(m.mnr, Math.max(0, mIst - STUNDEN_PRO_DIENST));
        removeStunden(m.mnr, STUNDEN_PRO_DIENST);

        aktuelleDifferenz -= STUNDEN_PRO_DIENST;

        if (aktuelleDifferenz <= STUNDEN_PRO_DIENST) {
          break;
        }
      }
    }

    // ------------------------------------------------------------
    // Hilfe
    //

    function typVonMitarbeiterAmTag(mnr, dk) {
      const dienst = dienste.find(
        (d) =>
          Number(d.mnr) === Number(mnr) &&
          dateKey(d.datum) === dk &&
          String(d.schicht_typ || "F").toUpperCase() !== "F",
      );

      if (!dienst) return "F";

      return String(dienst.schicht_typ || "F").toUpperCase();
    }

    function addDays(dk, offset) {
      const d = new Date(`${dk}T00:00:00`);
      d.setDate(d.getDate() + offset);
      return d.toISOString().slice(0, 10);
    }

    function verletztRuhezeit(mnr, dk, neuerTyp) {
      const gestern = typVonMitarbeiterAmTag(mnr, addDays(dk, -1));
      const morgen = typVonMitarbeiterAmTag(mnr, addDays(dk, 1));

      if (gestern === "E" && neuerTyp === "A") return true;
      if (neuerTyp === "E" && morgen === "A") return true;

      return false;
    }

    function verletztMaxFolge(mnr, dk) {
      let count = 1;

      for (let i = 1; i <= 5; i++) {
        const typ = typVonMitarbeiterAmTag(mnr, addDays(dk, -i));
        if (!istArbeitsTyp(typ)) break;
        count++;
      }

      for (let i = 1; i <= 5; i++) {
        const typ = typVonMitarbeiterAmTag(mnr, addDays(dk, i));
        if (!istArbeitsTyp(typ)) break;
        count++;
      }

      return count > 4;
    }

    function verletzt2TageRuheNach4(mnr, dk) {
      const t1 = typVonMitarbeiterAmTag(mnr, addDays(dk, -1));
      const t2 = typVonMitarbeiterAmTag(mnr, addDays(dk, -2));
      const t3 = typVonMitarbeiterAmTag(mnr, addDays(dk, -3));
      const t4 = typVonMitarbeiterAmTag(mnr, addDays(dk, -4));
      const t5 = typVonMitarbeiterAmTag(mnr, addDays(dk, -5));

      // Direkt nach 4 Arbeitstagen muss frei sein
      if (
        istArbeitsTyp(t1) &&
        istArbeitsTyp(t2) &&
        istArbeitsTyp(t3) &&
        istArbeitsTyp(t4)
      ) {
        return true;
      }

      // Zweiter freier Tag nach 4 Arbeitstagen
      if (
        t1 === "F" &&
        istArbeitsTyp(t2) &&
        istArbeitsTyp(t3) &&
        istArbeitsTyp(t4) &&
        istArbeitsTyp(t5)
      ) {
        return true;
      }

      return false;
    }

    // ------------------------------------------------------------
    // PHASE 4.7: Zu lange Dienstblöcke durch Springer entlasten
    // ------------------------------------------------------------
    function arbeitsTageBlockVon(mnr) {
      const bloecke = [];
      let aktuellerBlock = [];

      for (const date of dates) {
        const dk = dateKey(date);
        const idx = idxByMnrDate.get(`${mnr}|${dk}`);
        const typ =
          idx == null
            ? "F"
            : String(dienste[idx].schicht_typ || "F").toUpperCase();

        if (typ === "A" || typ === "E") {
          aktuellerBlock.push({ dk, idx, typ, date });
        } else {
          if (aktuellerBlock.length > 4) bloecke.push([...aktuellerBlock]);
          aktuellerBlock = [];
        }
      }

      if (aktuellerBlock.length > 4) bloecke.push([...aktuellerBlock]);

      return bloecke;
    }

    for (const m of mitarbeiterFiliale) {
      const bloecke = arbeitsTageBlockVon(m.mnr);

      for (const block of bloecke) {
        const zuEntlasten = block.slice(4);

        for (const eintrag of zuEntlasten) {
          const { dk, idx, typ } = eintrag;

          const springer = findeFreienSpringer(dk);
          if (!springer) continue;

          if (verletztRuhezeit(springer.mnr, dk, typ)) continue;
          if (verletztMaxFolge(springer.mnr, dk)) continue;
          if (verletzt2TageRuheNach4(springer.mnr, dk)) continue;

          const globalSpringerKey = `${springer.mnr}|${dk}`;
          if (globaleDienstKey.has(globalSpringerKey)) continue;

          const neuerIdx = dienste.length;

          dienste.push({
            jahr,
            monat,
            datum: eintrag.date,
            mnr: springer.mnr,
            fnr: filiale.fnr,
            schicht_typ: typ,
          });

          idxByMnrDate.set(`${springer.mnr}|${dk}`, neuerIdx);
          globaleDienstKey.add(globalSpringerKey);

          const springerIst = stundenByMnr.get(springer.mnr) || 0;
          stundenByMnr.set(springer.mnr, springerIst + STUNDEN_PRO_DIENST);
          addStunden(springer.mnr, STUNDEN_PRO_DIENST);

          dienste[idx].schicht_typ = "F";
          globaleDienstKey.delete(`${m.mnr}|${dk}`);

          const mIst = stundenByMnr.get(m.mnr) || 0;
          stundenByMnr.set(m.mnr, Math.max(0, mIst - STUNDEN_PRO_DIENST));
          removeStunden(m.mnr, STUNDEN_PRO_DIENST);

          const cov = abdeckungByDate.get(dk);
          if (cov) {
            cov[typ].delete(m.mnr);
            cov[typ].add(springer.mnr);
          }

          break;
        }
      }
    }

    // ------------------------------------------------------------
    // PHASE 4.9: E -> A Ruhezeit-Verletzungen durch Springer entlasten
    // ------------------------------------------------------------
    for (const m of mitarbeiterFiliale) {
      for (const date of dates) {
        const dk = dateKey(date);
        const gesternDk = addDays(dk, -1);

        const gesternTyp = typVonMitarbeiterAmTag(m.mnr, gesternDk);
        const heuteIdx = idxByMnrDate.get(`${m.mnr}|${dk}`);
        if (heuteIdx == null) continue;

        const heuteTyp = String(
          dienste[heuteIdx].schicht_typ || "F",
        ).toUpperCase();

        if (gesternTyp !== "E" || heuteTyp !== "A") continue;

        const springer = findeFreienSpringer(dk);
        if (!springer) continue;

        if (verletztRuhezeit(springer.mnr, dk, heuteTyp)) continue;
        if (verletztMaxFolge(springer.mnr, dk)) continue;
        if (verletzt2TageRuheNach4(springer.mnr, dk)) continue;

        const globalSpringerKey = `${springer.mnr}|${dk}`;
        if (globaleDienstKey.has(globalSpringerKey)) continue;

        const neuerIdx = dienste.length;

        dienste.push({
          jahr,
          monat,
          datum: date,
          mnr: springer.mnr,
          fnr: filiale.fnr,
          schicht_typ: heuteTyp,
        });

        idxByMnrDate.set(`${springer.mnr}|${dk}`, neuerIdx);
        globaleDienstKey.add(globalSpringerKey);

        const springerIst = stundenByMnr.get(springer.mnr) || 0;
        stundenByMnr.set(springer.mnr, springerIst + STUNDEN_PRO_DIENST);
        addStunden(springer.mnr, STUNDEN_PRO_DIENST);

        dienste[heuteIdx].schicht_typ = "F";
        globaleDienstKey.delete(`${m.mnr}|${dk}`);

        const mIst = stundenByMnr.get(m.mnr) || 0;
        stundenByMnr.set(m.mnr, Math.max(0, mIst - STUNDEN_PRO_DIENST));
        removeStunden(m.mnr, STUNDEN_PRO_DIENST);

        const cov = abdeckungByDate.get(dk);
        if (cov) {
          cov.A.delete(m.mnr);
          cov.A.add(springer.mnr);
        }
      }
    }

    // ------------------------------------------------------------
    // PHASE 4.8: Endkontrolle nach Springer-Entlastung
    // ------------------------------------------------------------
    for (const date of dates) {
      const dk = dateKey(date);

      if (!abdeckungByDate.has(dk)) {
        abdeckungByDate.set(dk, { A: new Set(), E: new Set() });
      }

      const cov = abdeckungByDate.get(dk);

      if (cov.A.size === 0) setBestFTo(dk, "A");
      if (cov.E.size === 0) setBestFTo(dk, "E");
    }
    // ------------------------------------------------------------
    // PHASE 4.10: Springer in eigener Hauptfiliale auffüllen
    // ------------------------------------------------------------
    const springerHauptfiliale = alleMitarbeiter.filter(
      (m) =>
        m.springer === true &&
        Number(m.hauptfiliale_fnr) === Number(filiale.fnr),
    );

    function zaehleTypAmTag(dk, typ) {
      const cov = abdeckungByDate.get(dk);
      if (!cov) return 0;
      return cov[typ]?.size ?? 0;
    }

    function besterTypFuerSpringer(springerMnr, dk) {
      const gestern = typVonMitarbeiterAmTag(springerMnr, addDays(dk, -1));
      const morgen = typVonMitarbeiterAmTag(springerMnr, addDays(dk, 1));

      const moeglich = [];

      if (!(gestern === "E")) moeglich.push("A");
      if (!(morgen === "A")) moeglich.push("E");

      if (moeglich.length === 0) return null;

      moeglich.sort((a, b) => zaehleTypAmTag(dk, a) - zaehleTypAmTag(dk, b));

      return moeglich[0];
    }

    for (const springer of springerHauptfiliale) {
      const faktor = getFaktorFuerMitarbeiter(springer);
      const zielStunden = Math.round(monatsstunden * faktor);

      let ist = globaleStundenByMnr.get(springer.mnr) || 0;

      for (const date of dates) {
        if (zielStunden - ist < STUNDEN_PRO_DIENST) break;

        const dk = dateKey(date);
        const globalKey = `${springer.mnr}|${dk}`;

        if (globaleDienstKey.has(globalKey)) continue;
        if (getAbwesenheit(springer.mnr, date)) continue;

        const typ = besterTypFuerSpringer(springer.mnr, dk);
        if (!typ) continue;

        if (verletztRuhezeit(springer.mnr, dk, typ)) continue;
        if (verletztMaxFolge(springer.mnr, dk)) continue;
        if (verletzt2TageRuheNach4(springer.mnr, dk)) continue;

        const neuerIdx = dienste.length;

        dienste.push({
          jahr,
          monat,
          datum: date,
          mnr: springer.mnr,
          fnr: filiale.fnr,
          schicht_typ: typ,
        });

        idxByMnrDate.set(`${springer.mnr}|${dk}`, neuerIdx);
        globaleDienstKey.add(globalKey);

        if (!abdeckungByDate.has(dk)) {
          abdeckungByDate.set(dk, { A: new Set(), E: new Set() });
        }

        abdeckungByDate.get(dk)[typ].add(springer.mnr);

        ist += STUNDEN_PRO_DIENST;
        stundenByMnr.set(springer.mnr, ist);
        addStunden(springer.mnr, STUNDEN_PRO_DIENST);
      }
    }

    // ------------------------------------------------------------
    // PHASE 4.11: Fehlende F-Dienste nur in Hauptfiliale ergänzen
    // ------------------------------------------------------------
    for (const m of mitarbeiterFilialeAlle) {
      for (const date of dates) {
        const dk = dateKey(date);
        const key = `${m.mnr}|${dk}`;

        if (idxByMnrDate.has(key)) continue;
        if (globaleDienstKey.has(key)) continue;

        const idx = dienste.length;

        dienste.push({
          jahr,
          monat,
          datum: date,
          mnr: m.mnr,
          fnr: filiale.fnr,
          schicht_typ: "F",
        });

        idxByMnrDate.set(key, idx);
      }
    }
  } // Ende der Filialen-Schleife

  // ------------------------------------------------------------
  // PHASE 5: Globale Stunden in DB speichern
  // ------------------------------------------------------------
  const mitarbeiterMitDienst = new Set(dienste.map((d) => Number(d.mnr)));

  for (const m of alleMitarbeiter) {
    if (!mitarbeiterMitDienst.has(Number(m.mnr))) continue;

    const faktor = getFaktorFuerMitarbeiter(m);
    const zielStunden = Math.round(monatsstunden * faktor);
    const ist = globaleStundenByMnr.get(m.mnr) || 0;

    await stundenRepo.saveStunden({
      mnr: m.mnr,
      jahr,
      monat,
      soll_stunden_monat: zielStunden,
      ist_stunden_monat: ist,
      differenz: ist - zielStunden,
    });
  }

  // ============================================================
  // Alles in DB speichern
  // ============================================================
  await savePlan(jahr, monat, dienste);

  return { count: dienste.length };
}

module.exports = { generateDienstplan };
