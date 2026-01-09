<!-- MitarbeiterList.vue -->

<!-- ALT (bleibt auskommentiert) -->
<!--
<script setup>
import { defineProps } from 'vue'
import MitarbeiterCard from '@/components/mitarbeiter/MitarbeiterCard.vue'

const props = defineProps({
  mitarbeiter: { type: Array, required: true },
  filialen: { type: Array, required: true }
})

const emit = defineEmits(['edit', 'delete'])
</script>

<template>
  <div class="mitarbeiter-list grid gap-4">
    <MitarbeiterCard
      v-for="m in mitarbeiter"
      :key="m.id"
      :mitarbeiter="m"
      :filialen="filialen"
      @edit="() => emit('edit', m)"
      @delete="() => emit('delete', m)"
    />
  </div>
</template>
-->

<!-- NEU -->
<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  mitarbeiter: { type: Array, required: true },
  filialen: { type: Array, required: true }, // bleibt drin (wird ggf. später wieder gebraucht)
});

const emit = defineEmits(["select"]);
</script>

<template>
  <div class="grid gap-6 font-sans sm:grid-cols-2 lg:grid-cols-3">
    <article
      v-for="m in mitarbeiter"
      :key="m.mnr ?? m.id"
      class="relative cursor-pointer rounded-2xl border border-white/10
             bg-linear-to-b from-zinc-800/70 to-zinc-900/80
             p-6 shadow-[0_12px_30px_rgba(0,0,0,0.45)]
             hover:border-white/20 hover:-translate-y-0.5 transition"
      @click="emit('select', m)"
    >
      <!-- Header -->
      <div class="flex items-center justify-between gap-3">
        <h3 class="text-xl font-extrabold tracking-tight text-white">
          {{ m.vorname }} {{ m.nachname }}
        </h3>

        <span
          class="h-3 w-3 rounded-full"
          :class="m.springer ? 'bg-green-400' : 'bg-white/30'"
          :title="m.springer ? 'Springer' : 'Kein Springer'"
        />
      </div>

      <!-- Inhalt: 2 Spalten -->
      <div class="mt-5 grid grid-cols-2 gap-5 text-sm text-white/85">
      <!-- LINKS -->
      <div class="space-y-2">
        <div class="flex justify-between gap-3">
          <span class="font-semibold text-white">Hauptfiliale:</span>
          <span class="text-right">{{ m.hauptfiliale?.name ?? "-" }}</span>
        </div>

        <div class="flex justify-between gap-3">
          <span class="font-semibold text-white">Arbeitsstunden:</span>
          <span class="text-right">
            {{ m.arbeitsstunden ?? m.wochenstunden ?? m.arbeitnehmertyp ?? "-" }}
          </span>
        </div>

        <div class="flex justify-between gap-3">
          <span class="font-semibold text-white">Telefon:</span>
          <span class="text-right">{{ m.telefon1 ?? "-" }}</span>
        </div>

        <div class="flex justify-between gap-3">
          <span class="font-semibold text-white">Email:</span>
          <span class="text-right">{{ m.email1 ?? "-" }}</span>
        </div>
      </div>

      <!-- RECHTS mit vertikalem Trennstrich -->
      <div class="space-y-2 border-l border-white/15 pl-5">
        <div class="font-semibold text-white">Nebenfilialen:</div>

        <ul
          v-if="m.nebenfilialen?.length"
          class="space-y-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          <li
            v-for="(f, idx) in m.nebenfilialen"
            :key="f?.fnr ?? f?.id ?? idx"
            class="rounded-lg border border-white/10 bg-black/20 px-3 py-1 text-white/90"
          >
            {{ f?.name ?? f?.filialname ?? "-" }}
          </li>
        </ul>

        <div v-else class="text-white/70">-</div>
      </div>
    </div>
      <div class="mt-4 text-xs text-white/50">
        Klicken für Details →
      </div>
    </article>
  </div>
</template>


