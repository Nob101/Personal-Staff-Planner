<script setup>
import { useRoute } from "vue-router"
import { useDarkMode } from "@/composables/useDarkMode.js"
import logo from "@/assets/icons/PSP_Logo_Transparent.png"
import dienstplaene_icon from "@/assets/icons/dienstplaene_icon_solid.png"
import mitarbeiter_icon from "@/assets/icons/mitarbeiter_icon_solid.png"
import filialen_icon from "@/assets/icons/store.png"
import einstellungen_icon from "@/assets/icons/einstellungen_icon.png.png"
import { ref } from "vue"
import lupe_icon from "@/assets/icons/lupe_icon_solid.svg"

const search = ref("")
const emit = defineEmits(["search"])
const route = useRoute()
const { isDark, toggle } = useDarkMode()
</script>

<template>
  <header
    class="border-b border-black/10 dark:border-white/10
           bg-linear-to-b
           from-zinc-200 to-zinc-300
           dark:from-zinc-500 dark:to-zinc-600"
  >
    <div class="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-6">

      <!-- Logo -->
      <div class="flex items-baseline gap-3">
        <img :src="logo" alt="Personal Staff Planner Logo" class="h-15 w-15" />
      </div>

      <!-- Navigation -->
      <nav class="flex items-center gap-6">
        <RouterLink
          v-for="item in [
            { to: '/dienstplaene', label: 'Dienstpläne', icon: dienstplaene_icon, ml: '-ml-1.5' },
            { to: '/mitarbeiter', label: 'Mitarbeiter', icon: mitarbeiter_icon, ml: '-ml-2' },
            { to: '/filialen', label: 'Filialen', icon: filialen_icon, ml: '-ml-1' },
            { to: '/einstellungen', label: 'Einstellungen', icon: einstellungen_icon, ml: '-ml-2' },
          ]"
          :key="item.to"
          :to="item.to"
          class="relative flex items-center gap-2 px-4 py-2 text-xl font-medium
                 text-zinc-700 dark:text-white/70
                 hover:text-zinc-900 dark:hover:text-white
                 transition-colors
                 after:absolute after:-bottom-1 after:left-1/2
                 after:h-[2px] after:w-[95%]
                 after:-translate-x-1/2 after:scale-x-0
                 after:bg-zinc-900 dark:after:bg-white
                 after:transition-transform"
          active-class="text-zinc-900 dark:text-white after:scale-x-100"
        >
          <img :src="item.icon" class="h-7 w-7" :class="item.ml" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <!-- Rechts -->
      <div class="flex items-center gap-4">

        <!-- Search -->
        <div class="relative">
          <input
            v-model="search"
            placeholder="Suchen"
            class="h-9 w-60 rounded-xl bg-black/10 dark:bg-black/30
                   pl-11 pr-3 text-sm text-zinc-900 dark:text-white/90
                   outline-none ring-1 ring-black/10 dark:ring-white/15"
            @input="emit('search', search)"
          />
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <img :src="lupe_icon" class="h-5 w-5 opacity-60" />
          </span>
        </div>

        <!-- Darkmode -->
        <button
          @click="toggle"
          class="h-9 px-4 rounded-xl font-semibold
                 bg-black/10 dark:bg-black/30
                 text-zinc-900 dark:text-white/90
                 ring-1 ring-black/10 dark:ring-white/15"
        >
          <span class="text-xl">{{ isDark ? "☀️" : "🌙" }}</span>
        </button>
      </div>

    </div>
  </header>
</template>
