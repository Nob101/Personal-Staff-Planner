<!-- MitarbeiterList.vue -->
<!-- TODO:
        - CSS und Container Formatierung definieren
        - Mitarbeiter in einzelnen Filialen (Hauptfiliale) Container gruppieren?
        - CSS/Tailwind Formatierung definieren 
-->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps } from 'vue'
import MitarbeiterCard from '@/components/mitarbeiter/MitarbeiterCard.vue'

// Props: Liste der Mitarbeiter
const props = defineProps({
  mitarbeiter: {
    type: Array,
    required: true
  }
})

// Events: Bearbeiten und Löschen Klicks an Parent (MitarbeiterView.vue) weitergeben
const emit = defineEmits(['edit', 'delete'])
</script>

<!---->
<template>
    <!--rendert alle Mitarbeiter die im mitarbeiter-Array sind-->
    <div class="mitarbeiter-list grid gap-4">
        <MitarbeiterCard
            v-for="mitarbeiter in mitarbeiter"
            :key="mitarbeiter.id"
            :mitarbeiter="mitarbeiter"
            @edit="() => emit('edit', mitarbeiter)"
            @delete="() => emit('delete', mitarbeiter)"
        />
    </div>
</template>