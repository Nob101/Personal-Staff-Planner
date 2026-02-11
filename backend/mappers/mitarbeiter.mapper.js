/**
 * ============================================================================
 * mitarbeiter.mapper.js
 * ----------------------------------------------------------------------------
 * Dieses Modul übernimmt die Umwandlung (Mapping) zwischen:
 * - Frontend-Format (Formular / UI-Daten, teils Strings/Objekte)
 * - Backend/DB-Format (saubere, typisierte Werte für Persistenz)
 *
 * Warum braucht man das?
 * - Frontend liefert Werte oft in verschiedenen Formen (z.B. "Ja"/true, Objekt/ID)
 * - Die Datenbank erwartet konsistente Typen (Zahlen, Booleans, Arrays)
 * - Bei Updates (PATCH/PUT) muss klar unterschieden werden:
 *   "Feld fehlt" vs. "Feld ist bewusst leer/false"
 * ============================================================================
 */

/**
 * Prüft, ob ein Schlüssel DIREKT auf einem Objekt existiert.
 *
 * Wichtig für Updates:
 * - Wenn ein Feld NICHT gesendet wurde, darf es nicht überschrieben werden.
 * - Wenn ein Feld gesendet wurde (auch leer/false), soll es übernommen werden.
 */
function has(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * ============================================================================
 * fromFrontendPatch
 * ----------------------------------------------------------------------------
 * Verarbeitet partielle Updates.
 * Es werden nur Felder übernommen, die im Request tatsächlich vorhanden sind.
 *
 * Zweck:
 * - verhindert, dass bei einem Patch aus Versehen Werte "gelöscht" werden
 *   (weil das Feld einfach nicht mitgeschickt wurde)
 * ============================================================================
 */
function fromFrontendPatch(b) {
  const out = {};

  // Basisfelder (wenn vorhanden übernehmen)
  if (has(b, "vorname")) out.vorname = b.vorname;
  if (has(b, "nachname")) out.nachname = b.nachname;
  if (has(b, "anmerkungen")) out.anmerkung = b.anmerkungen;

  /**
   * Hauptfiliale:
   * Das Frontend kann sie in mehreren Varianten senden:
   * - hauptfiliale_fnr: Zahl
   * - hauptfiliale: Zahl
   * - hauptfiliale: { id } oder { fnr }
   * -> Wir normalisieren auf hauptfiliale_fnr (Number oder null)
   */
  if (has(b, "hauptfiliale") || has(b, "hauptfiliale_fnr")) {
    const hf =
      Number.isFinite(Number(b.hauptfiliale_fnr)) ? Number(b.hauptfiliale_fnr) :
      Number.isFinite(Number(b.hauptfiliale))     ? Number(b.hauptfiliale) :
      Number.isFinite(Number(b.hauptfiliale?.id)) ? Number(b.hauptfiliale.id) :
      Number.isFinite(Number(b.hauptfiliale?.fnr))? Number(b.hauptfiliale.fnr) :
      null;

    out.hauptfiliale_fnr = hf;
  }

  /**
   * Springer:
   * Das Frontend liefert teils boolean, teils "Ja"/"Nein".
   * -> Normalisierung auf boolean für die DB.
   */
  if (has(b, "springer")) {
    const val = b.springer;

    if (val === true || val === "Ja") out.springer = true;
    else if (val === false || val === "Nein") out.springer = false;
  }

  /**
   * Arbeitszeit:
   * Kann unter arbeitnehmertyp oder arbeitsstunden kommen.
   * -> Normalisierung auf arbeitnehmertyp (Number oder null)
   */
  if (has(b, "arbeitnehmertyp") || has(b, "arbeitsstunden")) {
    const at =
      Number.isFinite(Number(b.arbeitnehmertyp)) ? Number(b.arbeitnehmertyp) :
      Number.isFinite(Number(b.arbeitsstunden))  ? Number(b.arbeitsstunden) :
      null;

    out.arbeitnehmertyp = at;
  }

  /**
   * Nebenfilialen:
   * Erwartet wird ein Array von Filialnummern.
   * Frontend kann auch Objekte liefern (z.B. {id, name}).
   * -> Wir speichern nur die IDs/FNRs als Zahlen.
   */
  if (has(b, "nebenfilialen")) {
    out.nebenfilialen = Array.isArray(b.nebenfilialen)
      ? b.nebenfilialen
          .map((x) =>
            typeof x === "object" ? Number(x.id ?? x.fnr) : Number(x)
          )
          .filter(Number.isFinite)
      : [];
  }

  return out;
}

/**
 * ============================================================================
 * fromFrontend
 * ----------------------------------------------------------------------------
 * Verarbeitet "vollständige" Objekte (POST / PUT).
 * Ziel: ein DB-taugliches DTO erstellen, das konsistent gespeichert werden kann.
 * ============================================================================
 */
function fromFrontend(b) {
  /**
   * Hauptfiliale:
   * kann Objekt sein oder direkt die Filialnummer.
   * -> Wir normalisieren auf hauptfiliale_fnr (Number oder null)
   */
  const hauptfiliale_fnr = Number.isFinite(Number(b.hauptfiliale_fnr))
    ? Number(b.hauptfiliale_fnr)
    : Number.isFinite(Number(b.hauptfiliale))
    ? Number(b.hauptfiliale)
    : Number.isFinite(Number(b.hauptfiliale?.id))
    ? Number(b.hauptfiliale.id)
    : Number.isFinite(Number(b.hauptfiliale?.fnr))
    ? Number(b.hauptfiliale.fnr)
    : null;

  /**
   * Nebenfilialen:
   * - undefined bedeutet: "nicht ändern" (wichtig für PUT/optional Felder)
   * - null bedeutet: "bewusst leeren"
   * - Array: übernehmen
   */
  let nebenfilialen = undefined; // undefined = "nicht ändern"

  if ("nebenfilialen" in b) {
    if (b.nebenfilialen === null) {
      nebenfilialen = []; // null => bewusst leeren
    } else if (Array.isArray(b.nebenfilialen)) {
      nebenfilialen = b.nebenfilialen
        .map((x) => (typeof x === "object" ? x.fnr ?? x.id : x))
        .map(Number)
        .filter(Number.isFinite);
      // [] bleibt [] => auch leeren
    } else {
      const one = Number(b.nebenfilialen);
      nebenfilialen = Number.isFinite(one) ? [one] : [];
    }
  }

  /**
   * Springer:
   * Frontend kann boolean oder "Ja/Nein/..." liefern.
   * -> Normalisierung auf boolean.
   */
  const springer =
    b.springer === true
      ? true
      : b.springer === false
      ? false
      : b.springer === "Ja"
      ? true
      : b.springer === "Nein"
      ? false
      : false; // default

  /**
   * Arbeitsstunden:
   * Frontend: arbeitsstunden
   * DB: arbeitnehmertyp
   * -> Default 40, wenn kein gültiger Wert vorhanden ist.
   */
  const arbeitnehmertyp = Number.isFinite(Number(b.arbeitnehmertyp))
    ? Number(b.arbeitnehmertyp)
    : Number.isFinite(Number(b.arbeitsstunden))
    ? Number(b.arbeitsstunden)
    : 40;

  /**
   * Kontakt:
   * Frontend sendet flach, DB speichert als Objekt (0..1).
   * -> kontakt wird nur gesetzt, wenn mindestens ein Feld befüllt ist.
   */
  const kontaktObj = {
    strasse: b.strasse ?? null,
    plz: b.postleitzahl ?? b.plz ?? null,
    ort: b.ort ?? null,
    land: b.land ?? null,
  };
  
  const kontakt = Object.values(kontaktObj).some((v) => v) ? kontaktObj : null; // Object.values prüft alle Werte auf "truthy"

  /**
   * Telefone:
   * Frontend hat telefon1/telefon2, DB speichert 0..n Einträge.
   */
  const telefone = [];
  if (b.telefon1)
    telefone.push({ telefon_typ: "mobil", nummer: String(b.telefon1) });
  if (b.telefon2)
    telefone.push({ telefon_typ: "fix", nummer: String(b.telefon2) });

  /**
   * E-Mails:
   * Frontend hat email1/email2, DB speichert 0..n Einträge.
   */
  const emails = [];
  if (b.email1)
    emails.push({ email_typ: "privat", email_adresse: String(b.email1) });
  if (b.email2)
    emails.push({ email_typ: "firma", email_adresse: String(b.email2) });

  /**
   * Ergebnisobjekt (DB-DTO):
   * Felder sind so benannt, wie sie in Repositories/DB erwartet werden.
   */
  const out = {
    vorname: b.vorname,
    nachname: b.nachname,
    hauptfiliale_fnr,
    arbeitnehmertyp,
    springer,
    springeralgorithmid: b.springeralgorithmid ?? null,
    anmerkung: b.anmerkungen ?? null,
    kontakt,
    telefone,
    emails,
  };

  // Nebenfilialen nur setzen, wenn Feld überhaupt übergeben wurde
  if (nebenfilialen !== undefined) out.nebenfilialen = nebenfilialen;

  return out;
}

/**
 * ============================================================================
 * toFrontend
 * ----------------------------------------------------------------------------
 * Wandelt DB-Daten (inkl. Details) in ein Frontend-taugliches Format.
 *
 * Zweck:
 * - Frontend bekommt menschenlesbare Filialnamen (nicht nur IDs)
 * - Kontakt/Email/Telefon werden wieder in flache Felder gemappt
 * ============================================================================
 */
function toFrontend(ma, filialen = []) {
  /**
   * Map (fnr -> Filiale):
   * Warum Map?
   * - O(1) Lookup statt jedes Mal Array-Durchlauf (O(n))
   * - relevant, weil Mapping pro Mitarbeiter oft aufgerufen wird
   */
  const byFnr = new Map(filialen.map((f) => [Number(f.fnr), f]));

  const haupt =
    ma.hauptfiliale_fnr != null ? byFnr.get(Number(ma.hauptfiliale_fnr)) : null;

  const hauptfiliale = haupt
    ? { id: Number(haupt.fnr), name: haupt.filialname }
    : ma.hauptfiliale_fnr != null
    ? { id: Number(ma.hauptfiliale_fnr), name: String(ma.hauptfiliale_fnr) }
    : null;

  /**
   * Nebenfilialen:
   * DB liefert IDs, Frontend bekommt (id + name).
   */
  const nebenfilialen = Array.isArray(ma.nebenfilialen)
    ? ma.nebenfilialen.map((fnr) => {
        const f = byFnr.get(Number(fnr));
        return f
          ? { id: Number(f.fnr), name: f.filialname }
          : { id: Number(fnr), name: String(fnr) };
      })
    : [];

  /**
   * Telefone/E-Mails:
   * DB speichert Arrays, Frontend bekommt wieder telefon1/telefon2 und email1/email2.
   */
  const mobil =
    (ma.telefone || []).find((t) => t.telefon_typ === "mobil")?.nummer ?? "";
  const fix =
    (ma.telefone || []).find((t) => t.telefon_typ === "fix")?.nummer ?? "";

  const priv =
    (ma.emails || []).find((e) => e.email_typ === "privat")?.email_adresse ??
    "";
  const firma =
    (ma.emails || []).find((e) => e.email_typ === "firma")?.email_adresse ?? "";

  /**
   * Ergebnisobjekt (Frontend-DTO):
   * Felder entsprechen den UI-Formularfeldern (flach).
   */
  return {
    id: ma.mnr,
    mnr: ma.mnr,

    vorname: ma.vorname,
    nachname: ma.nachname,

    email1: priv,
    email2: firma,
    telefon1: mobil,
    telefon2: fix,

    strasse: ma.kontakt?.strasse ?? "",
    ort: ma.kontakt?.ort ?? "",
    postleitzahl: ma.kontakt?.plz ?? "",
    land: ma.kontakt?.land ?? "",

    arbeitsstunden: ma.arbeitnehmertyp ?? null,
    springer: !!ma.springer,

    aktiv: !!ma.aktiv,

    hauptfiliale,
    nebenfilialen,

    anmerkungen: ma.anmerkung ?? "",
  };
}

module.exports = { fromFrontend, toFrontend, fromFrontendPatch };