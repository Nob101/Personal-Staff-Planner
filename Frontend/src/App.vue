<!-- App.vue -->
<!-- TODO:
        - Routing definieren und umsetzen (Routing zu verschiedenen Views und Backend-Requests/Responses)
        - CSS/Tailwind Formatierung definieren 
-->

<script setup>
// Import von Navbar. Die Views werden vom Router geregelt mit router-view
import Navbar from '@/components/global/Navbar.vue';
import ColorPicker from './components/global/ColorPicker.vue';

</script>

<template>
        <Navbar />
        <router-view />

</template>

<style scoped> 
</style>