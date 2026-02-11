<script setup>
import { ref } from "vue";
import { useDienstplan } from "@/composables/dienstplan/useDienstplan.js";
import DienstplanHeader from "@/components/dienstplan/DienstplanHeader.vue";
import DienstplanGrid from "@/components/dienstplan/DienstplanGrid.vue";
 
const jahr = ref(2026);
const monat = ref(1);
 
const {
  view, loading, error,
  load, generate, remove,
  doShift, getErsatz, doShiftMitErsatz
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
function onGenerateAll() {
  if (!view.value?.filialen?.length) return;
 
  for (const f of view.value.filialen) {
    generate(jahr.value, monat.value, f.fnr);
  }
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
        @load="onLoad"
        @generate="onGenerateAll"
        @remove="onRemoveAll"
      />
 
      <DienstplanGrid
        :view="view"
        :onShift="doShift"
        :onGetErsatz="getErsatz"
        :onShiftMitErsatz="doShiftMitErsatz"
      />
    </div>
  </div>
</template>