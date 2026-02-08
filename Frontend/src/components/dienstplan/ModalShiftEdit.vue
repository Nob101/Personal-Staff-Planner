<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/70" @click="$emit('close')"></div>

    <div class="absolute left-1/2 top-1/2 w-[780px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2
                rounded-xl border border-white/10 bg-[#141414] text-white shadow-2xl">
      <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div class="font-semibold">
          Manuelle Eintragung – Dienst #{{ dienst?.id }}
          <span class="text-white/60 font-normal ml-2">
            {{ dienst?.datum }} | Filiale {{ dienst?.fnr }}
          </span>
        </div>
        <button class="px-2 py-1 rounded bg-white/10 hover:bg-white/15" @click="$emit('close')">Esc</button>
      </div>

      <div class="p-4">
        <div v-if="loading" class="text-white/70">Lade Mitarbeiter…</div>
        <div v-else-if="error" class="text-red-300">{{ error }}</div>

        <div v-else class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-white/70 mb-1">Status</label>
              <select v-model="localTyp"
                class="w-full px-2 py-2 rounded-xl border border-white/15 bg-black/30 text-white outline-none">
                <option value="A">A – Anfangsdienst</option>
                <option value="E">E – Enddienst</option>
                <option value="F">F – Frei</option>
                <option value="K">K – Krank</option>
                <option value="U">U – Urlaub</option>
              </select>
            </div>

            <div>
              <label class="block text-xs text-white/70 mb-1">Mitarbeiter</label>
              <select v-model.number="localMnr"
                class="w-full px-2 py-2 rounded-xl border border-white/15 bg-black/30 text-white outline-none">
                <option :value="null">— wählen —</option>
                <option v-for="m in kandidaten" :key="m.mnr" :value="m.mnr">
                  {{ m.nachname }} {{ m.vorname }} ({{ m.mnr }})<span v-if="m.springer"> · Springer</span>
                </option>
              </select>

              <div class="text-xs text-white/50 mt-1">
                Kandidaten = Springer ODER (Nebenfiliale passt) und am Datum nicht A/E eingeteilt.
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2">
            <button class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15"
              @click="$emit('close')">
              Abbrechen
            </button>

            <button class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
              :disabled="saving || !canSave"
              @click="onSave">
              Speichern
            </button>
          </div>

          <div v-if="!canSave" class="text-xs text-red-300">
            Bitte Status und Mitarbeiter wählen.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  dienst: { type: Object, default: null }, // { id, datum, fnr, mnr, schicht_typ, ... }
  kandidaten: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

const emit = defineEmits(["close", "save"]);

const localTyp = ref("F");
const localMnr = ref(null);

watch(
  () => props.dienst,
  (d) => {
    if (!d) return;
    localTyp.value = d.schicht_typ || "F";
    localMnr.value = d.mnr ?? null;
  },
  { immediate: true }
);

const canSave = computed(() => {
  // du willst immer einen Mitarbeiter einteilen -> Pflicht
  return !!localTyp.value && localMnr.value != null;
});

function onSave() {
  emit("save", {
    dienstId: props.dienst.id,
    schicht_typ: localTyp.value,
    mnr: localMnr.value,
  });
}
</script>
