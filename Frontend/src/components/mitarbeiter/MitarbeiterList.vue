<!-- MitarbeiterList.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps } from 'vue'
import MitarbeiterCard from '@/components/mitarbeiter/MitarbeiterCard.vue'
import BaseLoader from '@/components/global/BaseLoader.vue'

// Props: Liste der Mitarbeiter
const props = defineProps({
  mitarbeiter: {
    type: Array,
    required: true
  },
  filialen: { 
    type: Array, 
    required: true 
  },
  isLoading: { 
    type: Boolean, 
    required: true 
  }
})

// Events: Bearbeiten und Löschen Klicks an Parent (MitarbeiterView.vue) weitergeben
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
    <BaseLoader
        v-if="isLoading"
        text="Mitarbeiter werden geladen"
    />

    <div v-else-if="mitarbeiter.length === 0 && filialen.length === 0" class="hint warning">
      <p>Es sind noch keine Mitarbeiter angelegt <strong>und</strong> es existiert noch keine Filiale.</p>
      <p>Sie müssen zuerst eine Filiale anlegen, bevor Sie Mitarbeiter hinzufügen können.</p>
    </div>

    <p v-else-if="mitarbeiter.length === 0" class="hint">
      Es ist noch kein Mitarbeiter angelegt.
    </p>

    <p v-else-if="filialen.length === 0" class="hint">
      Bitte legen Sie zuerst eine Filiale an.
    </p>
  
    <div v-else class="mitarbeiter-list grid gap-4">
      <MitarbeiterCard
        v-for="m in mitarbeiter"
        :key="m.id"
        :mitarbeiter="m"
        :filialen="filialen"
        @edit="emit('edit', m)"
        @delete="emit('delete', m)"
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