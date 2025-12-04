<!-- App.vue -->
<!-- TODO:
        - Routing definieren und umsetzen (Routing zu verschiedenen Views und Backend-Requests/Responses)
        - CSS/Tailwind Formatierung definieren 
-->

<script setup>
// Funktionalitäten und Komponenten importieren
import Navbar from '@/components/global/Navbar.vue';
import MitarbeiterView from '@/views/MitarbeiterView.vue';
</script>

<template>
  <Navbar />
  <MitarbeiterView />
</template>

<style scoped> 
</style>
