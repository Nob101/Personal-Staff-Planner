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
//  (notwendig fürs Design/Overlay):
// - select: Klick auf Card öffnet Detail-Overlay
const emit = defineEmits(['select', 'edit', 'delete'])
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

  <div v-else class="mitarbeiter-list grid gap-6 font-sans sm:grid-cols-2 lg:grid-cols-3">
    <MitarbeiterCard
      v-for="m in mitarbeiter"
      :key="m.id"
      :mitarbeiter="m"
      :filialen="filialen"
      variant="list"
      @select="() => emit('select', m)"
      @edit="() => emit('edit', m)"
      @delete="() => emit('delete', m)"
    />
  </div>
</template>

