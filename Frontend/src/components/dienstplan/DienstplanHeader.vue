<script setup>
import MonthPicker from "@/components/dienstplan/MonthPicker.vue";

import magic from "@/assets/icons/magic-wand.svg";
import removeIcon from "@/assets/icons/eraser.svg";

const props = defineProps({
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  hasView: { type: Boolean, default: false },
});

const emit = defineEmits(["load", "generate", "remove"]);
</script>

<template>
  <!-- Hauptleiste -->
  <div class="flex items-center justify-between mb-6">
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

    <!-- RECHTS: Globale Aktionen -->
    <div class="flex items-center gap-2">
      <button
        class="flex items-center gap-2 px-4 py-3 rounded-xl
               bg-blue-600/70 hover:bg-blue-500 text-zinc-950
               border border-white/10 disabled:opacity-60"
        :disabled="loading"
        title="Alle Dienstpläne generieren"
        @click="emit('generate')"
      >
       <img :src="magic" class="h-4 w-4" alt="Generieren" /> 
        <span class="text-sm font-semibold">Generieren</span>
      </button>

      <button
        class="flex items-center gap-2 px-4 py-3 rounded-xl
               bg-red-500/50 hover:bg-red-500 text-zinc-950
               border border-red-500/20 disabled:opacity-60"
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
