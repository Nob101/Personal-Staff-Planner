<!-- FilialenList.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps } from 'vue'
import FilialenCard from '@/components/filialen/FilialenCard.vue'

// Props: Liste der Filialen und Mitarbeiter (für Mitarbeiteranzeige in der Card)
const props = defineProps({
  filialen: {
    type: Array,
    required: true
  },
  mitarbeiter: {
    type: Array,
    required: true
  }
})

// Events: Bearbeiten und Löschen Klicks an Parent (FilialenView.vue) weitergeben
const emit = defineEmits(['select', 'edit', 'delete', 'create'])
</script>

<template>
  <div class="mb-6 flex items-center justify-between">
    <h1 class="text-3xl font-extrabold tracking-tight text-white">Filialenübersicht</h1>
    <button
      type="button"
      @click="emit('create')"
      class="inline-flex items-center gap-2 rounded-xl
             border border-emerald-400/30 bg-emerald-500/35
             px-4 py-2 font-semibold text-white
             hover:bg-emerald-500/25 transition"
    >
      <span class="text-lg leading-none">＋</span>
      Neu anlegen
    </button>
  </div>
  <!-- rendert alle Filialen, die im filialen-Array sind -->
  <div class="filialen-list grid gap-6 font-sans sm:grid-cols-2 lg:grid-cols-3">
    <FilialenCard
      v-for="f in filialen"
      :key="f.id"
      :filialen="f"
      :mitarbeiter="mitarbeiter"
      variant="list"
      @select="(f2) => emit('select', f2)"
      @edit="() => emit('edit', f)"
      @delete="() => emit('delete', f)"
    />
  </div>
</template>
