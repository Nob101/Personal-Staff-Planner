/**
 * Farb-Helfer für Dienstplan Grid
 */
export function hexToRgba(hex, alpha = 1) {
  const h = String(hex || "").trim().replace("#", "");
  const full = h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) return `rgba(0,0,0,${alpha})`;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function bestTextColor(hex) {
  const h = String(hex || "").trim().replace("#", "");
  const full = h.length === 3 ? h.split("").map((ch) => ch + ch).join("") : h;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) return "#111";

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.55 ? "#fff" : "#111";
}
