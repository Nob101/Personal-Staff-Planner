<!-- DienstplanHeader.vue (obere Steuerleiste für die Dienstplan-Ansicht)-->

<script setup>
// Komponenten
import MonthPicker from "@/components/dienstplan/MonthPicker.vue";
import Multiselect from "vue-multiselect";

// Icons für Aktionen
import generieren_icon from "@/assets/icons/generieren_icon.svg";
import leeren_icon from "@/assets/icons/leeren_icon.svg";
import export_icon from "@/assets/icons/export_icon.svg";

import { downloadDienstplanCsv } from "@/helpers/downloadDienstplanCsv";

/**
 * Props kommen vom Parent (z.B. DienstplanView).
 * Diese Komponente ist rein steuernd / darstellend
 * und gibt alle Aktionen per Events nach oben weiter.
 */
const props = defineProps({
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  hasView: { type: Boolean, default: false },

  // Filialen-Optionen + v-model
  filialen: { type: Array, default: () => [] },   // Optionen (z.B. view.filialen)
  modelValue: { type: Array, default: () => [] }, // ausgewählte Filialen
});

async function exportAlleFilialen() {
  if (props.loading || !props.hasView) return;

  // alle Filialen exportieren -> mehrere Downloads
  for (const f of props.filialen) {
    await downloadDienstplanCsv({
      jahr: props.jahr,
      monat: props.monat,
      fnr: f.fnr,
    });
  }
}

const list = (props.modelValue?.length ? props.modelValue : props.filialen);
console.log("Export list length:", list.length, list.map(f => f.fnr));


/**
 * Events:
 * - load: Monat/Jahr wechseln
 * - generate: Dienstpläne generieren
 * - remove: Dienstpläne leeren
 * - update:modelValue: v-model für Filial-Auswahl
 */
const emit = defineEmits([
  "load",
  "generate",
  "remove",
  "update:modelValue",
]);


</script>

<template>
  <!--
    Hauptleiste des Dienstplans:
    - Links: Monat/Jahr + Status
    - Mitte: Filial-Auswahl
    - Rechts: globale Aktionen
  -->
  <div class="flex items-center justify-between mb-6 gap-4">

    <!-- LINKS: Datum / Monat -->
    <div class="flex items-center gap-3">
      <MonthPicker
        :jahr="jahr"
        :monat="monat"
        :loading="loading"
        @load="(j, m) => emit('load', j, m)"
      />

      <!-- Lade-/Fehlerstatus -->
      <div class="text-sm">
        <span v-if="loading" class="text-white/70">⌛ Lädt...</span>
        <span v-else-if="error" class="text-red-600">{{ error }}</span>
      </div>
    </div>

    <!-- MITTE: Filialen MultiSelect -->
    <div class="min-w-[260px]">
      <Multiselect
        class="ms"
        :model-value="modelValue"
        @update:model-value="val => emit('update:modelValue', val || [])"
        :options="filialen"
        :multiple="true"
        :close-on-select="false"
        :clear-on-select="false"
        :preserve-search="true"
        label="filialname"
        track-by="fnr"
        placeholder="Filialen auswählen (leer = alle)"
        select-label=""
        selected-label=""
        deselect-label=""
      />
    </div>

    <!-- RECHTS: Globale Aktionen -->
    <div class="flex items-center gap-2 shrink-0">

      <!-- Dienstpläne generieren -->
      <button
        class="group inline-flex items-center gap-2 whitespace-nowrap
               rounded-xl border border-white/10 bg-blue-600/70
               px-4 py-2.5 text-sm font-semibold text-zinc-950
               transition hover:bg-blue-500 hover:scale-[1.02]
               active:scale-[0.98] disabled:opacity-60"
        :disabled="loading"
        title="Alle Dienstpläne generieren"
        @click="emit('generate')"
      >
        <img :src="generieren_icon" class="h-4 w-4" alt="Generieren" />
      </button>

      <!-- Dienstpläne leeren -->
<button
  class="group inline-flex items-center gap-2 whitespace-nowrap
         rounded-xl border border-red-500/20
         bg-red-500 hover:bg-red-500/50
         dark:bg-red-500/50 dark:hover:bg-red-500
         px-4 py-2.5 text-sm font-semibold text-zinc-950
         transition hover:scale-[1.02] active:scale-[0.98]
         disabled:opacity-60"
  :disabled="loading || !hasView"
  title="Alle Dienstpläne leeren"
  @click="emit('remove')"
>
  <img :src="leeren_icon" class="h-4 w-4" alt="Leeren" />
</button>

            <!-- Alle Filialen exportieren -->
      <button
        class="group inline-flex items-center gap-2 whitespace-nowrap
              rounded-xl border border-white/10 bg-emerald-500/40
              px-4 py-2.5 text-sm font-semibold text-zinc-950
              transition hover:bg-emerald-500/80 hover:scale-[1.02]
              active:scale-[0.98] disabled:opacity-60"
        :disabled="loading || !hasView"
        title="Alle Filialen als CSV exportieren"
        @click="exportAlleFilialen"
        type="button"
      >
        <img :src="export_icon" class="h-4 w-4" alt="Exportieren" />
      </button>
    </div>
  </div>
</template>
