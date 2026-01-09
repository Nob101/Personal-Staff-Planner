<!-- MitarbeiterList.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps } from 'vue'
import MitarbeiterCard from '@/components/mitarbeiter/MitarbeiterCard.vue'

// Props: Liste der Mitarbeiter
const props = defineProps({
  mitarbeiter: {
    type: Array,
    required: true
  },
  filialen: { 
    type: Array, 
    required: true }
})

// Events: Bearbeiten und Löschen Klicks an Parent (MitarbeiterView.vue) weitergeben
const emit = defineEmits(['edit', 'delete'])
</script>

<template>
    <!--rendert alle Mitarbeiter die im mitarbeiter-Array sind-->
    <div class="mitarbeiter-list grid gap-4">
        <MitarbeiterCard
            v-for="m in mitarbeiter"
            :key="m.id"
            :mitarbeiter="m"
            :filialen="filialen"
            @edit="() => emit('edit', m)"
            @delete="() => emit('delete', m)"
        />
    </div>
</template>