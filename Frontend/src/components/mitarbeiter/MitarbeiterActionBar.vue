<!-- MitarbeiterActionBar.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineEmits, ref, watch } from 'vue'
const emit = defineEmits(['mitarbeiterCreate', 'searchMitarbeiter'])  

const search = ref('')

watch(search, (val) => {
  emit('searchMitarbeiter', val)
})
</script>

<template>
  <div class="mitarbeiter-actionbar flex justify-end p-2 mb-4">
    <input v-model="search" type="text" placeholder="Suchen..." class ="search-input mr-4 p-2 border rounded" />
    <button class="bg-green-200 btnModalMitarbeiterCreate" @click="emit('mitarbeiterCreate')">Mitarbeiter hinzufügen</button>
  </div>
</template>