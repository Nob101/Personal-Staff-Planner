// services/savePlan.js
const dienstplanRepo = require("../repositories/dienstplan.repo.pg");

/**
 * ============================================================================
 * savePlan(jahr, monat, dienste)
 * ----------------------------------------------------------------------------
 * Diese Funktion speichert einen bereits berechneten Dienstplan
 * dauerhaft in der Datenbank.
 *
 * Wichtig:
 * - Die eigentliche Dienstplan-Logik (Generator, Kürzungen, Ersatz usw.)
 *   ist zu diesem Zeitpunkt bereits abgeschlossen.
 * - Diese Funktion übernimmt ausschließlich die Persistierung.
 *
 * Parameter:
 * - jahr   : Jahr des Dienstplans (z.B. 2026)
 * - monat  : Monat des Dienstplans (1–12)
 * - dienste: Array von Dienst-Einträgen, die gespeichert werden sollen
 *
 * Ein Dienst-Eintrag enthält typischerweise:
 * - datum       : konkreter Kalendertag
 * - mnr         : Mitarbeiter-Nummer
 * - fnr         : Filial-Nummer
 * - schicht_typ : A / E / F / K / U
 *
 * Design-Entscheidung:
 * Die Speicherung erfolgt bewusst sequenziell (for...of),
 * da jeder Eintrag unabhängig ist und Fehler leichter
 * nachvollzogen werden können als bei komplexen Bulk-Statements.
 * ============================================================================
 */
async function savePlan(jahr, monat, dienste) {
  
  if (!Array.isArray(dienste) || dienste.length === 0) {
    return;
  }

  for (const d of dienste) {
    await dienstplanRepo.save(
      jahr,
      monat,
      d.datum,
      d.mnr,
      d.fnr,
      d.schicht_typ,
    );
  }
}

// Export der Funktion für den Einsatz im Dienstplan-Generator
module.exports = { savePlan };
