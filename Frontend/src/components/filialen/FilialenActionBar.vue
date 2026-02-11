<!-- FilialenActionBar.vue -->
<script setup>
/**
 * Aktionsleiste für die Filialen-Ansicht.
 * Beinhaltet die Suche, Sortierung und den "Hinzufügen"-Button.
 */

// Funktionalitäten und Komponenten importieren
import { ref, computed, watch } from 'vue'
import Multiselect from 'vue-multiselect'

// (Design) Icons wie bei MitarbeiterActionBar
import filiale_anlegen_icon from '@/assets/icons/mitarbeiter_anlegen_icon_solid.svg' // falls du ein eigenes Filial-Icon hast: hier ersetzen
import lupe_icon from '@/assets/icons/lupe_icon_solid.svg'

const props = defineProps({
  modelValue: String,
  sortOptions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'filialeCreate', 'searchFiliale'])

const search = ref('')

// Suche (direkt ohne Debounce, wie gewünscht)
watch(search, (val) => {
  emit('searchFiliale', val)
})

// Findet das Objekt in den Optionen, das zum aktuellen String-Wert passt
const selectedOption = computed(() => {
  return props.sortOptions.find(o => o.value === props.modelValue)
})
</script>

<template>
  
  <div class="sticky top-16 z-40 font-sans bg-zinc-500/70 backdrop-blur">
    <div class="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-2 h-10">
      <!-- LINKS -->
      <div class="flex items-center gap-6">
        <button
          @click="emit('filialeCreate')"
          type="button"
          class="group inline-flex items-center gap-2 whitespace-nowrap
                 px-4 py-1 text-sm font-medium text-white/80
                 hover:text-white transition-colors font-sans"
        >
          <img
            :src="filiale_anlegen_icon"
            class="h-6 w-6 opacity-70 group-hover:opacity-100"
            alt=""
          />
          Neu anlegen
        </button>

        <!-- Sortierung -->
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

      <!-- RECHTS (Suche wie bei MitarbeiterActionBar) -->
      <div class="relative">
        <input
          v-model="search"
          type="text"
          placeholder="Suchen"
          class="h-8 w-72 rounded-md bg-black/10 dark:bg-black/30
                 pl-11 pr-3 text-sm text-zinc-900 dark:text-white/90
                 outline-none ring-1 ring-black/10 dark:ring-white/15
                 focus:ring-black/20 dark:focus:ring-white/30"
        />
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <img :src="lupe_icon" class="h-5 w-5 opacity-60" alt="" />
        </span>
      </div>
    </div>
  </div>
</template>

