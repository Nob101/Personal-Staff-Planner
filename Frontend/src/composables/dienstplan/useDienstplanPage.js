import { ref, computed, onMounted } from "vue";
import { useDienstplan } from "@/composables/dienstplan/useDienstplan.js";

export function useDienstplanPage() {
  const now = new Date();
  const jahr = ref(now.getFullYear());
  const monat = ref(now.getMonth() + 1);
  const selectedFilialen = ref([]);

  const {
    view,
    loading,
    error,
    load,
    generate,
    remove,
    doShift,
    getErsatz,
    doShiftMitErsatz,
  } = useDienstplan();

  function onLoad(j, m) {
    jahr.value = j;
    monat.value = m;
    load(j, m);
  }

  async function onGenerateAll() {
    if (loading.value) return;
    await generate(jahr.value, monat.value);
  }

  function onRemoveAll() {
    remove(jahr.value, monat.value);
  }

  async function onGenerateFiliale({ fnr, jahr: j, monat: m }) {
    if (loading.value) return;
    await generate(j, m, fnr);
  }

  function onRemoveFiliale({ fnr, jahr: j, monat: m }) {
    remove(j, m, fnr);
  }

  const filialenToShow = computed(() => {
    const all = view.value?.filialen ?? [];
    if (!selectedFilialen.value.length) return all;
    const chosen = new Set(selectedFilialen.value.map(f => f.fnr));
    return all.filter(f => chosen.has(f.fnr));
  });

  onMounted(() => {
    load(jahr.value, monat.value);
  });

  return {
    jahr,
    monat,
    selectedFilialen,
    filialenToShow,

    view,
    loading,
    error,

    doShift,
    getErsatz,
    doShiftMitErsatz,

    onLoad,
    onGenerateAll,
    onRemoveAll,
    onGenerateFiliale,
    onRemoveFiliale,
  };
}