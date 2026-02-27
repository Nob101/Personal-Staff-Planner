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
         bg-linear-to-b from-zinc-500 to-zinc-700
         dark:from-zinc-700/70 dark:to-zinc-900/80
         backdrop-blur supports-backdrop-filter:bg-white/60"
>
  <div
    class="relative mx-auto flex h-12 w-full max-w-[1400px] items-center px-3"
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
    <nav class="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
      <RouterLink
        to="/dienstplaene"
        class="flex items-center gap-1.5 px-2.5 py-1.5
              text-base font-medium
              border-b-2 border-transparent
              transition-colors

              text-zinc-100 dark:text-white/70
              hover:text-white dark:hover:text-white
              hover:border-white dark:hover:border-white/60

              aria-[current=page]:text-white dark:aria-[current=page]:text-white
              aria-[current=page]:border-white dark:aria-[current=page]:border-white/60"
      >
        <img :src="dienstplaene_icon" class="h-5 w-5 -ml-0.5" />
        <span>Dienstpläne</span>
      </RouterLink>

      <RouterLink
        to="/mitarbeiter"
        class="flex items-center gap-1.5 px-2.5 py-1.5
              text-base font-medium
              border-b-2 border-transparent
              transition-colors

              text-zinc-100 dark:text-white/70
              hover:text-white dark:hover:text-white
              hover:border-white dark:hover:border-white/60

              aria-[current=page]:text-white dark:aria-[current=page]:text-white
              aria-[current=page]:border-white dark:aria-[current=page]:border-white/60"
      >
        <img :src="mitarbeiter_icon" class="h-5 w-5" />
        <span>Mitarbeiter</span>
      </RouterLink>

      <RouterLink
        to="/filialen"
        class="flex items-center gap-1.5 px-2.5 py-1.5
              text-base font-medium
              border-b-2 border-transparent
              transition-colors

              text-zinc-100 dark:text-white/70
              hover:text-white dark:hover:text-white
              hover:border-white dark:hover:border-white/60

              aria-[current=page]:text-white dark:aria-[current=page]:text-white
              aria-[current=page]:border-white dark:aria-[current=page]:border-white/60"
      >
        <img :src="filialen_icon" class="h-5 w-5 -ml-0.5" />
        <span>Filialen</span>
      </RouterLink>

      <RouterLink
        to="/benutzer"
        class="flex items-center gap-1.5 px-2.5 py-1.5
              text-base font-medium
              border-b-2 border-transparent
              transition-colors

              text-zinc-100 dark:text-white/70
              hover:text-white dark:hover:text-white
              hover:border-white dark:hover:border-white/60

              aria-[current=page]:text-white dark:aria-[current=page]:text-white
              aria-[current=page]:border-white dark:aria-[current=page]:border-white/60"
      >
        <img :src="benutzer_icon" class="h-5 w-5 -ml-0.5" />
        <span>Benutzer</span>
      </RouterLink>
    </nav>

  </div>
</header>
</template>


