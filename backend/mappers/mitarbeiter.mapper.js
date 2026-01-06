function fromFrontend(b) {
  // hauptfiliale kann Objekt sein oder direkt fnr
  const hauptfiliale_fnr =
    b.hauptfiliale_fnr ??
    b.hauptfiliale?.fnr ??
    b.hauptfiliale?.id ??
    null;

  // nebenfilialen kann [{id,name}] sein oder [fnr]
  const nebenfilialen = Array.isArray(b.nebenfilialen)
    ? b.nebenfilialen
        .map(x => (typeof x === "object" ? (x.fnr ?? x.id) : x))
        .map(Number)
        .filter(Number.isFinite)
    : [];

  // springer kann boolean oder "Ja/Nein/Nicht bekannt" sein
  const springer =
    b.springer === true ? true :
    b.springer === false ? false :
    b.springer === "Ja" ? true :
    b.springer === "Nein" ? false :
    false; // default

  // arbeitsstunden -> arbeitnehmertyp (20/30/40)
  const arbeitnehmertyp =
    Number.isFinite(Number(b.arbeitnehmertyp)) ? Number(b.arbeitnehmertyp) :
    Number.isFinite(Number(b.arbeitsstunden)) ? Number(b.arbeitsstunden) :
    40;

  // kontakt kommt im FE flach
  const kontaktObj = {
    strasse: b.strasse ?? null,
    plz: b.postleitzahl ?? b.plz ?? null,
    ort: b.ort ?? null,
    land: b.land ?? null,
  };
  const kontakt =
    Object.values(kontaktObj).some(v => v) ? kontaktObj : null;

  // FE: telefon1/telefon2
  const telefone = [];
  if (b.telefon1) telefone.push({ telefon_typ: "mobil", nummer: String(b.telefon1) });
  if (b.telefon2) telefone.push({ telefon_typ: "fix", nummer: String(b.telefon2) });

  // FE: email1/email2
  const emails = [];
  if (b.email1) emails.push({ email_typ: "privat", email_adresse: String(b.email1) });
  if (b.email2) emails.push({ email_typ: "firma",  email_adresse: String(b.email2) });

  return {
    vorname: b.vorname,
    nachname: b.nachname,
    hauptfiliale_fnr,
    arbeitnehmertyp,
    springer,
    springeralgorithmid: b.springeralgorithmid ?? null,

    kontakt,
    telefone,
    emails,
    nebenfilialen,

    // counter bewusst NICHT aus FE übernehmen
  };
}


function toFrontend(ma, filialen = []) {
  const byFnr = new Map(filialen.map(f => [Number(f.fnr), f]));

  const haupt = ma.hauptfiliale_fnr != null
    ? byFnr.get(Number(ma.hauptfiliale_fnr))
    : null;

  const hauptfiliale = haupt
    ? { id: Number(haupt.fnr), name: haupt.filialname }
    : (ma.hauptfiliale_fnr != null ? { id: Number(ma.hauptfiliale_fnr), name: String(ma.hauptfiliale_fnr) } : null);

  const nebenfilialen = Array.isArray(ma.nebenfilialen)
    ? ma.nebenfilialen.map(fnr => {
        const f = byFnr.get(Number(fnr));
        return f
          ? { id: Number(f.fnr), name: f.filialname }
          : { id: Number(fnr), name: String(fnr) };
      })
    : [];

  const mobil = (ma.telefone || []).find(t => t.telefon_typ === "mobil")?.nummer ?? "";
  const fix   = (ma.telefone || []).find(t => t.telefon_typ === "fix")?.nummer ?? "";

  const priv  = (ma.emails || []).find(e => e.email_typ === "privat")?.email_adresse ?? "";
  const firma = (ma.emails || []).find(e => e.email_typ === "firma")?.email_adresse ?? "";

  return {
    id: ma.mnr,                 // fürs FE praktisch
    mnr: ma.mnr,                // wenn er’s so braucht

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
    springer: ma.springer ? "Ja" : "Nein",

    hauptfiliale,
    nebenfilialen,

    anmerkungen: "" 
  };
}

module.exports = { fromFrontend, toFrontend };