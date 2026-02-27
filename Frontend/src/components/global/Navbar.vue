<script setup>
import { useRoute } from "vue-router"
import { useDarkMode } from '@/composables/useDarkMode.js'
import logo from '@/assets/icons/PSP_Logo_Transparent.png';
import dienstplaene_icon from '@/assets/icons/dienstplaene_icon.svg'
import mitarbeiter_icon from '@/assets/icons/mitarbeiter_icon.svg'
import filialen_icon from '@/assets/icons/filialen_icon.svg'
import benutzer_icon from '@/assets/icons/benutzer_icon.svg'
import sonne_icon from '@/assets/icons/sonne_icon.svg'
import mond_icon from '@/assets/icons/mond_icon.svg'
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
<header
  class="sticky top-0 z-10000
         border-b border-black/10 dark:border-white/10
         bg-linear-to-b from-zinc-400 to-white
         dark:from-zinc-700/70 dark:to-zinc-900/80
         backdrop-blur supports-backdrop-filter:bg-white/60"
>
  <div
    class="mx-auto flex h-12 w-full max-w-[1400px]
           items-center justify-between px-3"
  >

    <!-- Logo -->
    <div class="flex items-center gap-2">
      <img
        :src="logo"
        alt="Personal Staff Planner Logo"
        class="h-8 w-8"
      />
    </div>

    <!-- Navigation -->
    <nav class="flex items-center gap-3">
      <RouterLink
        to="/dienstplaene"
        class="flex items-center gap-1.5 px-2.5 py-1.5
               text-base font-medium
               text-zinc-700 dark:text-white/70
               border-b-2 border-transparent
               hover:border-zinc-400 dark:hover:border-white/60
               hover:text-zinc-900 dark:hover:text-white
               transition-colors"
        active-class="border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
      >
        <img :src="dienstplaene_icon" class="h-5 w-5 -ml-0.5" />
        <span>Dienstpläne</span>
      </RouterLink>

      <RouterLink
        to="/mitarbeiter"
        class="flex items-center gap-1.5 px-2.5 py-1.5
               text-base font-medium
               text-zinc-700 dark:text-white/70
               border-b-2 border-transparent
               hover:border-zinc-400 dark:hover:border-white/60
               hover:text-zinc-900 dark:hover:text-white
               transition-colors"
        active-class="border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
      >
        <img :src="mitarbeiter_icon" class="h-5 w-5 -ml-0.5" />
        <span>Mitarbeiter</span>
      </RouterLink>

      <RouterLink
        to="/filialen"
        class="flex items-center gap-1.5 px-2.5 py-1.5
               text-base font-medium
               text-zinc-700 dark:text-white/70
               border-b-2 border-transparent
               hover:border-zinc-400 dark:hover:border-white/60
               hover:text-zinc-900 dark:hover:text-white
               transition-colors"
        active-class="border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
      >
        <img :src="filialen_icon" class="h-5 w-5 -ml-0.5" />
        <span>Filialen</span>
      </RouterLink>

      <RouterLink
        to="/benutzer"
        class="flex items-center gap-1.5 px-2.5 py-1.5
               text-base font-medium
               text-zinc-700 dark:text-white/70
               border-b-2 border-transparent
               hover:border-zinc-400 dark:hover:border-white/60
               hover:text-zinc-900 dark:hover:text-white
               transition-colors"
        active-class="border-zinc-900 text-zinc-900 dark:border-white dark:text-white"
      >
        <img :src="benutzer_icon" class="h-5 w-5 -ml-0.5" />
        <span>Benutzer</span>
      </RouterLink>
    </nav>

    <!-- Darkmode -->
    <div class="flex items-center">
      <button
        @click="toggle"
        class="h-7 px-2.5 rounded-lg font-medium transition
               bg-black/10 dark:bg-black/30
               text-zinc-900 dark:text-white/90
               ring-1 ring-black/10 dark:ring-white/15
               hover:bg-black/20 dark:hover:bg-black/40"
      >
        <img
          :src="isDark ? mond_icon : sonne_icon"
          class="h-4 w-4"
        />
      </button>
    </div>

  </div>
</header>
</template>

