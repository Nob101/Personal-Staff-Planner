<!-- MitarbeiterActionBar.vue -->

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import Multiselect from "vue-multiselect";

import hinzufuegen_icon from "@/assets/icons/hinzufuegen_icon.png";
import lupe_icon from "@/assets/icons/lupe_icon.svg";

const props = defineProps({
  modelValue: String,
  sortOptions: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "mitarbeiterCreate", "searchMitarbeiter"]);

const search = ref("");

// Findet das Objekt in den Optionen, das zum aktuellen String-Wert passt
const selectedOption = computed(() => {
  return props.sortOptions.find((o) => o.value === props.modelValue);
});

/* =========================================================
   Hide-on-scroll (down = hide, up = show) - wie DienstplanHeader
   ========================================================= */
const headerHidden = ref(false);
let lastY = 0;
let ticking = false;

function onScroll() {
  const y = window.scrollY || 0;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      const delta = y - lastY;

      // kleine Scroll-Zitterbewegungen ignorieren
      if (Math.abs(delta) > 6) {
        if (delta > 0 && y > 80) {
          headerHidden.value = true; // runter scrollen
        } else {
          headerHidden.value = false; // rauf scrollen
        }
        lastY = y;
      }

      ticking = false;
    });
    ticking = true;
  }
}

onMounted(() => {
  lastY = window.scrollY || 0;
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <!-- Sticky ActionBar wie DienstplanHeader -->
  <div
    :class="[
      'sticky top-12 z-50',
      'mx-auto w-full max-w-[1400px]',
      'grid grid-cols-3 items-center gap-4',
      'px-8 pt-2 pb-1',
      'bg-white/80 dark:bg-zinc-900/70',
      'backdrop-blur',
      'transition-transform duration-200 ease-out will-change-transform',
      headerHidden ? '-translate-y-[120%]' : 'translate-y-0'
    ]"
  >
    <!-- LINKS: Button -->
    <div class="justify-self-start h-10 flex items-center">
      <button
        type="button"
        @click="emit('mitarbeiterCreate')"
        class="inline-flex h-8 w-8 items-center justify-center rounded-xl
              bg-linear-to-b from-emerald-300 to-emerald-900
               hover:from-emerald-900 hover:to-emerald-300
         ring-1 ring-emerald-600/30
         shadow-sm
         transition active:scale-[0.97]"
        title="Neu anlegen"
      >
        <img
          :src="hinzufuegen_icon"
          class="h-5 w-5 opacity-70 group-hover:opacity-100"
          alt=""
        />
      </button>
    </div>

    <!-- MITTE: Sortierung -->
    <div class="justify-self-center h-10 flex items-center">
      <div class="w-60">
        <Multiselect
          class="ms"
          :options="sortOptions"
          :model-value="selectedOption"
          @update:model-value="val => emit('update:modelValue', val.value)"
          label="label"
          track-by="value"
          placeholder="Sortieren"
          :allow-empty="false"
          :searchable="false"
          select-label=""
          selected-label=""
          deselect-label=""
        >
          <template #singleLabel="{ option }">
            <span class="multiselect-label-text text-sm">
              {{ option.label }}
            </span>
          </template>
        </Multiselect>
      </div>
    </div>

    <!-- RECHTS: Suche -->
    <div class="justify-self-end h-10 flex items-center">
      <div class="relative w-64">
        <input
          v-model="search"
          type="text"
          placeholder="Suchen"
          class="h-9 w-full rounded-xl
                 bg-black/10 dark:bg-zinc-500
                 pl-10 pr-3
                 text-sm text-zinc-900 dark:text-white/90
                 outline-none
                 ring-1 ring-black/10 dark:ring-white/15
                 focus:ring-black/20 dark:focus:ring-white/30"
          @input="emit('searchMitarbeiter', search)"
        />
        <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
          <img :src="lupe_icon" class="h-4.5 w-4.5 opacity-60" alt="" />
        </span>
      </div>
    </div>
  </div>
</template>