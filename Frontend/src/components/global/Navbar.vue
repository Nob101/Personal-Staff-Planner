<script setup>
import { useRoute } from "vue-router"
import { useDarkMode } from '@/composables/useDarkMode.js'
import logo from '@/assets/icons/PSP_Logo_Transparent.png';
import dienstplaene_icon from '@/assets/icons/dienstplaene_icon_solid.png'
import mitarbeiter_icon from '@/assets/icons/mitarbeiter_icon_solid.png'
import filialen_icon from '@/assets/icons/store.png'
import einstellungen_icon from '@/assets/icons/einstellungen_icon.png.png'
import { ref } from 'vue';


const search = ref("");

// Emits (für Suche)
const emit = defineEmits(["search"])

//!! To-Do: Link von offener Page soll gehighlighted werden, derzeit nicht der Fall
// Zugriff auf aktuelle Route
const route = useRoute()

const { isDark, toggle } = useDarkMode();
console.log("Navbar mounted, isDark:", isDark.value)
</script>


<template>
  <header class="border-b border-black/10 dark:border-white/10 bg-zinc-200 dark:bg-zinc-500">
    <div class="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6">

      <!-- Logo links -->
      <div class="flex items-baseline gap-3">
        <img :src="logo" alt="Personal Staff Planner Logo" class="h-15 w-15" />
      </div>

      <!-- Navigation -->
      <nav class="flex items-center gap-6">
        <!-- Dienstpläne -->
        <RouterLink
          to="/dienstplaene"
          class="flex items-center gap-2 px-4 py-2 text-xl 
                font-sans font-medium
                text-zinc-700 dark:text-white/70
                border-b-2 border-transparent
                hover:border-zinc-400 dark:hover:border-white/60
                hover:text-zinc-900 dark:hover:text-white
                transition-colors"
          active-class="border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
        >
          <img :src="dienstplaene_icon" alt="" class="h-7 w-7 -ml-1.75" />
          <span>Dienstpläne</span>
        </RouterLink>

        <!-- Mitarbeiter -->
        <RouterLink
          to="/mitarbeiter"
          class="flex items-center gap-2 px-4 py-2 text-xl
                font-sans font-medium
                text-zinc-700 dark:text-white/70
                border-b-2 border-transparent
                hover:border-zinc-400 dark:hover:border-white/60
                hover:text-zinc-900 dark:hover:text-white
                transition-colors"
          active-class="border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
        >
          <img :src="mitarbeiter_icon" class="h-7 w-7 -ml-2" />
          Mitarbeiter
        </RouterLink>

        <!-- Filialen -->
        <RouterLink
          to="/filialen"
          class="flex items-center gap-2 px-4 py-2 text-xl
                font-sans font-medium
                text-zinc-700 dark:text-white/70
                border-b-2 border-transparent
                hover:border-zinc-400 dark:hover:border-white/60
                hover:text-zinc-900 dark:hover:text-white
                transition-colors"
          active-class="border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
        >
          <img :src="filialen_icon" alt="" class="h-7 w-7 -ml-1" />
          <span>Filialen</span>
        </RouterLink>

        <!-- Einstellungen -->
        <RouterLink
          to="/einstellungen"
          class="flex items-center gap-2 px-4 py-2 text-xl
                font-sans font-medium
                text-zinc-700 dark:text-white/70
                border-b-2 border-transparent
                hover:border-zinc-400 dark:hover:border-white/60
                hover:text-zinc-900 dark:hover:text-white
                transition-colors"
          active-class="border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
        >
          <img :src="einstellungen_icon" alt="" class="h-7 w-7 -ml-2" />
          <span>Einstellungen</span>
        </RouterLink>
      </nav>

      <!-- RECHTS: Search + Darkmode -->
      <div class="flex items-center gap-4">
        

        <!-- Dark Mode Button -->
        <button
          @click="toggle"
          class="h-9 px-4 rounded-xl font-semibold transition
                bg-black/10 dark:bg-black/30
                text-zinc-900 dark:text-white/90
                ring-1 ring-black/10 dark:ring-white/15
                hover:bg-black/20 dark:hover:bg-black/40
                focus:outline-none focus:ring-black/20 dark:focus:ring-white/30"
          :title="isDark ? 'Light Mode' : 'Dark Mode'"
        >
          <span class="text-xl">{{ isDark ? "☀️" : "🌙" }}</span>
        </button>

      </div>

    </div>
  </header>
</template>