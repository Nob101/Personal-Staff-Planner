<!-- MonthPicker.vue (Monat/Jahr-Auswahl mit Navigation) -->

<script setup>
// Vue
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

/**
 * Props:
 * Der MonthPicker ist eine reine Steuer-Komponente.
 * Er zeigt den aktuellen Monat/Jahr an und triggert
 * einen Reload beim Wechsel.
 */
const props = defineProps({
  jahr: { type: Number, required: true },     // aktuelles Jahr
  monat: { type: Number, required: true },    // aktueller Monat (1–12)
  loading: { type: Boolean, default: false }, // sperrt Interaktionen beim Laden
});

/**
 * Events:
 * - load(jahr, monat): Parent soll neuen Monat laden
 */
const emit = defineEmits(["load"]);

/* Lokaler State (sync mit Props) */

// Lokale Kopien der Props, damit die UI sofort reagieren kann
const localJahr = ref(props.jahr);
const localMonat = ref(props.monat);

// Props → Local State synchron halten
watch(() => props.jahr, (v) => (localJahr.value = v));
watch(() => props.monat, (v) => (localMonat.value = v));

/* Picker State (Popover) */

// Ob das Monat/Jahr-Popover geöffnet ist
const pickerOpen = ref(false);

// Temporäre Auswahl im Popover (wird erst beim Bestätigen übernommen)
const pickJahr = ref(localJahr.value);
const pickMonat = ref(localMonat.value);

/* Helper / Konstanten */

// Monatsnamen (deutsch, kurz)
const monate = ["Jän","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

// Liefert Monatsnamen für 1–12
const monatName = (m) => monate[(m ?? 1) - 1] ?? "";

// Jahr-Auswahl: ±5 Jahre um das aktuelle Jahr
const currentYear = new Date().getFullYear();
const jahre = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

/* Aktionen */

// Emit für Reload mit aktuellem lokalen Jahr/Monat
const emitLoad = () => emit("load", localJahr.value, localMonat.value);

/* Wechselt um +1 / -1 Monat.
 * Berücksichtigt Jahreswechsel automatisch. */
function shiftMonths(delta) {
  if (props.loading) return;

  const idx = localJahr.value * 12 + (localMonat.value - 1) + delta;
  localJahr.value = Math.floor(idx / 12);
  localMonat.value = (idx % 12) + 1;

  emitLoad();
}

/*Übernimmt die Auswahl aus dem Popover
 * und triggert einen Reload. */
function jumpTo() {
  if (props.loading) return;

  localJahr.value = pickJahr.value;
  localMonat.value = pickMonat.value;
  pickerOpen.value = false;

  emitLoad();
}

/*Öffnet / schließt den Picker.
 * Beim Öffnen werden die aktuellen Werte übernommen. */
function togglePicker() {
  if (!pickerOpen.value) {
    pickJahr.value = localJahr.value;
    pickMonat.value = localMonat.value;
  }
  pickerOpen.value = !pickerOpen.value;
}

/* Outside-Click Handling */

// Referenz auf Root-Element für Click-Detection
const rootEl = ref(null);

/* Schließt den Picker, wenn außerhalb geklickt wird. */
function onDocClick(e) {
  if (
    pickerOpen.value &&
    rootEl.value &&
    !rootEl.value.contains(e.target)
  ) {
    pickerOpen.value = false;
  }
}

onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>

<template>
  <!-- Root für Outside-Click-Erkennung -->
  <div ref="rootEl" class="relative">

    <!-- Navigation -->
    <div class="flex items-center gap-2">

      <!-- Vormonat -->
      <button
        class="px-3 py-2 rounded-xl bg-black/50 hover:bg-black
               text-white disabled:opacity-50"
        :disabled="loading"
        @click="shiftMonths(-1)"
        title="Vormonat"
      >
        ❰
      </button>

      <!-- Aktueller Monat/Jahr (öffnet Picker) -->
      <button
        class="px-4 py-2 rounded-xl border border-white/15 bg-black/50
               text-white font-semibold min-w-40 text-center
               hover:bg-black disabled:opacity-50"
        :disabled="loading"
        @click="togglePicker"
        title="Monat/Jahr auswählen"
      >
        {{ monatName(localMonat) }} {{ localJahr }}
      </button>

      <!-- Nächster Monat -->
      <button
        class="px-3 py-2 rounded-xl bg-black/50 hover:bg-black
               text-white disabled:opacity-50"
        :disabled="loading"
        @click="shiftMonths(1)"
        title="Nächster Monat"
      >
        ❱
      </button>
    </div>

    <!-- Monat/Jahr Picker Popover -->
    <div
      v-if="pickerOpen"
      class="absolute left-0 top-full mt-2 z-50 p-4
             rounded-xl border border-white/15
             bg-black/80 backdrop-blur shadow-xl"
    >
      <div class="flex items-end gap-2">

        <!-- Monat -->
        <div>
          <label class="block text-xs text-white/60 mb-1">
            Monat
          </label>
          <select
            v-model.number="pickMonat"
            class="px-3 py-2 rounded-xl bg-black/40
                   border border-white/15 text-white outline-none"
          >
            <option v-for="m in 12" :key="m" :value="m">
              {{ monatName(m) }}
            </option>
          </select>
        </div>

        <!-- Jahr -->
        <div>
          <label class="block text-xs text-white/60 mb-1">
            Jahr
          </label>
          <select
            v-model.number="pickJahr"
            class="px-3 py-2 rounded-xl bg-black/40
                   border border-white/15 text-white outline-none"
          >
            <option v-for="y in jahre" :key="y" :value="y">
              {{ y }}
            </option>
          </select>
        </div>

        <!-- Bestätigen -->
        <button
          class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500
                 text-white font-semibold disabled:opacity-50"
          :disabled="loading"
          @click="jumpTo"
        >
          Wechseln
        </button>
      </div>
    </div>
  </div>
</template>
