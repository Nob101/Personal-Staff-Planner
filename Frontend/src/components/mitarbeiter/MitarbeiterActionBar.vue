<!-- MitarbeiterActionBar.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { ref, computed } from 'vue'
import Multiselect from 'vue-multiselect'


import mitarbeiter_anlegen_icon from '@/assets/icons/plus.svg'
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
  <!-- Design: Header unter Navbar -->
<div class="mx-auto grid w-full max-w-[1400px] grid-cols-3 items-center px-6 pt-6 pb-0">
  <!-- LINKS: Button -->
  <div class="justify-self-start">
    <button
      type="button"
      @click="emit('mitarbeiterCreate')"
      class="group inline-flex items-center gap-2 whitespace-nowrap
             rounded-xl border border-white/10 bg-green-500/50
             px-4 py-2 text-sm font-semibold text-black
             hover:bg-green-500/80 hover:scale-[1.02]
             active:scale-[0.98]"
      title="Neu anlegen"
    >
      <img
        :src="mitarbeiter_anlegen_icon"
        class="h-6 w-6 opacity-70 group-hover:opacity-100"
        alt=""
      />
      Neu anlegen
    </button>
  </div>

  <!-- MITTE: Sortierung (echte Mitte vom Container) -->
  <div class="justify-self-center">
    <div class="min-w-[260px]">
      <Multiselect
        class="ms"
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

  <!-- RECHTS: Suche -->
  <div class="justify-self-end">
    <div class="relative w-72">
      <input
        v-model="search"
        type="text"
        placeholder="Suchen"
        class="h-10 w-full rounded-xl bg-black/10 dark:bg-zinc-500
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