const pool = require("../db/pool");

/**
 * ============================================================================
 * dienstplan.repo.pg.js
 * ----------------------------------------------------------------------------
 * Repository-Schicht für die Tabelle "dienstplaene".
 *
 * Aufgabe der Repository-Schicht:
 * - kapselt alle SQL-Zugriffe (Single Source of Truth für Queries)
 * - trennt Datenzugriff von HTTP-Routen/Business-Logik
 * - ermöglicht Transaktionen (Tx-Funktionen verwenden einen übergebenen client)
 *
 * Namenskonvention:
 * - Funktionen mit Suffix "Tx" erwarten einen bestehenden DB-Client und laufen
 *   innerhalb einer übergeordneten Transaktion (BEGIN/COMMIT/ROLLBACK).
 * ============================================================================
 */

/**
 * Speichert einen einzelnen Dienstplaneintrag.
 * Wird typischerweise vom Generator in einer Schleife aufgerufen.
 *
 * Hinweis:
 * Diese Funktion nutzt direkt den Pool, da sie außerhalb einer Transaktion
 * verwendet wird (Generator speichert am Ende gesammelt).
 */
async function save(jahr, monat, datum, mnr, fnr, schicht_typ) {
  await pool.query(
    `
    INSERT INTO dienstplaene (jahr, monat, datum, mnr, fnr, schicht_typ)
    VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [jahr, monat, datum, mnr, fnr, schicht_typ]
  );
  return true;
}

/**
 * Löscht alle Dienste eines Monats.
 * Wird verwendet, wenn ein Monatsplan neu erzeugt wird oder bei Testläufen.
 *
 * Rückgabe:
 * - rowCount: Anzahl der gelöschten Datensätze (für Logging/Feedback).
 */
async function deleteByMonth(jahr, monat, fnr) {
  if (fnr) {
    const result = await pool.query(
      `
      DELETE FROM dienstplaene
      WHERE jahr = $1
        AND monat = $2
        AND fnr = $3
      `,
      [jahr, monat, fnr]
    );
    return result.rowCount;
  }

  const result = await pool.query(
    `
    DELETE FROM dienstplaene
    WHERE jahr = $1
      AND monat = $2
    `,
    [jahr, monat]
  );

  return result.rowCount;
}

/**
 * Lädt alle Dienste für einen bestimmten Monat.
 *
 * Besonderheit: Datum wird als String "YYYY-MM-DD" zurückgegeben:
 * - Frontend benötigt stabile Schlüssel/Anzeigeformate
 * - verhindert Probleme mit Zeitzonen/ISO-Strings
 *
 * Sortierung:
 * - nach Datum, dann Filiale, dann Mitarbeiter
 * - ergibt eine stabile und nachvollziehbare Reihenfolge in der UI.
 */
async function getByDate(jahr, monat) {
  const result = await pool.query(
    `
    SELECT
      id, jahr, monat,
      to_char(datum, 'YYYY-MM-DD') AS datum,
      mnr, fnr, schicht_typ, anmerkung
    FROM dienstplaene
    WHERE jahr = $1 AND monat = $2
    ORDER BY datum, fnr, mnr
    `,
    [jahr, monat]
  );
  return result.rows;
}

/**
 * Lädt einen einzelnen Dienst innerhalb einer Transaktion.
 *
 * Warum Tx?
 * - wird bei Shift-/Ersatz-Operationen benötigt, wo mehrere Updates gemeinsam
 *   erfolgen müssen (Dienst + Stundenkonto).
 */
async function getByIdTx(client, id) {
  const r = await client.query(
    `
    SELECT id, jahr, monat, datum, mnr, fnr, schicht_typ, anmerkung
    FROM dienstplaene
    WHERE id = $1
    `,
    [id]
  );
  return r.rows[0] ?? null;
}

/**
 * Aktualisiert den Schichttyp eines Dienstes innerhalb einer Transaktion.
 *
 * RETURNING:
 * - liefert den aktualisierten Datensatz direkt zurück
 * - vermeidet einen zusätzlichen SELECT nach dem UPDATE.
 */
async function dienstShiftTx(client, id, schicht_typ, fnr) {

  // Wenn fnr NICHT übergeben wurde → Filiale NICHT ändern
  if (typeof fnr === "undefined") {
    const r = await client.query(
      `
      UPDATE dienstplaene
      SET schicht_typ = $2
      WHERE id = $1
      RETURNING id, jahr, monat, datum, mnr, fnr, schicht_typ, anmerkung;
      `,
      [id, schicht_typ]
    );
    return r.rows[0] ?? null;
  }

  // Wenn fnr mitgegeben wurde → beides ändern (test)
  const r = await client.query(
    `
    UPDATE dienstplaene
    SET schicht_typ = $2,
        fnr = $3
    WHERE id = $1
    RETURNING id, jahr, monat, datum, mnr, fnr, schicht_typ, anmerkung;
    `,
    [id, schicht_typ, fnr]
  );

  return r.rows[0] ?? null;
}

/**
 * Spezial-Update für den Ersatzfall:
 * - Schichttyp wird gesetzt
 * - Arbeitsfiliale (fnr) wird übernommen, da der Ersatzdienst in der Filiale
 *   des ursprünglichen Dienstes stattfindet.
 *
 * Auch hier: RETURNING liefert den fertigen Datensatz zurück.
 */
/* async function dienstShiftMitErsatzTx(client, id, schicht_typ, fnr) {
  const r = await client.query(
    `
    UPDATE dienstplaene
    SET schicht_typ = $2,
        fnr = $3
    WHERE id = $1
    RETURNING id, jahr, monat, datum, mnr, fnr, schicht_typ, anmerkung;
    `,
    [id, schicht_typ, fnr]
  );
  return r.rows[0] ?? null;
} */

/**
 * Liefert mögliche Ersatz-Kandidaten für einen konkreten Dienst.
 *
 * Kriterien:
 * 1) gleicher Tag (d2.datum = d1.datum)
 * 2) Kandidat hat an diesem Tag "F" (frei) -> darf übernommen werden
 * 3) Kandidat ist für die Filiale qualifiziert:
 *    - entweder Hauptfiliale entspricht der Dienst-Filiale
 *    - oder Mitarbeiter ist in der Mapping-Tabelle als Nebenfiliale eingetragen
 *
 * Umsetzung:
 * - d1 = der "ausfallende" Dienst (über dienstId)
 * - d2 = alle Dienste am selben Tag
 * - EXISTS wird verwendet, weil es performanter und semantisch klarer ist
 *   als ein Join auf die Nebenfilialen-Tabelle mit potenziellen Duplikaten.
 */
async function findErsatzKandidatenByDienstId(dienstId) {
  const q = `
    SELECT
      d2.id        AS "dienstId",
      d2.mnr       AS "mnr",
      m.vorname    AS "vorname",
      m.nachname   AS "nachname",
      d2.fnr       AS "dienstFNr",
      f.filialname AS "dienstFilialname",
      m.springer   AS "springer",
      d2.schicht_typ
    FROM dienstplaene d1
    JOIN dienstplaene d2 ON d2.datum = d1.datum
    JOIN mitarbeiter m ON m.mnr = d2.mnr
    JOIN filiale f ON f.fnr = d2.fnr
    WHERE d1.id = $1
      AND m.aktiv = true
      AND (
        m.hauptfiliale_fnr = d1.fnr
        OR EXISTS (
          SELECT 1
          FROM mitarbeiter_arbeitet_in_filiale mn
          WHERE mn.mnr = m.mnr AND mn.fnr = d1.fnr
        )
      )
      AND d2.schicht_typ IN ('F','A','E')
      AND (
        d2.schicht_typ = 'F'
        OR (
          d2.schicht_typ = 'A'
          AND (
            SELECT COUNT(*)
            FROM dienstplaene x
            WHERE x.datum = d2.datum
              AND x.fnr = d2.fnr
              AND x.schicht_typ = 'A'
          ) >= 2
        )
        OR (
          d2.schicht_typ = 'E'
          AND (
            SELECT COUNT(*)
            FROM dienstplaene x
            WHERE x.datum = d2.datum
              AND x.fnr = d2.fnr
              AND x.schicht_typ = 'E'
          ) >= 2
        )
      )
    ORDER BY m.nachname, m.vorname;
  `;

  const r = await pool.query(q, [dienstId]);
  return r.rows;
}

module.exports = {
  save,
  deleteByMonth,
  getByDate,
  dienstShiftTx,
  getByIdTx,
  findErsatzKandidatenByDienstId,
};