import { ref, onMounted, onBeforeUnmount } from "vue";

/**
 * Kapselt Inline-Dropdown Editing + Ersatz-Modal Logik.
 */
export function useInlineShiftEdit({ view, dienstOf, onShift, onGetErsatz, onShiftMitErsatz }) {
  /* ============================================================================
   * Inline Dropdown Editing
   * ========================================================================== */
  const editingKey = ref(null);
  const editingDienst = ref(null);
  const localTyp = ref("F");
  const options = ["A", "E", "F", "K", "U"];

  function openDropdown(mnr, datum) {
    const dienst = dienstOf(mnr, datum);
    if (!dienst) return;

    editingKey.value = `${mnr}|${String(datum).slice(0, 10)}`;
    editingDienst.value = dienst;
    localTyp.value = String(dienst.schicht_typ ?? "F").toUpperCase();
  }

  function closeDropdown() {
    editingKey.value = null;
    editingDienst.value = null;
  }

  function onDocClick(e) {
    if (!editingKey.value) return;
    if (e.target?.closest?.("select")) return;
    if (String(e.target?.tagName || "").toUpperCase() === "OPTION") return;
    closeDropdown();
  }

  onMounted(() => document.addEventListener("click", onDocClick));
  onBeforeUnmount(() => document.removeEventListener("click", onDocClick));

  /* ============================================================================
   * Ersatz-Modal State
   * ========================================================================== */
  const ersatzOpen = ref(false);
  const ersatzLoading = ref(false);
  const ersatzError = ref("");
  const ersatzKandidaten = ref([]);

  const ersatzCtx = ref({
    jahr: null,
    monat: null,
    altId: null,
    altNewTyp: "",
    datum: "",
    fnr: null,
  });

  function needsErsatz(altDienst, neuTyp) {
    const altTyp = String(altDienst?.schicht_typ ?? "").toUpperCase();
    const n = String(neuTyp ?? "").toUpperCase();

    const removingRealShift =
      (altTyp === "A" || altTyp === "E") && (n === "K" || n === "U" || n === "F");
    if (!removingRealShift) return false;

    const fnr = Number(altDienst.fnr);
    const datum = String(altDienst.datum).slice(0, 10);

    const othersSameTyp = (view.value?.dienste || []).some((d) => {
      if (!d) return false;
      if (Number(d.id) === Number(altDienst.id)) return false;

      return (
        Number(d.fnr) === fnr &&
        String(d.datum).slice(0, 10) === datum &&
        String(d.schicht_typ).toUpperCase() === altTyp
      );
    });

    return !othersSameTyp;
  }

  async function saveDropdown() {
    if (!editingDienst.value) return;

    const alt = editingDienst.value;
    const neuTyp = localTyp.value;

    if (needsErsatz(alt, neuTyp)) {
      ersatzOpen.value = true;
      ersatzLoading.value = true;
      ersatzError.value = "";
      ersatzKandidaten.value = [];

      ersatzCtx.value = {
        jahr: view.value?.jahr,
        monat: view.value?.monat,
        altId: alt.id,
        altNewTyp: neuTyp,
        datum: String(alt.datum).slice(0, 10),
        fnr: alt.fnr,
      };

      closeDropdown();

      try {
        const res = await onGetErsatz?.(alt.id);
        ersatzKandidaten.value = res?.kandidaten ?? [];
        if (!ersatzKandidaten.value.length) {
          ersatzError.value = "Keine verfügbaren Mitarbeiter gefunden.";
        }
      } catch (e) {
        ersatzError.value =
          e?.response?.data?.error || e?.message || "Fehler beim Laden der Kandidaten";
      } finally {
        ersatzLoading.value = false;
      }

      return;
    }

    await onShift?.({
      jahr: view.value?.jahr,
      monat: view.value?.monat,
      id: alt.id,
      schicht_typ: neuTyp,
    });

    closeDropdown();
  }

  async function onPickErsatz(k) {
    try {
      ersatzLoading.value = true;
      ersatzError.value = "";

      await onShiftMitErsatz?.({
        jahr: ersatzCtx.value.jahr,
        monat: ersatzCtx.value.monat,
        altId: ersatzCtx.value.altId,
        neuId: Number(k.dienstId),
        schicht_typ: ersatzCtx.value.altNewTyp,
      });

      ersatzOpen.value = false;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      ersatzError.value =
        e?.response?.data?.error || e?.message || "Fehler beim Speichern";
    } finally {
      ersatzLoading.value = false;
    }
  }

  /**
   * NEU: Bewusst unterbesetzen -> trotzdem speichern ohne Ersatz.
   */
  async function onIgnoreErsatz() {
    try {
      ersatzLoading.value = true;
      ersatzError.value = "";

      await onShift?.({
        jahr: ersatzCtx.value.jahr,
        monat: ersatzCtx.value.monat,
        id: ersatzCtx.value.altId,
        schicht_typ: ersatzCtx.value.altNewTyp,
      });

      ersatzOpen.value = false;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      ersatzError.value =
        e?.response?.data?.error || e?.message || "Fehler beim Speichern";
    } finally {
      ersatzLoading.value = false;
    }
  }

  return {
    editingKey,
    localTyp,
    options,
    openDropdown,
    saveDropdown,
    closeDropdown,

    ersatzOpen,
    ersatzLoading,
    ersatzError,
    ersatzKandidaten,
    ersatzCtx,
    onPickErsatz,
    onIgnoreErsatz,
  };
}
