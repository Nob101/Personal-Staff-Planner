<!-- MitarbeiterActionBar.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { ref, computed } from 'vue'
import Multiselect from 'vue-multiselect'

const props = defineProps({
  modelValue: String,
  sortOptions: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'mitarbeiterCreate', 'searchMitarbeiter'])

const search = ref('')

// Findet das Objekt in den Optionen, das zum aktuellen String-Wert passt
const selectedOption = computed(() => {
  return props.sortOptions.find(o => o.value === props.modelValue)
})
</script>

<template>
  <div class="mitarbeiter-actionbar flex flex-wrap justify-between items-center p-2 mb-4 gap-2">
    <div class="flex gap-2">
      <!-- Suchfeld -->
      <input
        v-model="search"
        type="text"
        placeholder="Suchen..."
        class="search-input p-2 border rounded"
        @input="emit('searchMitarbeiter', search)"
      />

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

    <button
      class="bg-green-200 px-3 py-2 rounded"
      @click="emit('mitarbeiterCreate')"
    >
      Mitarbeiter hinzufügen
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
  /* Verhindert, dass die Liste zu eng wirkt */
  line-height: 1.5;
}
/* Entfernt den roten Hintergrund, wenn man über die bereits gewählte Option fährt */
:deep(.multiselect__option--selected.multiselect__option--highlight) {
  background: #41b883; /* Das Standard-Grün von Multiselect - oder nimm deine Wunschfarbe */
  color: white;
}

/* Verhindert das "Deselect"-Rot komplett */
:deep(.multiselect__option--selected.multiselect__option--highlight:after) {
  content: none; /* Verhindert, dass Texte wie "Remove" erscheinen */
}

/* Optional: Wenn du willst, dass es beim Hovern über das gewählte Element 
   einfach gar nichts macht (kein Farbumschlag) */
:deep(.multiselect__option--selected) {
  background: #f3f3f3; /* Ein leichtes Grau für das aktive Element in der Liste */
  color: #333;
}
</style>