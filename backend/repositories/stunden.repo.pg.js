const pool = require("../db/pool");

/**
 * stunden.repo.pg.js
 * ---------------------------------------------------------------------------
 * Datenzugriffsschicht (Repository) für die Tabelle stunden_konto.
 *
 * Aufgabe des Repositories:
 * - Kapselt SQL-Statements an einer Stelle (Separation of Concerns)
 * - Liefert/aktualisiert Stundenkonten für Mitarbeiter pro Monat/Jahr
 * - Wird vom Dienstplan-Generator und von Routen (z.B. Shift / Stunden-Edit) verwendet
 *
 * Wichtig:
 * - Funktionen mit Suffix "Tx" erwarten einen DB-Client innerhalb einer Transaktion.
 * - Funktionen ohne "Tx" verwenden den Pool direkt (eigene Einzel-Queries).
 */


/**
 * Speichert ein Stundenkonto (Soll/Ist/Differenz) für einen Mitarbeiter und Monat.
 *
 * ON CONFLICT (mnr, jahr, monat):
 * - stellt sicher, dass es pro Mitarbeiter/Monat genau einen Datensatz gibt
 * - wenn es den Datensatz schon gibt, wird er aktualisiert (Upsert)
 */

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


/**
 * Liefert alle Stundenkonten eines Mitarbeiters (Historie).
 * Sortierung absteigend, damit neueste Monate zuerst kommen.
 */
async function getStundenForMitarbeiter(mnr) {
  const query = `
    SELECT * FROM stunden_konto
    WHERE mnr = $1
    ORDER BY jahr DESC, monat DESC;
  `;

  const res = await pool.query(query, [mnr]);
  return res.rows;
}


/**
 * Löscht alle Stundenkonten eines Monats/Jahres.
 *
 * Verwendungszweck:
 * - Beim Neu-Generieren eines Dienstplans werden die Stundenkonten
 *   für diesen Monat zuvor entfernt, damit keine alten Werte bleiben.
 */
async function deleteStunden(monat, jahr) {
  const query = `
    DELETE FROM stunden_konto
    WHERE monat = $1
    AND jahr = $2;
  `;
  await pool.query(query, [monat, jahr]);
}


/**
 * Liefert alle Stundenkonten eines Monats/Jahres (für die Dienstplan-Ansicht).
 * Sortierung nach mnr, damit das Frontend eine stabile Reihenfolge hat.
 */
async function getStundenForMonthYear(monat, jahr) {
  const query = `
    SELECT * FROM stunden_konto
    WHERE monat = $1 AND jahr = $2
    ORDER BY mnr ASC;
  `;

  const res = await pool.query(query, [monat, jahr]);
  return res.rows;
}


/**
 * Transaktionsfunktion:
 * Passt die IST-Stunden um ein Delta an (z.B. wenn ein Dienst manuell geändert wird).
 *
 * Beispiel:
 * - Shift von F -> A  => delta = +9
 * - Shift von A -> F  => delta = -9
 *
 * Die differenz wird dabei sofort konsistent neu berechnet:
 * differenz = ist_stunden_monat - soll_stunden_monat
 *
 * Warum Tx?
 * - Wird zusammen mit dem Update eines Dienstes ausgeführt
 * - Beides muss gemeinsam committen oder gemeinsam rollbacken (atomar)
 */
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


/**
 * Transaktionsfunktion:
 * Manuelles Überschreiben der IST-Stunden (z.B. wenn der Auftraggeber korrigiert).
 *
 * Use-Case:
 * - Ist-Stunden sollen per UI gesetzt werden, wegen komischer Regelungen
 *
 * Dabei wird differenz ebenfalls neu berechnet.
 */
async function updateIstStundenManuellTx(client, { mnr, jahr, monat, ist }) {
  const sql = `
    UPDATE stunden_konto
    SET
      ist_stunden_monat = $4::numeric,
      differenz = $4::numeric - soll_stunden_monat
    WHERE mnr = $1 AND jahr = $2 AND monat = $3
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
