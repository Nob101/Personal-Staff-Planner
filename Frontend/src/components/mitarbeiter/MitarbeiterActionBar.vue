<!-- MitarbeiterActionBar.vue -->
<!-- 
============================================================================
// Aufgaben dieser Datei:
// - Actionbar für alles bezüglich Mitarbeiter
// - Buttons zum hinzufügen eines neuen Mitarbeiter
// - Sortier- und Such-Funktionalität
// ============================================================================
-->

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
  <!-- Sticky ActionBar -->
  <div
    :class="[
      'ma-header',
      headerHidden ? 'ma-header--hidden' : 'ma-header--shown'
    ]"
  >

    <!-- Inhalt zentriert -->
    <div class="ma-header-inner">

      <!-- LINKS: Button -->
      <div class="justify-self-start h-10 flex items-center">
        <button
          type="button"
          @click="emit('mitarbeiterCreate')"
          class="ma-action-btn ma-action-btn--md ma-action-btn--emerald"
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
            class="ms ms-down"
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
            class="ma-search"
            @input="emit('searchMitarbeiter', search)"
          />
          <span class="ma-search-icon">
            <img :src="lupe_icon" class="h-4.5 w-4.5 opacity-60" alt="" />
          </span>
        </div>
      </div>

    </div>
  </div>
</template>
