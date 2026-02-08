/**
 * Datum-Helfer (fixe ISO-YYYY-MM-DD Strings erwartet)
 */
export function dow(datum) {
  const d = new Date(`${datum}T00:00:00`);
  return ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"][d.getDay()];
}

export function day(datum) {
  const d = new Date(`${datum}T00:00:00`);
  return String(d.getDate()).padStart(2, "0");
}
