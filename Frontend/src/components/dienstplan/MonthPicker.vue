<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },
  loading: { type: Boolean, default: false },
});

const emit = defineEmits(["load"]);

/* local state sync */
const localJahr = ref(props.jahr);
const localMonat = ref(props.monat);
watch(() => props.jahr, (v) => (localJahr.value = v));
watch(() => props.monat, (v) => (localMonat.value = v));

/* picker state */
const pickerOpen = ref(false);
const pickJahr = ref(localJahr.value);
const pickMonat = ref(localMonat.value);

/* helpers */
const monate = ["Jän","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];
const monatName = (m) => monate[(m ?? 1) - 1] ?? "";
const currentYear = new Date().getFullYear();
const jahre = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

/* actions */
const emitLoad = () => emit("load", localJahr.value, localMonat.value);

function shiftMonths(delta) {
  if (props.loading) return;
  const idx = localJahr.value * 12 + (localMonat.value - 1) + delta;
  localJahr.value = Math.floor(idx / 12);
  localMonat.value = (idx % 12) + 1;
  emitLoad();
}

function jumpTo() {
  if (props.loading) return;
  localJahr.value = pickJahr.value;
  localMonat.value = pickMonat.value;
  pickerOpen.value = false;
  emitLoad();
}

function togglePicker() {
  // beim Öffnen Picker-Werte einmalig setzen
  if (!pickerOpen.value) {
    pickJahr.value = localJahr.value;
    pickMonat.value = localMonat.value;
  }
  pickerOpen.value = !pickerOpen.value;
}

/* outside click closes popover */
const rootEl = ref(null);
function onDocClick(e) {
  if (pickerOpen.value && rootEl.value && !rootEl.value.contains(e.target)) {
    pickerOpen.value = false;
  }
}
onMounted(() => document.addEventListener("click", onDocClick));
onBeforeUnmount(() => document.removeEventListener("click", onDocClick));
</script>

<template>
  <div ref="rootEl" class="relative">
    <div class="flex items-center gap-2">
      <button
        class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white disabled:opacity-50"
        :disabled="loading"
        @click="shiftMonths(-1)"
        title="Vormonat"
      >
        ❰
      </button>

      <!-- Chip -->
      <button
        class="px-4 py-2 rounded-xl border border-white/15 bg-black/30
               text-white font-semibold min-w-[160px] text-center hover:bg-white/5
               disabled:opacity-50"
        :disabled="loading"
        @click="togglePicker"
        title="Monat/Jahr auswählen"
      >
        {{ monatName(localMonat) }} {{ localJahr }}
      </button>

      <button
        class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white disabled:opacity-50"
        :disabled="loading"
        @click="shiftMonths(1)"
        title="Nächster Monat"
      >
        ❱
      </button>
    </div>

    <!-- Popover -->
    <div
      v-if="pickerOpen"
      class="absolute left-0 top-full mt-2 z-50 p-4
             rounded-xl border border-white/15 bg-black/80 backdrop-blur shadow-xl"
    >
      <div class="flex items-end gap-2">
        <div>
          <label class="block text-xs text-white/60 mb-1">Monat</label>
          <select
            v-model.number="pickMonat"
            class="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white outline-none"
          >
            <option v-for="m in 12" :key="m" :value="m">
              {{ monatName(m) }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs text-white/60 mb-1">Jahr</label>
          <select
            v-model.number="pickJahr"
            class="px-3 py-2 rounded-xl bg-black/40 border border-white/15 text-white outline-none"
          >
            <option v-for="y in jahre" :key="y" :value="y">
              {{ y }}
            </option>
          </select>
        </div>

        <button
          class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold"
          :disabled="loading"
          @click="jumpTo"
        >
          Wechseln
        </button>
      </div>
    </div>
  </div>
</template>
