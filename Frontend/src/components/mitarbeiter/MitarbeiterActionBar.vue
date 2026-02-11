<!-- MitarbeiterActionBar.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { ref, computed } from 'vue'
import Multiselect from 'vue-multiselect'


import mitarbeiter_anlegen_icon from '@/assets/icons/mitarbeiter_anlegen_icon_solid.svg'
import lupe_icon from '@/assets/icons/lupe_icon_solid.svg'

const props = defineProps({
  modelValue: String,
  sortOptions: {
    type: Array,
    required: true
  }
})


// ❗️Design hatte andere Event-Namen ("search"), aber wir behalten "searchMitarbeiter",
// weil MitarbeiterView/useMitarbeiter darauf bereits hängt.
const emit = defineEmits(['update:modelValue', 'mitarbeiterCreate', 'searchMitarbeiter'])

const search = ref('')

// Findet das Objekt in den Optionen, das zum aktuellen String-Wert passt
const selectedOption = computed(() => {
  return props.sortOptions.find(o => o.value === props.modelValue)
})


// Kommentar, weil minimale Logik-Erweiterung:
// WHY: Wenn die Actionbar remounted, kann die Liste sonst "alt" gefiltert sein.
// -> Falls du das NICHT willst, kannst du das weglassen.
// watch(search, (val) => emit('searchMitarbeiter', val))
</script>

<template>
  <!-- Design: Sticky Bar unter Navbar -->
  <div class="sticky top-16 z-40 font-sans bg-zinc-500/70 backdrop-blur">
    <div class="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-2 min-h-12">
      <!-- LINKS: Create + Sort -->
      <div class="flex items-center gap-4">
        <button
          type="button"
          @click="emit('mitarbeiterCreate')"
          class="group inline-flex items-center gap-2 whitespace-nowrap
                 rounded-xl border border-white/10 bg-black/10
                 px-4 py-2 text-sm font-semibold text-white/85
                 hover:bg-black/20 hover:text-white transition"
          title="Neu anlegen"
        >
          <img
            :src="mitarbeiter_anlegen_icon"
            class="h-6 w-6 opacity-70 group-hover:opacity-100"
            alt=""
          />
          Neu anlegen
        </button>

        <!-- Sortierung (Logik bleibt, Design-Container drumrum) -->
        <div class="min-w-[260px]">
          <Multiselect
            :options="sortOptions"
            :model-value="selectedOption"
            @update:model-value="val => emit('update:modelValue', val.value)"
            label="label"
            track-by="value"
            placeholder="Sortieren"
            :allow-empty="false"
            :searchable="false"
            select-label=""
            selected-label=""
            deselect-label=""
          >
            <template #singleLabel="{ option }">
              <span class="multiselect-label-text">{{ option.label }}</span>
            </template>
          </Multiselect>
        </div>
      </div>

      <!-- RECHTS: Suche (Design) -->
      <div class="relative w-full max-w-sm">
        <input
          v-model="search"
          type="text"
          placeholder="Suchen"
          class="h-10 w-full rounded-xl bg-black/10 dark:bg-black/30
                 pl-11 pr-3 text-sm text-zinc-900 dark:text-white/90
                 outline-none ring-1 ring-black/10 dark:ring-white/15
                 focus:ring-black/20 dark:focus:ring-white/30"
          @input="emit('searchMitarbeiter', search)"
        />
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <img :src="lupe_icon" class="h-5 w-5 opacity-60" alt="" />
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>


/* Verhindert, dass das Multiselect zu schmal wird */
:deep(.multiselect) {
  width: 100%;
  min-height: 40px;
}

/* Container Look */
:deep(.multiselect__tags) {
  border-radius: 0.75rem; /* rounded-xl */
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.10);
  padding: 10px 40px 10px 12px;
  min-height: 40px;
}

/* Text im Feld */
:deep(.multiselect__single) {
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

/* Placeholder */
:deep(.multiselect__placeholder) {
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  padding: 0;
}

/* Pfeil mittig */
:deep(.multiselect__select) {
  height: 40px;
}

/* Dropdown */
:deep(.multiselect__content-wrapper) {
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgb(24 24 27); /* zinc-900 */
  overflow: hidden;
}

/* Optionen */
:deep(.multiselect__option) {
  color: rgba(255, 255, 255, 0.9);
}

/* Hover */
:deep(.multiselect__option--highlight) {
  background: rgba(16, 185, 129, 0.25); /* emerald-ish */
  color: white;
}

/* Selected */
:deep(.multiselect__option--selected) {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

/* Entfernt den roten Hintergrund, wenn man über die bereits gewählte Option fährt */
:deep(.multiselect__option--selected.multiselect__option--highlight) {
  background: rgba(16, 185, 129, 0.35);
  color: white;
}

/* Verhindert das "Deselect"-Rot komplett */
:deep(.multiselect__option--selected.multiselect__option--highlight:after) {
  content: none;
}
</style>