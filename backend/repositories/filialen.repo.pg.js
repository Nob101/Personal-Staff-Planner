/*
Spalte	                               Typ	                            Beschreibung

fnr	                                   SERIAL                          PRIMARY KEY	
filialname	                           TEXT	                          Name oder Kürzel der Filiale
farbe	                                 TEXT	                          HEX-Farbcode fürs Frontend
ort	                                   TEXT	                          Standort
strasse	                               TEXT	                          Adresse
plz	                                   TEXT	                          Postleitzahl
land	                                 TEXT	                          Land
email	                                 TEXT	                          Kontaktadresse
telefon	                               TEXT	                          Telefonnummer
algorithmid	                           INTEGER	                      Referenz auf Algorithmus
*/


const pool = require("../db/pool");
//const { get } = require("../routes/mitarbeiter.routes");



async function add(f){
  const result = await pool.query(
    `
    INSERT INTO filiale (filialname, farbe, ort, strasse, plz, land, email, telefon, algorithmid, anmerkung, aktiv)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, $11)
    RETURNING *;
    `,
    [
      f.filialname,
      f.farbe,
      f.ort,
      f.strasse,
      f.plz,
      f.land,
      f.email,
      f.telefon,
      f.algorithmid,
      f.anmerkung ?? "",  //Falls anmerkung leer bleibt
      f.aktiv
    ],
  );

  return result.rows[0];  
}

/**
 * Liefert alle Filialen.
 *
 * ORDER BY fnr sorgt für eine stabile Reihenfolge,
 * damit das Frontend nicht "zufällig" sortierte Daten erhält.
 */

// NEU: Damit nur aktive (true zurückgegeben werden)
async function getAll({onlyActive = false} = {}) {
  const where = onlyActive ? `WHERE aktiv = true`: ``;
  const result = await pool.query(`SELECT * FROM filiale ${where} ORDER BY fnr;`);
  return result.rows;
}

async function getById(fnr){
  const result = await pool.query(
    `select * from filiale where fnr = $1;`,
    [fnr]
  );
  return result.rows[0] || null;
} 

async function update(fnr, updates){
  const allowedFields = [
    "filialname",
    "farbe",
    "ort",
    "strasse",
    "plz",
    "land",
    "email",
    "telefon",
    "algorithmid",
    "aktiv",
    "anmerkung"
  ];
  
  const fields = Object.keys(updates).filter(f => allowedFields.includes(f));
  if(fields.length === 0) return null;
  const setClause = fields.map((f,i) => `${f} = $${i+1}`).join(", ");
  const values = fields.map(f => updates[f]);
  values.push(fnr);

  const result = await pool.query(
    `
    update filiale
    set ${setClause}
    where fnr = $${fields.length + 1}
    returning *;
    `,
    values
  );

  return result.rows[0] || null;
}

async function remove(fnr){
  const result = await pool.query(
    `delete from filiale where fnr = $1;`,
    [fnr]
  );
  return result.rowCount > 0;
}


// NEU: für den Softdelet

async function deactivate(fnr){
  const result = await pool.query(
    `UPDATE filiale
    SET aktiv = false
    where fnr = $1
    RETURNING fnr;`,
    [fnr]
  );
  return result.rowCount >0;
}

module.exports = {
  getAll,
  add,
  getById,
  update,
  remove,
  deactivate
};



