// ============================================================================
// dateUtils.js
// ---------------------------------------------------------------------------
// Dieses Modul enthält Hilfsfunktionen zur Datums- und Stundenberechnung
// für die Dienstplan-Generierung.
//
// Ziel dieses Moduls ist es, alle zeitbezogenen Berechnungen zentral
// zu kapseln, damit sie:
// - wiederverwendbar sind
// - leicht testbar bleiben
// - unabhängig von der eigentlichen Dienstplanlogik funktionieren
//
// Verwendet wird durchgehend das ISO-Datumsformat (YYYY-MM-DD),
// um eine konsistente Verarbeitung zwischen Backend, Datenbank
// und Frontend sicherzustellen.
// ============================================================================



// ============================================================================
// getWeekdayDates(year, month)
// ---------------------------------------------------------------------------
// Ermittelt alle Wochentage (Montag bis Freitag) eines Monats.
//
// Diese Funktion wird verwendet, um die Anzahl der Arbeitstage
// eines Monats zu bestimmen, welche wiederum die Grundlage
// für die Berechnung der Sollarbeitszeit bilden.
//
// Parameter:
// - year:  vierstelliges Jahr (z. B. 2026)
// - month: Monat (1–12, nicht 0-basiert)
//
// Rückgabe:
// - Array von Datumsstrings im ISO-Format (YYYY-MM-DD)
// ============================================================================
function getWeekdayDates(year, month) {
  const lastDay = new Date(year, month, 0).getDate(); // letzter Kalendertag des Monats
  const dates = [];

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    const weekday = date.getDay(); // 0 = Sonntag, 1 = Montag, ..., 6 = Samstag

    // Nur Montag bis Freitag gelten als Arbeitstage
    if (weekday >= 1 && weekday <= 5) {
      dates.push(date.toISOString().split("T")[0]);
    }
  }

  return dates;
}



// ============================================================================
// getMonthlyHours(year, month)
// ---------------------------------------------------------------------------
// Berechnet die Sollarbeitsstunden eines Monats.
//
// Grundlage:
// - Alle Arbeitstage (Montag–Freitag)
// - Pro Arbeitstag werden 8 Stunden angenommen
//
// Diese Funktion liefert die Basis für:
// - Zielstunden pro Mitarbeiter
// - spätere Stundenvergleiche (Über-/Unterstunden)
//
// Parameter:
// - year:  vierstelliges Jahr
// - month: Monat (1–12)
//
// Rückgabe:
// - Anzahl der Sollstunden für den Monat (Number)
// ============================================================================
function getMonthlyHours(year, month) {
  const arbeitstage = getWeekdayDates(year, month);
  const stundenProTag = 8;

  return arbeitstage.length * stundenProTag;
}



// ============================================================================
// getAllDatesOfMonth(year, month)
// ---------------------------------------------------------------------------
// Liefert alle Kalendertage eines Monats (inkl. Wochenenden).
//
// Diese Funktion wird für die eigentliche Dienstplan-Generierung
// verwendet, da Dienste auch an Wochenenden geplant werden können.
//
// Parameter:
// - year:  vierstelliges Jahr
// - month: Monat (1–12)
//
// Rückgabe:
// - Array von Datumsstrings im ISO-Format (YYYY-MM-DD)
// ============================================================================
function getAllDatesOfMonth(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  const dates = [];

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    dates.push(date.toISOString().split("T")[0]);
  }

  return dates;
}



// ============================================================================
// EXPORT
// ---------------------------------------------------------------------------
// Die Funktionen werden gezielt exportiert und im Dienstplan-Generator
// sowie in der Stundenberechnung wiederverwendet.
// ============================================================================
module.exports = {
  getMonthlyHours,
  getAllDatesOfMonth,
};