const pool = require("../db/pool");

// Helper: Ergebniszeile -> DTO fürs Frontend
function mapRowToDto(row) {
  if (!row) return null;

  return {
    mnr: row.mnr,
    vorname: row.vorname,
    nachname: row.nachname,
    hauptfiliale_fnr: row.hauptfiliale_fnr,
    arbeitnehmertyp: row.arbeitnehmertyp,
    springer: row.springer,
    counter: row.counter,
    springeralgorithmid: row.springeralgorithmid,

    kontakt: row.kontakt ?? null,
    telefone: row.telefone ?? [],
    emails: row.emails ?? [],
    nebenfilialen: row.nebenfilialen ?? [],
  };
}

/* 
 * GET ALL (inkl. details)
 */
async function getAllWithDetails() {
  const sql = `
    SELECT
      m.mnr, m.vorname, m.nachname,
      m.hauptfiliale_fnr,
      m.arbeitnehmertyp,
      m.springer,
      m.counter,
      m.springeralgorithmid,

      -- kontakt (0..1)
      (
        SELECT jsonb_build_object(
          'strasse', k.strasse,
          'plz', k.plz,
          'ort', k.ort,
          'land', k.land
        )
        FROM mitarbeiter_kontakt k
        WHERE k.mnr = m.mnr
        LIMIT 1
      ) AS kontakt,

      -- telefone (0..n)
      COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object('telefon_typ', t.telefon_typ, 'nummer', t.nummer)
          ORDER BY t.telefon_typ
        )
        FROM mitarbeiter_telefon t
        WHERE t.mnr = m.mnr
      ), '[]'::jsonb) AS telefone,

      -- emails (0..n)
      COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object('email_typ', e.email_typ, 'email_adresse', e.email_adresse)
          ORDER BY e.email_typ
        )
        FROM mitarbeiter_email e
        WHERE e.mnr = m.mnr
      ), '[]'::jsonb) AS emails,

      -- nebenfilialen (0..n) als Array von fnr
      COALESCE((
        SELECT jsonb_agg(f.fnr ORDER BY f.fnr)
        FROM mitarbeiter_arbeitet_in_filiale f
        WHERE f.mnr = m.mnr
      ), '[]'::jsonb) AS nebenfilialen

    FROM mitarbeiter m
    ORDER BY m.mnr;
  `;

  const result = await pool.query(sql);
  return result.rows.map(mapRowToDto);
}

/**
 * GET BY ID (inkl. details)
 */
async function getByIdWithDetails(mnr) {
  const sql = `
    SELECT
      m.mnr, m.vorname, m.nachname,
      m.hauptfiliale_fnr,
      m.arbeitnehmertyp,
      m.springer,
      m.counter,
      m.springeralgorithmid,

      (
        SELECT jsonb_build_object(
          'strasse', k.strasse,
          'plz', k.plz,
          'ort', k.ort,
          'land', k.land
        )
        FROM mitarbeiter_kontakt k
        WHERE k.mnr = m.mnr
        LIMIT 1
      ) AS kontakt,

      COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object('telefon_typ', t.telefon_typ, 'nummer', t.nummer)
          ORDER BY t.telefon_typ
        )
        FROM mitarbeiter_telefon t
        WHERE t.mnr = m.mnr
      ), '[]'::jsonb) AS telefone,

      COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object('email_typ', e.email_typ, 'email_adresse', e.email_adresse)
          ORDER BY e.email_typ
        )
        FROM mitarbeiter_email e
        WHERE e.mnr = m.mnr
      ), '[]'::jsonb) AS emails,

      COALESCE((
        SELECT jsonb_agg(f.fnr ORDER BY f.fnr)
        FROM mitarbeiter_arbeitet_in_filiale f
        WHERE f.mnr = m.mnr
      ), '[]'::jsonb) AS nebenfilialen

    FROM mitarbeiter m
    WHERE m.mnr = $1;
  `;

  const result = await pool.query(sql, [mnr]);
  return mapRowToDto(result.rows[0] || null);
}

/**
 * ADD (inkl. kontakt/telefon/email/nebenfilialen) – Transaktion
 */
async function addWithDetails(payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) mitarbeiter
    const insertMaSql = `
  INSERT INTO mitarbeiter (
    vorname, nachname,
    hauptfiliale_fnr,
    counter,
    arbeitnehmertyp,
    springeralgorithmid,
    springer
  )
  VALUES ($1,$2,$3,$4,$5,$6,$7)
  RETURNING mnr;
`;

    const insertMaValues = [
      payload.vorname ?? null,
      payload.nachname ?? null,
      payload.hauptfiliale_fnr ?? null,
      null, // counter IMMER null beim Anlegen
      payload.arbeitnehmertyp ?? 40,
      payload.springeralgorithmid ?? null,
      payload.springer ?? false,
    ];

    const maRes = await client.query(insertMaSql, insertMaValues);
    const mnr = maRes.rows[0].mnr;

    // 2) kontakt (optional)
    if (payload.kontakt && typeof payload.kontakt === "object") {
      const k = payload.kontakt;
      await client.query(
        `
        INSERT INTO mitarbeiter_kontakt (mnr, strasse, plz, ort, land)
        VALUES ($1,$2,$3,$4,$5);
        `,
        [mnr, k.strasse ?? null, k.plz ?? null, k.ort ?? null, k.land ?? null]
      );
    }

    // 3) telefone (optional, 0..n)
    if (Array.isArray(payload.telefone)) {
      for (const t of payload.telefone) {
        if (!t) continue;
        const typ = t.telefon_typ ?? t.typ;
        const nummer = t.nummer;
        if (!typ || !nummer) continue;

        await client.query(
          `
          INSERT INTO mitarbeiter_telefon (mnr, telefon_typ, nummer)
          VALUES ($1,$2,$3)
          ON CONFLICT (mnr, telefon_typ)
          DO UPDATE SET nummer = EXCLUDED.nummer;
          `,
          [mnr, String(typ), String(nummer)]
        );
      }
    }

    // 4) emails (optional, 0..n)
    if (Array.isArray(payload.emails)) {
      for (const e of payload.emails) {
        if (!e) continue;
        const typ = e.email_typ ?? e.typ;
        const adr = e.email_adresse ?? e.adresse;
        if (!typ || !adr) continue;

        await client.query(
          `
          INSERT INTO mitarbeiter_email (mnr, email_typ, email_adresse)
          VALUES ($1,$2,$3)
          ON CONFLICT (mnr, email_typ)
          DO UPDATE SET email_adresse = EXCLUDED.email_adresse;
          `,
          [mnr, String(typ), String(adr)]
        );
      }
    }

    // 5) nebenfilialen (optional, 0..n) -> mapping table
    if (Array.isArray(payload.nebenfilialen)) {
      const neben = payload.nebenfilialen
        .map(Number)
        .filter((x) => Number.isFinite(x));

      for (const fnr of neben) {
        await client.query(
          `
          INSERT INTO mitarbeiter_arbeitet_in_filiale (mnr, fnr)
          VALUES ($1,$2)
          ON CONFLICT DO NOTHING;
          `,
          [mnr, fnr]
        );
      }
    }

    await client.query("COMMIT");

    // fertiges Objekt zurückgeben
    const created = await getByIdWithDetails(mnr);
    return created;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

async function updateWithDetails(mnr, updates) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) BASE mitarbeiter
    const allowed = [
      "vorname",
      "nachname",
      "hauptfiliale_fnr",
      "arbeitnehmertyp",
      "springer",
      "counter",
      "springeralgorithmid",
    ];

    const baseFields = Object.keys(updates).filter((f) => allowed.includes(f));
    if (baseFields.length > 0) {
      const setClause = baseFields.map((f, i) => `${f} = $${i + 1}`).join(", ");
      const values = baseFields.map((f) => updates[f]);
      values.push(mnr);

      const r = await client.query(
        `UPDATE mitarbeiter SET ${setClause} WHERE mnr = $${
          baseFields.length + 1
        } RETURNING mnr;`,
        values
      );
      if (r.rowCount === 0) {
        await client.query("ROLLBACK");
        return null; // nicht gefunden
      }
    } else {
      // check ob MA existiert, sonst würdest du "Details" updaten für niemanden
      const exists = await client.query(
        `SELECT 1 FROM mitarbeiter WHERE mnr=$1`,
        [mnr]
      );
      if (exists.rowCount === 0) {
        await client.query("ROLLBACK");
        return null;
      }
    }

    // 2) kontakt (0..1)
    if (updates.kontakt && typeof updates.kontakt === "object") {
      const k = updates.kontakt;

      // Variante A: replace (kein unique nötig)
      await client.query(`DELETE FROM mitarbeiter_kontakt WHERE mnr=$1`, [mnr]);
      await client.query(
        `INSERT INTO mitarbeiter_kontakt (mnr, strasse, plz, ort, land)
         VALUES ($1,$2,$3,$4,$5)`,
        [mnr, k.strasse ?? null, k.plz ?? null, k.ort ?? null, k.land ?? null]
      );
    }

    // 3) telefone (ersetzen)
    if (Array.isArray(updates.telefone)) {
      await client.query(`DELETE FROM mitarbeiter_telefon WHERE mnr=$1`, [mnr]);
      for (const t of updates.telefone) {
        if (!t) continue;
        const typ = t.telefon_typ ?? t.typ;
        const nummer = t.nummer;
        if (!typ || !nummer) continue;

        await client.query(
          `INSERT INTO mitarbeiter_telefon (mnr, telefon_typ, nummer)
           VALUES ($1,$2,$3)`,
          [mnr, String(typ), String(nummer)]
        );
      }
    }

    // 4) emails (ersetzen)
    if (Array.isArray(updates.emails)) {
      await client.query(`DELETE FROM mitarbeiter_email WHERE mnr=$1`, [mnr]);
      for (const e of updates.emails) {
        if (!e) continue;
        const typ = e.email_typ ?? e.typ;
        const adr = e.email_adresse ?? e.adresse;
        if (!typ || !adr) continue;

        await client.query(
          `INSERT INTO mitarbeiter_email (mnr, email_typ, email_adresse)
           VALUES ($1,$2,$3)`,
          [mnr, String(typ), String(adr)]
        );
      }
    }

    // 5) nebenfilialen (mapping ersetzen)
    if (Array.isArray(updates.nebenfilialen)) {
      await client.query(
        `DELETE FROM mitarbeiter_arbeitet_in_filiale WHERE mnr=$1`,
        [mnr]
      );

      const neben = updates.nebenfilialen
        .map(Number)
        .filter(
          (x) => Number.isInteger(x) && x !== (updates.hauptfiliale_fnr ?? null)
        );

      for (const fnr of neben) {
        await client.query(
          `INSERT INTO mitarbeiter_arbeitet_in_filiale (mnr, fnr)
           VALUES ($1,$2)
           ON CONFLICT DO NOTHING;`,
          [mnr, fnr]
        );
      }
    }

    await client.query("COMMIT");

    // fertiges Objekt zurück
    return await getByIdWithDetails(mnr);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

//-------------------------------
async function remove(mnr) {
  const result = await pool.query(`DELETE FROM mitarbeiter WHERE mnr = $1;`, [
    mnr,
  ]);
  return result.rowCount > 0;
}

async function updateCounter(mnr, counter) {
  await pool.query(
    `UPDATE mitarbeiter SET counter = $1 WHERE mnr = $2;`,
    [counter, mnr]
  );
  return true;
}

async function getAllBase() {
  const r = await pool.query(`
    SELECT mnr, hauptfiliale_fnr, counter
    FROM mitarbeiter
  `);
  return r.rows;
}

async function updateCounter(mnr, counter) {
  await pool.query(
    `UPDATE mitarbeiter SET counter = $1 WHERE mnr = $2;`,
    [counter, mnr]
  );
  return true;
}



module.exports = {
  getAllWithDetails,
  getByIdWithDetails,
  addWithDetails,
  updateWithDetails,
  remove,
  updateCounter,
  getAllBase,
  updateCounter,
};

/* 
Tabelle: mitarbeiter
---------------------------------------------
id                  SERIAL PRIMARY KEY
vorname             TEXT
nachname            TEXT
geburtsdatum        DATE
strasse             TEXT
plz                 TEXT
ort                 TEXT
land                TEXT
telefon1            TEXT
telefon2            TEXT
email1              TEXT
email2              TEXT
stammfiliale        TEXT
nebenfilialen       JSON
arbeitnehmertyp     INTEGER
counter             INTEGER
springer            BOOLEAN
springeralgorithmid INTEGER
anmerkung           TEXT
hauptfilialeid      INTEGER


const pool = require('../db/pool');

// erlaubte Felder für UPDATE
const ALLOWED_FIELDS = [
  'vorname','nachname','geburtsdatum',
  'strasse','plz','ort','land',
  'telefon1','telefon2',
  'email1','email2',
  'stammfiliale','nebenfilialen',
  'arbeitnehmertyp','counter',
  'springer','springeralgorithmid',
  'anmerkung','hauptfilialeid'
];

// -------------------------------------------------------------
// GET ALL
// -------------------------------------------------------------
async function getAll() {
  const result = await pool.query(`SELECT * FROM mitarbeiter ORDER BY id;`);
  return result.rows;
}

// -------------------------------------------------------------
// GET BY ID
// -------------------------------------------------------------
async function getById(id) {
  const result = await pool.query(`SELECT * FROM mitarbeiter WHERE id = $1;`, [id]);
  return result.rows[0] || null;
}

// -------------------------------------------------------------
// ADD
// -------------------------------------------------------------
async function add(m) {

  const query = `
    INSERT INTO mitarbeiter (
      vorname, nachname, geburtsdatum,
      strasse, plz, ort, land,
      telefon1, telefon2, email1, email2,
      stammfiliale, nebenfilialen,
      arbeitnehmertyp, counter,
      springer, springeralgorithmid,
      anmerkung,
      hauptfilialeid
    )
    VALUES (
      $1,$2,$3,$4,$5,$6,$7,
      $8,$9,$10,$11,
      $12,$13::json,
      $14,$15,$16,$17,$18,
      $19
    )
    RETURNING *;
  `;

  const values = [
    m.vorname ?? null,
    m.nachname ?? null,
    m.geburtsdatum ?? null,
    m.strasse ?? null,
    m.plz ?? null,
    m.ort ?? null,
    m.land ?? null,
    m.telefon1 ?? null,
    m.telefon2 ?? null,
    m.email1 ?? null,
    m.email2 ?? null,
    m.stammfiliale ?? null,
    JSON.stringify(m.nebenfilialen ?? []),
    m.arbeitnehmertyp ?? m.arbeitnehmerTyp ?? 40,
    m.counter ?? null,
    m.springer ?? false,
    m.springeralgorithmid ?? m.springerAlgorithmId ?? null,
    m.anmerkung ?? null,
    m.hauptfilialeid ?? null
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

// -------------------------------------------------------------
// UPDATE
// -------------------------------------------------------------
async function update(id, updates) {

  const fields = Object.keys(updates).filter(f => ALLOWED_FIELDS.includes(f));

  if (fields.length === 0) return null;

  const setClause = fields
    .map((f, i) => `${f} = $${i + 1}`)
    .join(', ');

  const values = fields.map(f =>
    f === 'nebenfilialen'
      ? JSON.stringify(updates[f] || [])
      : updates[f]
  );

  values.push(id);

  const result = await pool.query(
    `UPDATE mitarbeiter SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *;`, 
    values
  );

  return result.rows[0] || null;
}

// -------------------------------------------------------------
// DELETE
// -------------------------------------------------------------
async function remove(id) {
  const result = await pool.query(`DELETE FROM mitarbeiter WHERE id = $1;`, [id]);
  return result.rowCount > 0;
}

// -------------------------------------------------------------
// Counter Update
// -------------------------------------------------------------
async function updateCounter(id, counter) {
  await pool.query(
    `UPDATE mitarbeiter SET counter = $1 WHERE id = $2;`,
    [counter, id]
  );
  return true;
}

module.exports = {
  getAll,
  getById,
  add,
  update,
  remove,
  updateCounter
};
 */
