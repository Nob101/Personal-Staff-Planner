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

import { downloadDienstplanPdf } from "@/helpers/downloadDienstplanPdf";

const props = defineProps({
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  hasView: { type: Boolean, default: false },

  filialen: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
});

// NEU: an PDF angepasst
async function exportAlleFilialen() {
  if (props.loading || !props.hasView) return;
 
  // NEU:Das stellt sicher, dass Änderungen anderer Nutzer oder 
  // letzte Korrekturen im PDF landen. (best practice) emit ist asynchron und falls Vue länger braucht
    emit('load', props.jahr, props.monat);
    await new Promise(r => setTimeout(r, 600));
 
  // Bestimme, welche Filialen exportiert werden sollen
  const exportListe = props.modelValue?.length ? props.modelValue : props.filialen;
 
  for (let i = 0; i < exportListe.length; i++) {
    const f = exportListe[i];
    // WICHTIG: Die ID muss so aufgebaut sein, wie sie im DOM vergeben wurde
    // Beispiel: "dienstplan-filiale-10"
    const elementId = `export-area-filiale-${f.fnr}`;
    const dateiname = `Dienstplan_${f.filialname}_${props.monat}_${props.jahr}`;
    try{
 
       await downloadDienstplanPdf(elementId, dateiname);
       if (i < exportListe.length - 1) {    //Damit das seTimeout nach dem letzten PDF 
                                            // nicht mehr ausgeführt wird da zB 4 < 4 = false
        await new Promise(r => setTimeout(r, 800));
       }
 
    }catch (err) {
    console.error('Zuviele PDFs auf einmal', err)
  }
 }
}
 
const list = (props.modelValue?.length ? props.modelValue : props.filialen);
console.log("Export list length:", list.length, list.map(f => f.fnr));
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
      'px-10 pt-2 pb-1',
      'bg-white/80 dark:bg-zinc-900/70',
      'backdrop-blur',
      'transition-transform duration-200 ease-out will-change-transform',
      headerHidden ? '-translate-y-[120%]' : 'translate-y-0'
    ]"
  >
    <!-- LINKS: Datum / Monat -->
    <div class="flex items-center gap-5 h-10">
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
<div class="min-w-60">
  <Multiselect
    class="ms"
    :model-value="modelValue"
    @update:model-value="val => emit('update:modelValue', val || [])"
    :options="filialen"
    :multiple="true"
    :searchable="false"
    :close-on-select="false"
    :clear-on-select="false"
    label="filialname"
    track-by="fnr"
    :placeholder="(modelValue && modelValue.length > 0) ? '' : 'Filialen auswählen'"
    select-label=""
    selected-label=""
    deselect-label=""
    :allow-empty="true"
  >
    <!-- AUSGEWÄHLTE TAGS im Feld: nur Farbpunkte -->
    <template #tag="{ option, remove }">
      <span
        class="inline-flex items-center justify-center
               h-5 w-5 rounded-full
               ring-1 ring-black/20 dark:ring-white/20"
        :style="{ backgroundColor: option.farbe || '#ccc' }"
        :title="option.filialname"
        @mousedown.prevent
        @click.stop="remove(option)"
      />
    </template>

    <!-- OPTIONEN im Dropdown: Punkt + Name -->
    <template #option="{ option }">
      <div class="flex items-center gap-2">
        <span
          class="h-3.5 w-3.5 rounded-full ring-1 ring-black/20 dark:ring-white/20"
          :style="{ backgroundColor: option.farbe || '#ccc' }"
        />
        <span class="truncate">{{ option.filialname }}</span>
      </div>
    </template>
  </Multiselect>
</div>
    <!-- RECHTS: Globale Aktionen -->
    <div class="w-64 flex justify-end">
      <div
        class="flex items-center gap-1 rounded-xl p-1"
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
          title="Alle Filialen als PDF exportieren"
          @click="exportAlleFilialen"
          type="button"
        >
          <img :src="export_icon" class="h-3 w-3 opacity-90" alt="Exportieren" />
        </button>
      </div>
    </div>
  </div>
</template>