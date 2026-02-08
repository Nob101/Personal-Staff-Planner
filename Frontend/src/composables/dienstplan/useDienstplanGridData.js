import { computed } from "vue";
import { hexToRgba, bestTextColor } from "@/utils/colors";
import { dow, day } from "@/utils/dates";

/**
 * Liefert alle "reinen" Daten-/Formatierungs-Helfer für das Dienstplan-Grid.
 * view muss ein ref/computed sein (z.B. computed(() => props.view)).
 */
export function useDienstplanGridData(view) {
  /* ============================================================================
   * Dienste: pro Mitarbeiter + Datum genau 1 Dienst (filialübergreifend!)
   * ========================================================================== */
  const dienstMap = computed(() => {
    const map = new Map();
    const dienste = view.value?.dienste || [];
    for (const d of dienste) {
      const key = `${Number(d.mnr)}|${String(d.datum).slice(0, 10)}`;
      map.set(key, d);
    }
    return map;
  });

  function dienstOf(mnr, datum) {
    return (
      dienstMap.value.get(
        `${Number(mnr)}|${String(datum).slice(0, 10)}`
      ) || null
    );
  }

  /* ============================================================================
   * Filialen (für Farben)
   * ========================================================================== */
  const filialeMap = computed(() => {
    const map = new Map();
    for (const f of view.value?.filialen || []) {
      map.set(Number(f.fnr), f);
    }
    return map;
  });

  function filialeByFnr(fnr) {
    return filialeMap.value.get(Number(fnr)) || null;
  }

  /* ============================================================================
   * Zell-Style anhand des DIENSTES (nicht der aktuellen Filiale!)
   * ========================================================================== */
  function cellStyleByDienst(dienst) {
    const typ = String(dienst?.schicht_typ || "").toUpperCase();

    if (!typ || typ === "F") {
      return { backgroundColor: "#fff", borderColor: "#fff", color: "#111" };
    }

    const f = filialeByFnr(dienst.fnr);
    const base = f?.farbe || "#888888";

    return {
      backgroundColor: hexToRgba(base, 0.85),
      borderColor: hexToRgba(base, 1),
      color: bestTextColor(base),
    };
  }

  function cellText(typRaw) {
    const typ = String(typRaw || "").toUpperCase();
    if (!typ || typ === "F") return "";
    return typ;
  }

  /* ============================================================================
   * Stunden / Mitarbeiter
   * ========================================================================== */
  const stundenMap = computed(() => {
    const map = new Map();
    const st = view.value?.stunden || [];
    for (const s of st) map.set(Number(s.mnr), s);
    return map;
  });

  function stundenByMnr(mnr) {
    return stundenMap.value.get(Number(mnr)) || null;
  }

  function fullName(m) {
    const v = (m?.vorname || "").trim();
    const n = (m?.nachname || "").trim();
    if (!v && !n) return `MA ${m?.mnr}`;
    const vornameKurz = v ? `${v.charAt(0)}.` : "";
    return `${vornameKurz} ${n}`.trim();
  }

  function mitarbeiterByFiliale(fnr) {
    const arr = (view.value?.mitarbeiter || []).filter(
      (m) => Number(m.hauptfiliale_fnr) === Number(fnr)
    );
    arr.sort((a, b) => fullName(a).localeCompare(fullName(b), "de"));
    return arr;
  }

  return {
    dienstOf,
    filialeByFnr,
    cellStyleByDienst,
    cellText,
    stundenByMnr,
    mitarbeiterByFiliale,
    fullName,
    dow,
    day,
  };
}
