const pool = require("../db/pool");

/**
 * ============================================================================
 * mapRowToDto
 * ----------------------------------------------------------------------------
 * Vereinheitlicht die Rückgabeform des Repositories.
 *
 * Zweck:
 * - Das Repository liefert immer ein konsistentes DTO (Data Transfer Object),
 *   unabhängig davon, ob einzelne Sub-Queries NULL/leer zurückgeben.
 * - Dadurch bleibt die API stabil (Frontend muss weniger Sonderfälle behandeln).
 * ============================================================================
 */
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
    aktiv: row.aktiv,

    // Detaildaten sind in der DB ausgelagert (Normalisierung)
    kontakt: row.kontakt ?? null,          // 0..1
    telefone: row.telefone ?? [],          // 0..n
    emails: row.emails ?? [],              // 0..n
    nebenfilialen: row.nebenfilialen ?? [],// 0..n (mapping table)
  };
}

/**
 * ============================================================================
 * GET ALL (inkl. Details)
 * ----------------------------------------------------------------------------
 * Liefert alle Mitarbeiter inkl. Kontakt/Telefon/E-Mail/Nebenfilialen.
 *
 * Umsetzung:
 * - Haupttabelle "mitarbeiter" als Basis
 * - Details werden über Subselects in JSONB zusammengebaut:
 *   - kontakt: jsonb_build_object(...)
 *   - telefone/emails/nebenfilialen: jsonb_agg(...)
 *
 * Vorteile:
 * - Ein DB-Call statt viele einzelne Queries pro Mitarbeiter (N+1 Problem)
 * - API liefert direkt strukturierte Daten, die gut zum Mapper passen
 * ============================================================================
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
      m.aktiv,

      -- kontakt (0..1): als JSON Objekt
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

      -- telefone (0..n): als JSON Array, leeres Array statt NULL
      COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object('telefon_typ', t.telefon_typ, 'nummer', t.nummer)
          ORDER BY t.telefon_typ
        )
        FROM mitarbeiter_telefon t
        WHERE t.mnr = m.mnr
      ), '[]'::jsonb) AS telefone,

      -- emails (0..n): als JSON Array, leeres Array statt NULL
      COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object('email_typ', e.email_typ, 'email_adresse', e.email_adresse)
          ORDER BY e.email_typ
        )
        FROM mitarbeiter_email e
        WHERE e.mnr = m.mnr
      ), '[]'::jsonb) AS emails,

      -- nebenfilialen (0..n): nur fnr als Array
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
 * ============================================================================
 * GET BY ID (inkl. Details)
 * ----------------------------------------------------------------------------
 * Wie getAllWithDetails(), aber gefiltert nach mnr.
 *
 * Vorteil:
 * - Ein einzelner DB-Call liefert das vollständige Objekt
 * ============================================================================
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
      m.aktiv,

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
 * ============================================================================
 * ADD WITH DETAILS (Transaktion)
 * ----------------------------------------------------------------------------
 * Legt einen Mitarbeiter inkl. Detailtabellen an:
 * - mitarbeiter
 * - mitarbeiter_kontakt (optional)
 * - mitarbeiter_telefon (optional)
 * - mitarbeiter_email (optional)
 * - mitarbeiter_arbeitet_in_filiale (optional)
 *
 * Warum Transaktion?
 * - Entweder ALLE Datensätze werden angelegt oder KEINER.
 * - Verhindert inkonsistente Zustände (z.B. Mitarbeiter ohne Kontakt, aber mit Telefon)
 *
 * Besonderheit: counter wird beim Anlegen bewusst auf NULL gesetzt.
 * - Danach wird er über die Counter-Logik gleichmäßig verteilt.
 * ============================================================================
 */
async function addWithDetails(payload) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // 1) Basisdatensatz in "mitarbeiter"
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
      null, // counter IMMER null beim Anlegen (wird später sauber verteilt)
      payload.arbeitnehmertyp ?? 40,
      payload.springeralgorithmid ?? null,
      payload.springer ?? false,
    ];

    const maRes = await client.query(insertMaSql, insertMaValues);
    const mnr = maRes.rows[0].mnr;

    // 2) Kontakt (0..1)
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

    // 3) Telefone (0..n)
    // ON CONFLICT: erlaubt idempotentes Speichern (Typ "mobil/fix" pro Mitarbeiter eindeutig)
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

    // 4) E-Mails (0..n)
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

    // 5) Nebenfilialen (0..n) - Mapping-Tabelle
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

    // Einheitliche Rückgabe: frisch aus DB inkl. Details laden
    const created = await getByIdWithDetails(mnr);
    return created;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * ============================================================================
 * UPDATE WITH DETAILS (Transaktion)
 * ----------------------------------------------------------------------------
 * Aktualisiert einen Mitarbeiter inkl. Detailtabellen.
 *
 * Strategie:
 * - Base-Fields (mitarbeiter) werden dynamisch upgedatet (nur erlaubte Felder)
 * - Detailtabellen werden bei Bedarf "replace"-artig ersetzt:
 *   - kontakt: DELETE + INSERT (0..1)
 *   - telefone: DELETE + INSERT (0..n)
 *   - emails:   DELETE + INSERT (0..n)
 *   - nebenfilialen: DELETE + INSERT (0..n)
 *
 * Warum "replace" statt diff?
 * - Weniger Fehlerquellen, klarer Ablauf, gut nachvollziehbar.
 * - Bei kleinen Datenmengen (max. wenige Telefone/Mails) performance-unproblematisch.
 *
 * Ehrlich: Replace ist nicht die effizienteste Variante,
 * aber für ein Diplomprojekt sauber und robust.
 * ============================================================================
 */
async function updateWithDetails(mnr, updates) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Schutz: ungültige hauptfiliale_fnr nicht übernehmen
    if (
      !("hauptfiliale_fnr" in updates) ||
      updates.hauptfiliale_fnr === null ||
      updates.hauptfiliale_fnr === undefined ||
      Number(updates.hauptfiliale_fnr) <= 0
    ) {
      delete updates.hauptfiliale_fnr;
    }

    // 1) Base-Update in "mitarbeiter" (nur whitelist Felder)
    const allowed = [
      "vorname",
      "nachname",
      "hauptfiliale_fnr",
      "arbeitnehmertyp",
      "springer",
      "counter",
      "springeralgorithmid",
      "aktiv"
    ];

    const baseFields = Object.keys(updates).filter((f) => allowed.includes(f));
    if (baseFields.length > 0) {
      const setClause = baseFields.map((f, i) => `${f} = $${i + 1}`).join(", ");
      const values = baseFields.map((f) => updates[f]);
      values.push(mnr);

      const r = await client.query(
        `UPDATE mitarbeiter SET ${setClause} WHERE mnr = $${baseFields.length + 1} RETURNING mnr;`,
        values
      );

      if (r.rowCount === 0) {
        await client.query("ROLLBACK");
        return null; // Mitarbeiter existiert nicht
      }
    } else {
      // Wenn keine Base-Felder gesendet wurden: trotzdem Existenz prüfen,
      // sonst würden wir "Details" updaten, obwohl es den MA nicht gibt.
      const exists = await client.query(`SELECT 1 FROM mitarbeiter WHERE mnr=$1`, [mnr]);
      if (exists.rowCount === 0) {
        await client.query("ROLLBACK");
        return null;
      }
    }

    // 2) Kontakt (0..1) - replace
    if (updates.kontakt && typeof updates.kontakt === "object") {
      const k = updates.kontakt;
      await client.query(`DELETE FROM mitarbeiter_kontakt WHERE mnr=$1`, [mnr]);
      await client.query(
        `INSERT INTO mitarbeiter_kontakt (mnr, strasse, plz, ort, land)
         VALUES ($1,$2,$3,$4,$5)`,
        [mnr, k.strasse ?? null, k.plz ?? null, k.ort ?? null, k.land ?? null]
      );
    }

    // 3) Telefone (0..n) - replace
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

    // 4) Emails (0..n) - replace
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

    // 5) Nebenfilialen (0..n) - mapping replace
    if (Array.isArray(updates.nebenfilialen)) {
      await client.query(`DELETE FROM mitarbeiter_arbeitet_in_filiale WHERE mnr=$1`, [mnr]);

      // Filter:
      // - nur Integer
      // - nicht gleich Hauptfiliale (reduziert Doppeleinträge / semantische Fehler)
      const neben = updates.nebenfilialen
        .map(Number)
        .filter((x) => Number.isInteger(x) && x !== (updates.hauptfiliale_fnr ?? null));

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

    // Einheitliche Rückgabe: kompletter Datensatz inkl. Details
    return await getByIdWithDetails(mnr);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * ============================================================================
 * REMOVE
 * ----------------------------------------------------------------------------
 * Löscht einen Mitarbeiter.
 * Detailtabellen sollten über Foreign Keys (ON DELETE CASCADE) mit gelöscht werden.
 * ============================================================================
 */
async function remove(mnr) {
  const result = await pool.query(`DELETE FROM mitarbeiter WHERE mnr = $1;`, [mnr]);
  return result.rowCount > 0;
}

/**
 * ============================================================================
 * UPDATE COUNTER
 * ----------------------------------------------------------------------------
 * Speichert den aktuellen Startpunkt des Mitarbeiters im Algorithmus.
 * Diese Information wird vom Dienstplan-Generator verwendet,
 * damit die Rotation über Monate hinweg fortgesetzt wird.
 * ============================================================================
 */
async function updateCounter(mnr, counter) {
  await pool.query(`UPDATE mitarbeiter SET counter = $1 WHERE mnr = $2;`, [counter, mnr]);
  return true;
}

/**
 * ============================================================================
 * GET ALL BASE
 * ----------------------------------------------------------------------------
 * Minimale Mitarbeiterversion für den Dienstplan-Generator.
 *
 * Zweck:
 * - Generator benötigt keine Kontakt/Telefon/E-Mail Daten
 * - Weniger Daten = schnellere Queries
 * ============================================================================
 */
async function getAllBase({ onlyActive = false } = {}) {
  const where = onlyActive ? `WHERE aktiv = true` : ``;

  const r = await pool.query(`
    SELECT mnr, vorname, nachname, hauptfiliale_fnr,
           counter, springer, springeralgorithmid, arbeitnehmertyp,
           aktiv
    FROM mitarbeiter
    ${where}
  `);

  return r.rows;
}


async function deactivate(mnr) {
  const r = await pool.query(
    `UPDATE mitarbeiter
     SET aktiv = false
     WHERE mnr = $1
     RETURNING mnr;`,
    [mnr]
  );
  return r.rowCount > 0;
}


// für Anzeige im Frontend: aktive MA + MA mit Diensten im Monat
async function getForDienstplanMonat(jahr, monat) {
  const sql = `
    SELECT DISTINCT m.mnr, m.vorname, m.nachname, m.hauptfiliale_fnr,
           m.counter, m.springer, m.springeralgorithmid, m.arbeitnehmertyp,
           m.aktiv
    FROM mitarbeiter m
    LEFT JOIN dienstplaene d
      ON d.mnr = m.mnr
     AND d.jahr = $1
     AND d.monat = $2
    WHERE m.aktiv = true
       OR d.mnr IS NOT NULL
    ORDER BY m.mnr;
  `;
  const r = await pool.query(sql, [jahr, monat]);
  return r.rows;
}



module.exports = {
  getAllWithDetails,
  getByIdWithDetails,
  addWithDetails,
  updateWithDetails,
  remove,
  updateCounter,
  getAllBase,
  deactivate,
  getForDienstplanMonat,
};