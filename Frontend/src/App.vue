<!-- App.vue -->
<!-- TODO:
        - Routing definieren und umsetzen (Routing zu verschiedenen Views und Backend-Requests/Responses)
        - CSS/Tailwind Formatierung definieren 
-->

<script setup>
// Import von Navbar. Die Views werden vom Router geregelt mit router-view
import Navbar from '@/components/global/Navbar.vue';

</script>

<template>
   <router-view />
</template>

<style scoped> 
</style>
