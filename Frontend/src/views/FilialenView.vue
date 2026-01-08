<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/global/Navbar.vue'
import FilialenList from '@/components/filialen/FilialenList.vue';
import { http } from '@/services/http' // Pfad zu deiner http.js anpassen!

const mitarbeiter = ref([])
const filialen = ref([])

// Funktion zum Laden der echten Daten vom Backend
const loadData = async () => {
  try {
    // 1. Filialen laden (Singular 'filiale' laut deinem Schema/Repo)
    const resFilialen = await http.get('filiale'); 
    filialen.value = resFilialen.data;

    // 2. Mitarbeiter laden
    const resMitarbeiter = await http.get('mitarbeiter');
    mitarbeiter.value = resMitarbeiter.data;
    
    console.log("Daten erfolgreich geladen:", { 
      filialen: filialen.value, 
      mitarbeiter: mitarbeiter.value 
    });
  } catch (error) {
    console.error("Fehler beim Laden der Backend-Daten:", error);
  }
}

// Beim Starten der Komponente ausführen
onMounted(loadData);
</script>


<template>
    <Navbar />
    <FilialenList :filialen="filialen" :mitarbeiter="mitarbeiter" />
    <!-- <ColorPicker v-model="color" />-->
</template>