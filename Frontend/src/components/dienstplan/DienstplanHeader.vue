<!-- DienstplanHeader.vue (obere Steuerleiste für die Dienstplan-Ansicht)-->

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

// Komponenten
import MonthPicker from "@/components/dienstplan/MonthPicker.vue";
import Multiselect from "vue-multiselect";

// Icons für Aktionen
import generieren_icon from "@/assets/icons/generieren_icon.svg";
import leeren_icon from "@/assets/icons/leeren_icon.svg";
import export_icon from "@/assets/icons/export_icon.svg";

import { downloadDienstplanCsv } from "@/helpers/downloadDienstplanCsv";

const props = defineProps({
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  hasView: { type: Boolean, default: false },

  filialen: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
});

async function exportAlleFilialen() {
  if (props.loading || !props.hasView) return;

  for (const f of props.filialen) {
    await downloadDienstplanCsv({
      jahr: props.jahr,
      monat: props.monat,
      fnr: f.fnr,
    });
  }
}

const emit = defineEmits(["load", "generate", "remove", "update:modelValue"]);

/* =========================================================
   Hide-on-scroll (down = hide, up = show)
   ========================================================= */
const headerHidden = ref(false);
let lastY = 0;
let ticking = false;

function onScroll() {
  const y = window.scrollY || 0;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      const delta = y - lastY;

      // kleine Scroll-Zitterbewegungen ignorieren
      if (Math.abs(delta) > 6) {
        if (delta > 0 && y > 80) {
          // nach unten scrollen (und nicht ganz oben)
          headerHidden.value = true;
        } else {
          // nach oben scrollen
          headerHidden.value = false;
        }
        lastY = y;
      }

      ticking = false;
    });
    ticking = true;
  }
}

onMounted(() => {
  lastY = window.scrollY || 0;
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div
    :class="[
      'sticky top-12 z-50',
      'mx-auto w-full max-w-[1400px]',
      'flex items-center justify-between gap-4',
      'px-8 pt-1 pb-1',
      'bg-white/80 dark:bg-zinc-900/70',
      'backdrop-blur',
      'transition-transform duration-200 ease-out will-change-transform',
      headerHidden ? '-translate-y-[120%]' : 'translate-y-0'
    ]"
  >
    <!-- LINKS: Datum / Monat -->
    <div class="flex items-center gap-3 h-10">
      <MonthPicker
        :jahr="jahr"
        :monat="monat"
        :loading="loading"
        @load="(j, m) => emit('load', j, m)"
      />

      <div class="text-sm">
        <span v-if="loading" class="text-white/70">⌛ Lädt...</span>
        <span v-else-if="error" class="text-red-600">{{ error }}</span>
      </div>
    </div>

    <!-- MITTE: Filialen MultiSelect -->
    <div class="w-75">
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
        :placeholder="(modelValue && modelValue.length > 0) ? '' : 'Filialen auswählen'"
        select-label=""
        selected-label=""
        deselect-label=""
        :allow-empty="true"
      />
    </div>

    <!-- RECHTS: Globale Aktionen -->
    <div class="w-64 flex justify-end">
      <div
        class="flex items-center gap-1 rounded-xl
               bg-linear-to-b from-zinc-200 to-zinc-300 dark:bg-white/5
               ring-1 ring-black/10 dark:ring-white/10
               p-1"
      >
        <!-- Generieren -->
        <button
          class="inline-flex h-8 w-8 items-center justify-center rounded-xl
                 bg-linear-to-b from-blue-300 to-blue-900
                 hover:from-blue-900 hover:to-blue-300
                 ring-1 ring-blue-600/30
                 shadow-sm
                 transition active:scale-[0.97] disabled:opacity-50"
          :disabled="loading"
          title="Alle Dienstpläne generieren"
          @click="emit('generate')"
          type="button"
        >
          <img :src="generieren_icon" class="h-4 w-4 opacity-90" alt="Generieren" />
        </button>

        <!-- Leeren -->
        <button
          class="inline-flex h-8 w-8 items-center justify-center rounded-xl
                 bg-linear-to-b from-red-300 to-red-900
                 hover:from-red-900 hover:to-red-300
                 ring-1 ring-red-600/30
                 shadow-sm
                 transition active:scale-[0.97] disabled:opacity-50"
          :disabled="loading || !hasView"
          title="Alle Dienstpläne leeren"
          @click="emit('remove')"
          type="button"
        >
          <img :src="leeren_icon" class="h-3 w-3 opacity-90" alt="Leeren" />
        </button>

        <!-- Export -->
        <button
          class="inline-flex h-8 w-8 items-center justify-center rounded-xl
                 bg-linear-to-b from-emerald-300 to-emerald-900
                 hover:from-emerald-900 hover:to-emerald-300
                 ring-1 ring-emerald-600/30
                 shadow-sm
                 transition active:scale-[0.97] disabled:opacity-50"
          :disabled="loading || !hasView"
          title="Alle Filialen als CSV exportieren"
          @click="exportAlleFilialen"
          type="button"
        >
          <img :src="export_icon" class="h-3 w-3 opacity-90" alt="Exportieren" />
        </button>
      </div>
    </div>
  </div>
</template>