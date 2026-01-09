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
    insert into filiale (filialname, farbe, ort, strasse, plz, land, email, telefon, algorithmid)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    returning *;
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
      f.algorithmid
    ]
  );

  return result.rows[0];  
}


async function getAll(){
  const result = await pool.query(
    `select * from filiale order by fnr;`
  );
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
    "filialname", "farbe", "ort", "strasse", "plz",
    "land", "email", "telefon", "algorithmid"
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

module.exports = {
  getAll,
  add,
  getById,
  update,
  remove
};



