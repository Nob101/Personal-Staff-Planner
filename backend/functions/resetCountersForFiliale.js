const pool = require('../db/pool');

/**
 * Setzt die Counter aller Mitarbeiter einer bestimmten Filiale auf NULL.
 *
 * Zweck:
 * Der Counter bestimmt, an welcher Stelle im Schicht-Algorithmus
 * ein Mitarbeiter beim Generieren des Dienstplans startet.
 *
 * Diese Funktion wird von der Mitarbeiter-Route aufgerufen,
 * wenn sich die Mitarbeiterstruktur einer Filiale ändert
 * (z. B. beim Hinzufügen oder Deaktivieren eines Mitarbeiters).
 *
 * Durch das Zurücksetzen auf NULL kann der Counter anschließend
 * durch setCounterForMitarbeiter neu und gleichmäßig verteilt werden.
 * Dadurch werden Überschneidungen und unfaire Startpositionen vermieden.
 */

async function resetCountersForFiliale(filialeId) {

  // Sicherheitsprüfung: nur gültige Filial-ID zulassen
  if (!Number.isInteger(Number(filialeId)) || Number(filialeId) <= 0) {
    return;
  }

  // Alle aktiven Mitarbeiter dieser Filiale verlieren ihren aktuellen
  // Startpunkt im Schicht-Algorithmus
  await pool.query(
    `UPDATE mitarbeiter
     SET counter = NULL
     WHERE hauptfiliale_fnr = $1
       AND aktiv = true`,
    [filialeId]
  );
}

module.exports = { resetCountersForFiliale };