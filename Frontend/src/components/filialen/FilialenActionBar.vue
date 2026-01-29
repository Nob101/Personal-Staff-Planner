<!-- FilialenActionBar.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { ref, watch } from 'vue'
const emit = defineEmits(['filialeCreate', 'searchFiliale'])  

const search = ref('')

watch(search, (val) => {
  emit('searchFiliale', val)
})

</script>

<template>
  <div class="filialen-actionbar flex justify-end p-2 mb-4">
    <input v-model="search" type="text" placeholder="Suchen..." class ="search-input mr-4 p-2 border rounded" />
    <button class="bg-green-200 btnModalFilialeCreate" @click="emit('filialeCreate')">Filiale hinzufügen</button>
  </div>
</template>