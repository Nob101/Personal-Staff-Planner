const pool = require("../db/pool");

async function saveStunden(stunden) {
  const query = `
    INSERT INTO stunden_konto (mnr,jahr,monat,soll_stunden_monat,ist_stunden_monat,differenz)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (mnr, jahr, monat)
    DO UPDATE SET soll_stunden_monat = EXCLUDED.soll_stunden_monat,
                  ist_stunden_monat = EXCLUDED.ist_stunden_monat
    RETURNING *;
  `;

  const values = [
    stunden.mnr,
    stunden.jahr,
    stunden.monat,
    stunden.soll_stunden_monat,
    stunden.ist_stunden_monat,
    stunden.differenz,
  ];

  const res = await pool.query(query, values);
  return res.rows[0];
}

async function getStundenForMitarbeiter(mnr) {
  const query = `
    SELECT * FROM stunden_konto
    WHERE mnr = $1
    ORDER BY jahr DESC, monat DESC;
  `;

  const res = await pool.query(query, [mnr]);
  return res.rows;
}

async function deleteStunden(monat, jahr) {
  const query = `
    DELETE FROM stunden_konto
    WHERE monat = $1
    AND jahr = $2;
  `;
  await pool.query(query, [monat, jahr]);
}

async function getStundenForMonthYear(monat, jahr) {
  const query = `
    SELECT * FROM stunden_konto
    WHERE monat = $1 AND jahr = $2
    ORDER BY mnr ASC;
  `;

  const res = await pool.query(query, [monat, jahr]);
  return res.rows;
}



async function updateIstStundenTx(client, mnr, jahr, monat, delta) {
  const q = `
    UPDATE stunden_konto
    SET ist_stunden_monat = ist_stunden_monat + $4,
        differenz = (ist_stunden_monat + $4) - soll_stunden_monat
    WHERE mnr = $1 AND jahr = $2 AND monat = $3
    RETURNING *;
  `;
  const r = await client.query(q, [mnr, jahr, monat, delta]);
  return r.rows[0] ?? null;
}


module.exports = {
  saveStunden,
  getStundenForMitarbeiter,
  deleteStunden,
  getStundenForMonthYear,
  updateIstStundenTx,
};
