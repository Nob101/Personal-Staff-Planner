<!-- FilialenActionBar.vue -->
<script setup>
/**
 * Aktionsleiste für die Filialen-Ansicht.
 * Beinhaltet die Suche, Sortierung und den "Hinzufügen"-Button.
 */

// Funktionalitäten und Komponenten importieren
import { ref, computed, watch } from 'vue'
import Multiselect from 'vue-multiselect'

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
  <div class="filialen-actionbar flex flex-wrap justify-between items-center p-2 mb-4 gap-2">
    <div class="flex gap-2">
      <input
        v-model="search"
        type="text"
        placeholder="Suchen..."
        class="search-input p-2 border rounded"
      />

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

    <button
      class="bg-green-200 px-3 py-2 rounded transition-colors hover:bg-green-300"
      @click="emit('filialeCreate')"
    >
      Filiale hinzufügen
    </button>
  </div>
</template>

<style scoped>
.search-input {
  min-width: 180px;
}

/* Verhindert, dass das Multiselect zu schmal wird */
:deep(.multiselect) {
  min-width: 250px;
  width: auto;
}

/* Sorgt dafür, dass der Text im Feld nicht abgeschnitten wird */
:deep(.multiselect__single) {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  padding-right: 20px;
}

:deep(.multiselect__select) {
  height: 38px; /* Richtet den Pfeil mittig aus */
}

:deep(.multiselect__element) {
  line-height: 1.5;
}

/* Entfernt den roten Hintergrund beim Hovern über selektierte Option */
:deep(.multiselect__option--selected.multiselect__option--highlight) {
  background: #41b883; 
  color: white;
}

/* Verhindert das "Deselect"-Rot und Hilfstexte komplett */
:deep(.multiselect__option--selected.multiselect__option--highlight:after) {
  content: none;
}

/* Neutrales Styling für das bereits gewählte Element in der Liste */
:deep(.multiselect__option--selected) {
  background: #f3f3f3;
  color: #333;
}
</style>