<!-- MitarbeiterList.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps } from 'vue'
import MitarbeiterCard from '@/components/mitarbeiter/MitarbeiterCard.vue'
import plus from '@/assets/icons/plus-symbol.svg'

// Props: Liste der Mitarbeiter
const props = defineProps({
  mitarbeiter: {
    type: Array,
    required: true
  },
  filialen: { 
    type: Array, 
    required: true }
})

// Events: Bearbeiten und Löschen Klicks an Parent (MitarbeiterView.vue) weitergeben
const emit = defineEmits(['select', 'edit', 'create'])
</script>

<template>
    <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-extrabold tracking-tight text-white">Mitarbeiterübersicht</h1>

        <button
            type="button"
            @click="emit('create')"
            class="inline-flex items-center gap-2 rounded-xl
                border border-emerald-400/30 bg-emerald-500/55
                px-4 py-2 font-semibold text-zinc-950
                hover:bg-emerald-500 transition"
        >
            <img :src="plus" class="h-4 w-4" alt="Neu anlegen" />
            <span class="text-lg leading-none"></span>
            Neu anlegen
        </button>
    </div>
    <!--rendert alle Mitarbeiter die im mitarbeiter-Array sind-->
    <div class="mitarbeiter-list grid gap-6 font-sans sm:grid-cols-2 lg:grid-cols-3">
        <MitarbeiterCard
            v-for="m in mitarbeiter"
            :key="m.id"
            :mitarbeiter="m"
            :filialen="filialen"
            variant="list"
            @select="(m2) => emit('select', m2)"
            @edit="() => emit('edit', m)"
        />
    </div>
</template>