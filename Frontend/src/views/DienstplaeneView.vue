<script setup>
import { ref, computed } from "vue";
import { useDienstplan } from "@/composables/dienstplan/useDienstplan.js";
import DienstplanHeader from "@/components/dienstplan/DienstplanHeader.vue";
import DienstplanGrid from "@/components/dienstplan/DienstplanGrid.vue";
 
const now = new Date()
const jahr = ref(now.getFullYear())
const monat = ref(now.getMonth() + 1)
 
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
 * GLOBAL: alle Filialen generieren
 * (nutzt deine bestehende generate(jahr, monat, fnr) Logik)
 */
async function onGenerateAll() {
  if (loading.value) return;
  await generate(jahr.value, monat.value);
}

 
/**
 * GLOBAL: alles leeren
 * (bei dir remove(jahr, monat) ist global – passt perfekt)
 */
function onRemoveAll() {
  remove(jahr.value, monat.value);
}
 
// initial load
load(jahr.value, monat.value);

const selectedFilialen = ref([]);

const filialenToShow = computed(() => {
  const all = view.value?.filialen ?? [];
  if (!selectedFilialen.value.length) return all; // leer = alle
  const chosen = new Set(selectedFilialen.value.map(f => f.fnr));
  return all.filter(f => chosen.has(f.fnr));
});

</script>
 
<template>
  <div class="min-h-screen bg-white text-black dark:bg-[#18181b] dark:text-white">
    <div class="mx-auto w-full max-w-[1400px] px-6 py-6 font-sans text-white">
 
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
      />
    </div>    
  </div>
</template>