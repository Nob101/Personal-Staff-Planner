<!-- <!-- App.vue -->
<!-- TODO:
        - Routing definieren und umsetzen (Routing zu verschiedenen Views und Backend-Requests/Responses)
        - CSS/Tailwind Formatierung definieren 
-->

<!-- <script setup>
// Funktionalitäten und Komponenten importieren
import Navbar from '@/components/global/Navbar.vue';
import MitarbeiterView from '@/views/MitarbeiterView.vue';
import LoginView from '@/views/LoginView.vue';
</script>

<template>
  <!-- <LoginView /> -->
   <!-- <Navbar />
   <MitarbeiterView />
</template>

<style scoped> 
</style> -->

<script setup>

import Navbar_main from "@/components/global/Navbar_main.vue";
</script>
 
<template>
  <div class="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
    <Navbar_main />
    <RouterView />
  </div>
</template>

 