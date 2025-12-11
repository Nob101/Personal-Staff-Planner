<!-- MitarbeiterActionBar.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineEmits } from 'vue'
const emit = defineEmits(['mitarbeiterCreate'])     
</script>

<template>
  <div class="mitarbeiter-actionbar flex justify-end p-2 mb-4">
    <button class="bg-green-200 btnModalMitarbeiterCreate" @click="emit('mitarbeiterCreate')">Mitarbeiter hinzufügen</button>
  </div>
</template>