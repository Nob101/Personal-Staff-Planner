const pool = require("../db/pool");

/**
 * ============================================================================
 * Repository: stunden_konto
 * ----------------------------------------------------------------------------
 * Diese Datei kapselt alle Datenbankzugriffe auf die Tabelle "stunden_konto".
 *
 * Aufgabe:
 * - Soll-/Ist-Stunden eines Mitarbeiters pro Monat/Jahr speichern
 * - Stundenkonten laden
 * - Stundenwerte bei Dienständerungen oder manuellen Korrekturen aktualisieren
 *
 * Wichtig:
 * - Funktionen mit Suffix "Tx" erwarten einen bestehenden DB-Client
 *   innerhalb einer Transaktion.
 * - Funktionen ohne "Tx" verwenden direkt den Pool.
 * ============================================================================
 */


/**
 * ============================================================================
 * saveStunden
 * ----------------------------------------------------------------------------
 * Speichert ein Stundenkonto (Soll/Ist/Differenz) für einen Mitarbeiter
 * und einen bestimmten Monat.
 *
 * ON CONFLICT:
 * - Pro Mitarbeiter und Monat darf es nur einen Datensatz geben
 * - Existiert bereits ein Datensatz, wird er aktualisiert (Upsert)
 *
 * Rückgabe:
 * - der neu eingefügte oder aktualisierte Datensatz
 * ============================================================================
 */
async function saveStunden(stunden) {
  const query = `
    INSERT INTO stunden_konto (
      mnr, jahr, monat, soll_stunden_monat, ist_stunden_monat, differenz
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (mnr, jahr, monat)
    DO UPDATE SET
      soll_stunden_monat = EXCLUDED.soll_stunden_monat,
      ist_stunden_monat  = EXCLUDED.ist_stunden_monat,
      differenz          = EXCLUDED.differenz
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


/**
 * ============================================================================
 * deleteStunden
 * ----------------------------------------------------------------------------
 * Löscht Stundenkonten eines Monats/Jahres.
 *
 * Varianten:
 * - ohne fnr: löscht alle Stundenkonten des Monats
 * - mit fnr:  löscht nur Stundenkonten jener Mitarbeiter,
 *             deren Hauptfiliale dieser fnr entspricht
 *
 * Rückgabe:
 * - Anzahl der gelöschten Datensätze
 * ============================================================================
 */
async function deleteStunden(monat, jahr, fnr = null) {
  if (Number.isInteger(fnr) && fnr > 0) {
    const r = await pool.query(
      `
      DELETE FROM stunden_konto
      WHERE jahr = $1
        AND monat = $2
        AND mnr IN (
          SELECT mnr
          FROM mitarbeiter
          WHERE hauptfiliale_fnr = $3
        );
      `,
      [jahr, monat, fnr]
    );
    return r.rowCount;
  }

  const r = await pool.query(
    `
    DELETE FROM stunden_konto
    WHERE jahr = $1
      AND monat = $2;
    `,
    [jahr, monat]
  );

  return r.rowCount;
}


/**
 * ============================================================================
 * getStundenForMitarbeiter
 * ----------------------------------------------------------------------------
 * Liefert alle Stundenkonten eines Mitarbeiters als Historie.
 *
 * Sortierung:
 * - neueste Monate zuerst (jahr DESC, monat DESC)
 * ============================================================================
 */
async function getStundenForMitarbeiter(mnr) {
  const query = `
    SELECT *
    FROM stunden_konto
    WHERE mnr = $1
    ORDER BY jahr DESC, monat DESC;
  `;

  const res = await pool.query(query, [mnr]);
  return res.rows;
}


/**
 * ============================================================================
 * getStundenForMonthYear
 * ----------------------------------------------------------------------------
 * Liefert alle Stundenkonten eines bestimmten Monats/Jahres.
 *
 * Verwendungszweck:
 * - Anzeige im Dienstplan-Frontend
 *
 * Sortierung:
 * - nach mnr ASC, damit das Frontend eine stabile Reihenfolge bekommt
 * ============================================================================
 */
async function getStundenForMonthYear(monat, jahr) {
  const query = `
    SELECT *
    FROM stunden_konto
    WHERE monat = $1
      AND jahr = $2
    ORDER BY mnr ASC;
  `;

  const res = await pool.query(query, [monat, jahr]);
  return res.rows;
}


/**
 * ============================================================================
 * updateIstStundenTx
 * ----------------------------------------------------------------------------
 * Passt die IST-Stunden eines Mitarbeiters um ein Delta an.
 *
 * Beispiel:
 * - F -> A  => +9
 * - A -> F  => -9
 * - E -> K  => -1
 *
 * Gleichzeitig wird die Differenz neu berechnet:
 * differenz = ist_stunden_monat - soll_stunden_monat
 *
 * Warum Tx?
 * - Diese Funktion wird zusammen mit einer Dienständerung ausgeführt
 * - Beides muss atomar gespeichert werden
 * ============================================================================
 */
async function updateIstStundenTx(client, mnr, jahr, monat, delta) {
  const q = `
    UPDATE stunden_konto
    SET ist_stunden_monat = ist_stunden_monat + $4,
        differenz = (ist_stunden_monat + $4) - soll_stunden_monat
    WHERE mnr = $1
      AND jahr = $2
      AND monat = $3
    RETURNING *;
  `;

  const r = await client.query(q, [mnr, jahr, monat, delta]);
  return r.rows[0] ?? null;
}


/**
 * ============================================================================
 * updateIstStundenManuellTx
 * ----------------------------------------------------------------------------
 * Überschreibt die IST-Stunden manuell.
 *
 * Use-Case:
 * - Der Auftraggeber möchte das Stundenkonto bewusst manuell korrigieren
 * - Die Differenz wird dabei direkt neu berechnet
 *
 * Warum Tx?
 * - Die Änderung soll konsistent und transaktional gespeichert werden
 * ============================================================================
 */
async function updateIstStundenManuellTx(client, { mnr, jahr, monat, ist }) {
  const sql = `
    UPDATE stunden_konto
    SET
      ist_stunden_monat = $4::numeric,
      differenz = $4::numeric - soll_stunden_monat
    WHERE mnr = $1
      AND jahr = $2
      AND monat = $3
    RETURNING id, mnr, jahr, monat, soll_stunden_monat, ist_stunden_monat, differenz;
  `;

  const r = await client.query(sql, [mnr, jahr, monat, ist]);
  return r.rows[0] || null;
}


module.exports = {
  saveStunden,
  getStundenForMitarbeiter,
  deleteStunden,
  getStundenForMonthYear,
  updateIstStundenTx,
  updateIstStundenManuellTx,
};