<script setup>
import { useDienstplanPage } from "@/composables/dienstplan/useDienstplanPage.js";

import DienstplanActionBar from "@/components/dienstplan/DienstplanActionBar.vue";
import DienstplanGrid from "@/components/dienstplan/DienstplanGrid.vue";

const {
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
} = useDienstplanPage();
</script>

<template>
  <div class="min-h-screen">
    <div class="mx-auto w-full font-sans pb-6">
      <DienstplanActionBar
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