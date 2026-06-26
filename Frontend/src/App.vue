<script setup>
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import Navbar from "@/components/global/Navbar.vue";
import Footer from "@/components/global/Footer.vue";


const route = useRoute();

const hideNavbar = computed(() =>
  route.matched.some(r => r.meta?.hideNavbar === true)
  // optional zusätzlich per name:
  // || route.name === "login"
);
</script>

<template>
  
    <Navbar v-if="!hideNavbar" />
    <RouterView />
    <Footer />
  
</template>
