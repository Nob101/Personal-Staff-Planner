<!-- FilialenList.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps } from 'vue'
import FilialenCard from '@/components/filialen/FilialenCard.vue'

// Props: Liste der Filialen und Mitarbeiter (für Mitarbeiteranzeige in der Card)
const props = defineProps({
  filialen: {
    type: Array,
    required: true
  },
  mitarbeiter: { 
    type: Array, 
    required: true 
  }
})

// Events: Bearbeiten und Löschen Klicks an Parent (FilialenView.vue) weitergeben
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <!-- rendert alle Filialen, die im filialen-Array sind -->
  <div class="filialen-list grid gap-4">
    <FilialenCard
      v-for="f in filialen"
      :key="f.id"
      :filialen="f"
      :mitarbeiter="mitarbeiter"
      @edit="() => emit('edit', f)"
      @delete="() => emit('delete', f)"
    />
  </div>
</template>