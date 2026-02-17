<script setup>
import Navbar from "@/components/global/Navbar.vue";
import { RouterView } from "vue-router";
import { useDarkMode } from "@/composables/useDarkMode.js";

useDarkMode(); // sorgt dafür, dass beim Start localStorage->dark sofort applied wird
</script>

<template>
  <Navbar />
  <RouterView />
</template>
