<script setup>
import MonthPicker from "@/components/dienstplan/MonthPicker.vue";
import Multiselect from "vue-multiselect";

import magic from "@/assets/icons/magic-wand.svg";
import removeIcon from "@/assets/icons/eraser.svg";

const props = defineProps({
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  hasView: { type: Boolean, default: false },

  // Filialen-Optionen + v-model
  filialen: { type: Array, default: () => [] },          // Optionen (view.filialen)
  modelValue: { type: Array, default: () => [] },         // selectedFilialen
});

const emit = defineEmits([
  "load",
  "generate",
  "remove",
  "update:modelValue",
]);
</script>

<template>
  <!-- Hauptleiste -->
  <div class="flex items-center justify-between mb-6 gap-4">
    <!-- LINKS: Datum / Monat -->
    <div class="flex items-center gap-3">
      <MonthPicker
        :jahr="jahr"
        :monat="monat"
        :loading="loading"
        @load="(j, m) => emit('load', j, m)"
      />

      <!-- Status -->
      <div class="text-sm">
        <span v-if="loading" class="text-white/70">⌛</span>
        <span v-else-if="error" class="text-red-300">{{ error }}</span>
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
        <img :src="magic" class="h-4 w-4" alt="Generieren" />
        <span class="text-sm font-semibold">Generieren</span>
      </button>

      <button
        class="group inline-flex items-center gap-2 whitespace-nowrap
               rounded-xl border border-red-500/20 bg-red-500/50
               px-4 py-2.5 text-sm font-semibold text-zinc-950
               transition hover:bg-red-500 hover:scale-[1.02]
               active:scale-[0.98] disabled:opacity-60"
        :disabled="loading || !hasView"
        title="Alle Dienstpläne leeren"
        @click="emit('remove')"
      >
        <img :src="removeIcon" class="h-4 w-4" alt="Leeren" />
        <span class="text-sm font-semibold">Leeren</span>
      </button>
    </div>
  </div>
</template>
