// src/utils/dienstplan/date.js

/* ============================================================================
 * Datum-Utilities
 * - normalizeDate: immer YYYY-MM-DD (string)
 * - dow/day: Anzeige im Kalenderheader
 * ========================================================================== */

export function normalizeDate(datum) {
  return String(datum).slice(0, 10);
}

export function dow(datum) {
  const d = new Date(`${normalizeDate(datum)}T00:00:00`);
  return ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()];
}

export function day(datum) {
  const d = new Date(`${normalizeDate(datum)}T00:00:00`);
  return String(d.getDate()).padStart(2, "0");
}
