<!-- FilialenActionBar.vue -->
<!-- 
============================================================================
// Aufgaben dieser Datei:
// - Actionbar für alles bezüglich Filialen
// - Buttons zum hinzufügen einer neuen Filialen
// - Sortier- und Such-Funktionalität
// ============================================================================
-->

<script setup>
// Funktionalitäten und Komponenten importieren
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import Multiselect from 'vue-multiselect'

// (Design) Icons wie bei MitarbeiterActionBar
import hinzufuegen_icon from '@/assets/icons/hinzufuegen_icon.png'
import lupe_icon from '@/assets/icons/lupe_icon.svg'

const props = defineProps({
  modelValue: String,
  sortOptions: {
    type: Array,
    required: true
  }
}) 

const emit = defineEmits(['update:modelValue', 'filialeCreate', 'searchFiliale'])

const search = ref('')

// Suche
watch(search, (val) => {
  emit('searchFiliale', val)
})

// Findet das Objekt in den Optionen, das zum aktuellen String-Wert passt
const selectedOption = computed(() => {
  return props.sortOptions.find(o => o.value === props.modelValue)
})

/* ========================================
   Hide-on-scroll (down = hide, up = show)
   ======================================== */
const headerHidden = ref(false);
let lastY = 0;
let ticking = false;

function onScroll() {
  const y = window.scrollY || 0;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      const delta = y - lastY;
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
  <!-- Sticky ActionBar über volle Breite -->
  <div
    :class="[
      'fi-header',
      headerHidden ? 'fi-header--hidden' : 'fi-header--shown'
    ]"
  >
    <!-- Inhalt bleibt wie bisher zentriert -->
    <div class="fi-header-inner">
      <!-- LINKS: Button -->
      <div class="justify-self-start h-10 flex items-center">
        <button
          type="button"
          @click="emit('filialeCreate')"
          class="fi-action-btn fi-action-btn--emerald"
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
              <span class="multiselect-label-text text-sm">{{ option.label }}</span>
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
            class="fi-search-input"
          />
          <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <img :src="lupe_icon" class="h-4.5 w-4.5 opacity-60" alt="" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
