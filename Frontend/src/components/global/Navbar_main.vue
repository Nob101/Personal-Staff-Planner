<script setup>
import { ref } from "vue";
import { useDarkMode } from "@/composables/useDarkMode";

import logo from "@/assets/icons/PSP_Logo_Transparent.png";
import dienstplaene_icon from "@/assets/icons/dienstplaene_icon_solid.svg";
import mitarbeiter_icon from "@/assets/icons/mitarbeiter_icon_solid.svg";
import filialen_icon from "@/assets/icons/filialen_icon_solid.svg";
import einstellungen_icon from "@/assets/icons/einstellungen_icon_solid.svg";

// Dark Mode
const { isDark, toggle } = useDarkMode();

// optional, kannst du später löschen
const activeLink = ref("");
</script>

<!-- <template>
    <nav class="navbar">
        <div class="navbar-logo">
            <img v-bind:src="logo" alt="Personal Staff Planner Logo" class="logo-icon" />
        </div>
    <ul class="navbar-links">
      <li>
        <a href="Dienstpläne" v-bind:class="{ active: activeLink === 'Dienstpläne' }" @click="activeLink = 'Dienstpläne'">
          <img v-bind:src="dienstplaene_icon" alt="dienstplaene icon" class="logo-icon" />
          Dienstpläne
        </a>
      </li>
      <li>
        <a href="Mitarbeiter" v-bind:class="{ active: activeLink === 'Mitarbeiter' }" @click="activeLink = 'Mitarbeiter'">
          <img v-bind:src="mitarbeiter_icon" alt="mitarbeiter icon" class="logo-icon" />
          Mitarbeiter
        </a>
      </li>
      <li>
        <a href="Filialen" v-bind:class="{ active: activeLink === 'Filialen' }" @click="activeLink = 'Filialen'">
          <img v-bind:src="filialen_icon" alt="filialen icon" class="logo-icon" />
          Filialen
        </a>
      </li>
      <li>
        <a href="Einstellungen" v-bind:class="{ active: activeLink === 'Einstellungen' }" @click="activeLink = 'Einstellungen'">
          <img v-bind:src="einstellungen_icon" alt="einstellungen icon" class="logo-icon" />
          Einstellungen
        </a>
      </li>
    </ul>
    </nav>
</template> -->

<!--<template>
<nav class="navbar">
<div class="navbar-logo">
<img :src="logo" alt="Personal Staff Planner Logo" class="logo-icon" />
</div>
 
    <ul class="navbar-links">
<li>
<RouterLink to="/dienstplan" class="nav-link" active-class="active">
<img :src="dienstplaene_icon" alt="dienstplaene icon" class="logo-icon" />
          Dienstpläne
</RouterLink>
</li>
 
      <li>
<RouterLink to="/mitarbeiter" class="nav-link" active-class="active">
<img :src="mitarbeiter_icon" alt="mitarbeiter icon" class="logo-icon" />
          Mitarbeiter
</RouterLink>
</li>
 
      <li>
<RouterLink to="/filialen" class="nav-link" active-class="active">
<img :src="filialen_icon" alt="filialen icon" class="logo-icon" />
          Filialen
</RouterLink>
</li>
 
      <li>
<RouterLink to="/einstellungen" class="nav-link" active-class="active">
<img :src="einstellungen_icon" alt="einstellungen icon" class="logo-icon" />
          Einstellungen
</RouterLink>
</li>
</ul>
</nav>
</template>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-bottom: 2px solid #ccc;
}
.navbar-links {
  display: flex;
  flex: 1;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  margin-right: 50px;
  padding: 200;
}
.navbar-links li {
  display: flex;
  padding: 10px 20px;
  align-items: center;
}
/* .navbar-links li a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  display: flex;
  align-items: center;
} */
.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px; /* wichtig, sonst sieht active komisch aus */
}
/* .navbar-links li a.active {
  background-color: #007bff;
  color: white;
  border-radius: 6px;
} */
.nav-link.active {
  background-color: #007bff;
  color: white;
  border-radius: 6px;
}
.logo-icon {
  width: 40px;
  height: auto;
}
</style>-->

<template>
  <header class="border-b border-white/10 bg-zinc-200 dark:bg-zinc-800">
    <div class="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6">

      <!-- Logo links -->
      <div class="flex items-baseline gap-3">
        <img :src="logo" alt="Personal Staff Planner Logo" class="h-15 w-15" />
        <div class="relative bottom-2 font-sans italic text-zinc-900 dark:text-white">
          Personal Staff Planner
      </div>
</div>

      <!-- Tabs (RouterLinks) -->
      <nav class="flex items-center gap-6 text-zinc-800 dark:text-white/90">
        <RouterLink
          to="/dienstplan"
          class="flex items-center gap-2 px-4 py-2 text-xl 
                font-sans font-medium text-white/70
                border-b-2 border-transparent
                hover:border-white/60 hover:text-white
                transition-colors"
          active-class="border-white text-white"
        >
          <img :src="dienstplaene_icon" alt="" class="h-7 w-7 -ml-1.75" />
          <span>Dienstpläne</span>
        </RouterLink>

        <RouterLink
          to="/mitarbeiter"
          class="flex items-center gap-2 px-4 py-2 text-xl
                font-sans font-medium text-white/70
                border-b-2 border-transparent
              hover:border-white/60 hover:text-white
                transition-colors"
          active-class="border-white text-white"
        >
          <img :src="mitarbeiter_icon" class="h-7 w-7 -ml-2" />
          Mitarbeiter
        </RouterLink>

        <RouterLink
          to="/filialen"
          class="flex items-center gap-2 px-4 py-2 text-xl
            font-sans font-medium text-white/70
            border-b-2 border-transparent
          hover:border-white/60 hover:text-white
            transition-colors"
          active-class="border-white text-white"
        >
          <img :src="filialen_icon" alt="" class="h-7 w-7 -ml-1" />
          <span>Filialen</span>
        </RouterLink>

        <RouterLink
          to="/einstellungen"
          class="flex items-center gap-2 px-4 py-2 text-xl
            font-sans font-medium text-white/70
            border-b-2 border-transparent
            hover:border-white/60 hover:text-white
            transition-colors"
          active-class="border-white text-white"
        >
          <img :src="einstellungen_icon" alt="" class="h-7 w-7 -ml-2" />
          <span>Einstellungen</span>
        </RouterLink>
      </nav>

      <!-- Dark Mode Button rechts -->
      <button
        @click="toggle"
        class="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-zinc-900 hover:bg-zinc-50 transition
       dark:border-white/20 dark:bg-white/10 dark:text-white/90 dark:hover:bg-white/15"
        :title="isDark ? 'Light Mode' : 'Dark Mode'"
      >
        <span class="text-xl">{{ isDark ? "☀️" : "🌙" }}
          
        </span>
      </button>
    </div>
  </header>
</template>.