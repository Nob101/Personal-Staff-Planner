<script setup>
import { ref } from "vue";

import mitarbeiter_anlegen_icon from "@/assets/icons/mitarbeiter_anlegen_icon_solid.svg";
import filter_icon from "@/assets/icons/filter_icon_solid.svg";
import lupe_icon from "@/assets/icons/lupe_icon_solid.svg";

const emit = defineEmits(["mitarbeiterCreate", "filter", "search"]);
const search = ref("");
</script>

<template>
  <!-- MitarbeiterActionBar unter der Haupt-Navigation -->
  <div class="sticky top-16 z-40 font-sans bg-zinc-500/70 backdrop-blur">
    <div
      class="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-2 h-10"
    >
      <!-- LINKS -->
      <div class="flex items-center gap-6">
        <button
          @click="emit('mitarbeiterCreate')"
          type="button"
          class="group inline-flex items-center gap-2 whitespace-nowrap
         px-4 py-1 text-sm font-medium text-white/80
         hover:text-white transition-colors font-sans"
        >
          <img
            :src="mitarbeiter_anlegen_icon"
            class="h-6 w-6 opacity-70 group-hover:opacity-100"
            alt=""
          />
          Neu anlegen
        </button>

        <button
          @click="emit('filter')"
          type="button"
          class="group inline-flex items-center gap-2 whitespace-nowrap
         px-4 py-1 text-sm font-medium text-white/80
         hover:text-white transition-colors font-sans"
        >
          <img
            :src="filter_icon"
            class="h-6 w-6 opacity-70 group-hover:opacity-100 -ml-1"
            alt=""
          />
          Filtern
        </button>
      </div>

      <!-- RECHTS -->
      <div class="relative">
        <input
          v-model="search"
          @input="emit('search', search)"
          placeholder="Suchen"
          class="h-8 w-72 rounded-md bg-black/10 dark:bg-black/30
                 pl-11 pr-3 text-sm text-zinc-900 dark:text-white/90
                 outline-none ring-1 ring-black/10 dark:ring-white/15
                 focus:ring-black/20 dark:focus:ring-white/30"
        />
        <span
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
        >
          <img :src="lupe_icon" class="h-5 w-5 opacity-60" alt="" />
        </span>
      </div>
    </div>
  </div>
</template>
