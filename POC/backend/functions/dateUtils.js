// ============================================================================
// 🗓 dateUtils.js
// ---------------------------------------------------------------------------
// Dieses Modul enthält Hilfsfunktionen zur Datums- und Zeitberechnung
// für die Dienstplan-Generierung. Es berechnet Arbeitstage, Monatsstunden
// und alle Kalendertage eines Monats.
// ============================================================================


// ============================================================================
// 🔹 getWeekdayDates(year, month)
// ---------------------------------------------------------------------------
// Gibt alle Wochentage (Mo–Fr) eines Monats zurück.
// - year:  z. B. 2025
// - month: 1–12 (nicht 0-basiert)
// Rückgabe: { dates: [ '2025-05-01', ... ], lastDay: 31 }
// ============================================================================
function getWeekdayDates(year, month) {
  const lastDay = new Date(year, month, 0).getDate(); // letzter Tag des Monats
  const dates = [];

  for (let d = 1; d <= lastDay; d++) {
    const date = new Date(year, month - 1, d);
    const weekday = date.getDay(); // 0 = So, 1 = Mo, ... 6 = Sa

    // nur Montag–Freitag
    if (weekday >= 1 && weekday <= 5) {
      dates.push(date.toISOString().split('T')[0]); // ISO-Datum (YYYY-MM-DD)
    }
  }

  return { dates, lastDay };
}


// ============================================================================
// 🔹 getMonthlyHours(year, month)
// ---------------------------------------------------------------------------
// Berechnet die Sollstunden eines Monats anhand der Arbeitstage (Mo–Fr).
// - Jede Arbeitstag = 8 Stunden
// Rückgabe: { monatsstunden, lastDay }
// ============================================================================
function getMonthlyHours(year, month) {
  const { dates, lastDay } = getWeekdayDates(year, month);
  const stundenProTag = 8;
  const monatsstunden = dates.length * stundenProTag;
  return { monatsstunden, lastDay };
}


// ============================================================================
// 🔹 getAllDatesOfMonth(year, month)
// ---------------------------------------------------------------------------
// Gibt ALLE Kalendertage (1–Monatsende) als ISO-String zurück.
// Wird für die vollständige Planerstellung (auch Wochenenden) verwendet.
// ============================================================================
function getAllDatesOfMonth(year, month) {
  const lastDay = new Date(year, month, 0).getDate(); // letzter Tag des Monats
  const dates = [];

  // Schleife startet bei 2 und endet bei lastDay+1 
  for (let d = 2; d <= lastDay + 1; d++) {
    const date = new Date(year, month - 1, d);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
}


// ============================================================================
// EXPORT
// ============================================================================
module.exports = { getMonthlyHours, getAllDatesOfMonth };
