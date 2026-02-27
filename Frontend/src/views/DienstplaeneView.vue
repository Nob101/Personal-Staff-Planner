<script setup>
import { ref, computed } from "vue";
import { useDienstplan } from "@/composables/dienstplan/useDienstplan.js";
import { useDarkMode } from "@/composables/useDarkMode.js";

import DienstplanHeader from "@/components/dienstplan/DienstplanHeader.vue";
import DienstplanGrid from "@/components/dienstplan/DienstplanGrid.vue";

const { isDark } = useDarkMode(); // <-- shared state mit Navbar

const now = new Date();
const jahr = ref(now.getFullYear());
const monat = ref(now.getMonth() + 1);

const {
  view, loading, error,
  load, generate, remove,
  doShift, getErsatz, doShiftMitErsatz,
} = useDienstplan();

function onLoad(j, m) {
  jahr.value = j;
  monat.value = m;
  load(j, m);
}

/**
 * GLOBAL: einmal generieren (Backend generiert eh alle Filialen)
 */
async function onGenerateAll() {
  if (loading.value) return;
  await generate(jahr.value, monat.value);
}

/**
 * GLOBAL: alles leeren
 */
function onRemoveAll() {
  remove(jahr.value, monat.value);
}

// initial load
load(jahr.value, monat.value);

const selectedFilialen = ref([]);

const filialenToShow = computed(() => {
  const all = view.value?.filialen ?? [];
  if (!selectedFilialen.value.length) return all;
  const chosen = new Set(selectedFilialen.value.map(f => f.fnr));
  return all.filter(f => chosen.has(f.fnr));
});

async function onGenerateFiliale({ fnr, jahr: j, monat: m }) {
  if (loading.value) return;
  await generate(j, m, fnr);
}

function onRemoveFiliale({ fnr, jahr: j, monat: m }) {
  remove(j, m, fnr);
}

</script>

<template>
  <!-- Background wird DIREKT von isDark gesteuert -->
  <div
    class="min-h-screen"
  >
    <div class="mx-auto w-full max-w-[1400px] font-sans pb-6">
      <DienstplanHeader
        :jahr="jahr"
        :monat="monat"
        :loading="loading"
        :error="error"
        :hasView="!!view"
        :filialen="view?.filialen ?? []"
        v-model="selectedFilialen"
        @load="onLoad"
        @generate="onGenerateAll"
        @remove="onRemoveAll"
      />

      <DienstplanGrid
        :view="view"
        :filialen="filialenToShow"
        :onShift="doShift"
        :onGetErsatz="getErsatz"
        :onShiftMitErsatz="doShiftMitErsatz"
        :jahr="jahr"
        :monat="monat"
        :loading="loading"
        :hasView="!!view"
        @generateFiliale="onGenerateFiliale"
        @removeFiliale="onRemoveFiliale"
      />
    </div>
  </div>
</template>
