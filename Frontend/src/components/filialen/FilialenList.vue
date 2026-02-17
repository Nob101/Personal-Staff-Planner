<!-- FilialenList.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps } from 'vue'
import FilialenCard from '@/components/filialen/FilialenCard.vue'
import BaseLoader from '@/components/global/BaseLoader.vue'

// Props: Liste der Filialen und Mitarbeiter (für Mitarbeiteranzeige in der Card)
const props = defineProps({
  filialen: {
    type: Array,
    required: true
  },
  mitarbeiter: { 
    type: Array, 
    required: true 
  },
  isLoading: { 
    type: Boolean, 
    required: true 
  }
})

// Events: Bearbeiten und Löschen Klicks an Parent (FilialenView.vue) weitergeben
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <!-- 1. Wenn Daten geladen werden -->
  <BaseLoader
    v-if="isLoading"
    text="Filialen werden geladen"
  />

  <!-- 2. Keine Filialen existieren nach Laden -->
  <p
    v-else-if="filialen.length === 0" class="hint">Es ist noch keine Filiale angelegt.</p>

  <!-- rendert alle Filialen, die im filialen-Array sind -->
  <div class="filialen-list grid gap-4">
    <FilialenCard
      v-for="f in filialen"
      :key="f.fnr"
      :filialen="f"
      :mitarbeiter="mitarbeiter"
      @edit="emit('edit', f)"
      @delete="emit('delete', f)"
    />
  </div>
</template>


<style scoped>
.hint {
  border: 1px dashed #ccc;
  background-color: #f9f9f9;
  color: #555;
  text-align: center;
  padding: 24px;
  border-radius: 8px;
  font-size: 1rem;
}
</style>