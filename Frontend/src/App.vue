<!-- App.vue -->
<!-- TODO:
        - Routing definieren und umsetzen (Routing zu verschiedenen Views und Backend-Requests/Responses)
        - CSS/Tailwind Formatierung definieren 
-->

<script setup>
// Import von Navbar. Die Views werden vom Router geregelt mit router-view
import Navbar_main from '@/components/global/Navbar_main.vue';

import { onMounted } from 'vue';
import { http } from '@/services/http.js';


/**
 * Verbindungstest (LUKAS)
 */
onMounted(async () => {
  try {
    // Abfrage an die Mitarbeiter, um die Leitung zu testen
    const response = await http.get('mitarbeiter');
    console.log("App.vue: Verbindung erfolgreich! Daten vom Server:", response.data);
    
  } catch (err) {
    console.error("Test-Verbindung fehlgeschlagen:", err);
  }
});

</script>

<template>
   <router-view />
</template>

<style scoped> 
</style>
