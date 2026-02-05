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
 * (z. B. beim Hinzufügen oder Löschen eines Mitarbeiters).
 *
 * Durch das Zurücksetzen auf NULL kann der Counter anschließend
 * durch setCounterForMitarbeiter neu und gleichmäßig verteilt werden.
 * Dadurch werden Überschneidungen und unfaire Startpositionen vermieden.
 */


async function resetCountersForFiliale(filialeId) {
  // Sicherheitsprüfung: ohne Filial-ID keine Aktion
  if (!filialeId) return;

  // Alle Mitarbeiter dieser Filiale verlieren ihren aktuellen Startpunkt
  // im Schicht-Pattern (Rotation beginnt neu)
  await pool.query(
    'UPDATE mitarbeiter SET counter = NULL WHERE hauptfiliale_fnr = $1AND aktiv = true',
  );
}

module.exports = { resetCountersForFiliale };