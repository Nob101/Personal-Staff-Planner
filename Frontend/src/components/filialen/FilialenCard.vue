<!-- FilialenCard.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps, defineEmits, computed } from 'vue'
import bearbeiten_icon from '@/assets/icons/bearbeiten_icon_solid.png'
import loeschen_icon from '@/assets/icons/loeschen_icon_solid.png'

const props = defineProps({
  filialen: {
    type: Object,
    required: true
  },
  mitarbeiter: { type: Array, required: true },
  variant: {  // für Listenasicht
    type: String,
    default: 'detail'
  }
})

// Events: Bearbeiten und Löschen Klicks an Parent (FilialenList.vue) weitergeben, diese gibt es dann an FilialenView.vue weiter.
const emit = defineEmits(['select', 'edit', 'delete'])

function handleEdit() {
  emit('edit', props.filialen)
}

function handleDelete() {
  emit('delete', props.filialen)
}

function handleSelect() {
  emit('select', props.filialen)
}

// Helper-Funktion: Hauptmitarbeiter dieser Filiale
const hauptMitarbeiter = computed(() =>
  props.mitarbeiter.filter(m => m.hauptfiliale === props.filialen.id)
)

// Helper-Funktion: Springer dieser Filiale
const springerMitarbeiter = computed(() =>
  props.mitarbeiter.filter(
    m => m.hauptfiliale === props.filialen.id && m.springer === true
  )
)
</script>

<template>
  <article
    v-if="variant === 'list'"
    class="relative cursor-pointer rounded-2xl border border-white/10
           bg-linear-to-b from-zinc-700/70 to-zinc-900/80
           p-6 shadow-[0_12px_30px_rgba(0,0,0,0.45)]
           hover:border-white/20 hover:-translate-y-0.5 transition font-sans
           overflow-hidden"
    @click="handleSelect"
  >
    <!-- Farbleiste links -->
    <div
      class="absolute left-0 top-0 h-full w-1.5 opacity-90"
      :style="{ backgroundColor: filialen.color || '#ccc' }"
    />

    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xl font-extrabold tracking-tight text-white">
        {{ filialen.name }}
      </h3>
    </div>

    <div class="mt-5 grid grid-cols-2 gap-5 text-sm text-white/85">
      <!-- LINKS -->
      <div class="space-y-2">
        <div class="flex justify-between gap-3">
          <span class="font-semibold text-white">Telefon:</span>
          <span class="text-right min-w-0 truncate">{{ filialen.telefon1 || "-" }}</span>
        </div>

        <div class="flex justify-between gap-3 min-w-0">
          <span class="font-semibold text-white shrink-0">Email:</span>
          <span class="text-right min-w-0 truncate">{{ filialen.email1 || "-" }}</span>
        </div>

        <div class="flex justify-between gap-3">
          <span class="font-semibold text-white">Ort:</span>
          <span class="text-right min-w-0 truncate">{{ filialen.ort || "-" }}</span>
        </div>
      </div>

      <!-- RECHTS -->
      <div class="space-y-2 border-l border-white/15 pl-5">
        <div class="font-semibold text-white">Springer:</div>
        <div class="text-white/90 min-w-0 truncate">
          <template v-if="springerMitarbeiter.length">
            <template v-for="(m, index) in springerMitarbeiter" :key="m.id">
              {{ m.vorname }} {{ m.nachname }}<span v-if="index < springerMitarbeiter.length - 1">, </span>
            </template>
          </template>
          <template v-else>-</template>
        </div>
      </div>
    </div>

    <div class="mt-4 text-xs text-white/50">
      Klicken für Details →
    </div>
  </article>

  <article
    v-else
    class="font-sans relative rounded-3xl border border-white/10
           bg-linear-to-b from-zinc-800/70 to-zinc-900/80
           p-10 shadow-[0_18px_45px_rgba(0,0,0,0.55)]
           overflow-hidden"
  >
    <!-- Farbleiste links -->
    <div
      class="absolute left-0 top-0 h-full w-1.5 opacity-90"
      :style="{ backgroundColor: filialen.color || '#ccc' }"
    />

    <!-- Edit/Delete Buttons -->
    <div class="absolute right-6 top-6 flex gap-3">
      <button
        @click="handleEdit"
        class="flex items-center justify-center rounded-xl border border-white/15 bg-blue-500/35 px-3 py-3 hover:bg-blue-500/15 transition"
        type="button"
        title="Bearbeiten"
      >
        <img :src="bearbeiten_icon" class="h-5 w-5" alt="Bearbeiten" />
      </button>

      <button
        @click="handleDelete"
        class="flex items-center justify-center rounded-xl border border-red-400/30 bg-red-500/35 px-3 py-3 hover:bg-red-500/25 transition"
        type="button"
        title="Löschen"
      >
        <img :src="loeschen_icon" class="h-5 w-5" alt="Löschen" />
      </button>
    </div>

    <!-- Titel -->
    <div class="flex flex-col gap-3">
      <h1 class="text-4xl font-extrabold tracking-tight text-white">
        {{ filialen.name }}
      </h1>
      <div class="h-px w-full bg-white/10" />
    </div>

    <!-- Columns -->
    <div class="mt-10 grid grid-cols-[1fr_1px_1fr] gap-12 text-lg text-white/90">
      <!-- LINKS -->
      <section class="space-y-6">
        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Email</legend>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Email 1</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.email1 || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Email 2</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.email2 || "-" }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Telefon</legend>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Telefon 1</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.telefon1 || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Telefon 2</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.telefon2 || "-" }}</span>
            </div>
          </div>
        </fieldset>
      </section>

      <!-- Linie -->
      <div class="bg-white/15"></div>

      <!-- RECHTS -->
      <section class="space-y-6">
        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Adresse</legend>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Straße</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.strasse || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Postleitzahl</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.postleitzahl || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Ort</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.ort || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Land</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.land || "-" }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Mitarbeiter</legend>

          <div class="space-y-3">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Hauptmitarbeiter</span>
              <span class="min-w-0 text-right text-white truncate">
                <template v-if="hauptMitarbeiter.length">
                  <template v-for="(m, index) in hauptMitarbeiter" :key="m.id">
                    {{ m.vorname }} {{ m.nachname }}<span v-if="index < hauptMitarbeiter.length - 1">, </span>
                  </template>
                </template>
                <template v-else>-</template>
              </span>
            </div>

            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Springer dieser Filiale</span>
              <span class="min-w-0 text-right text-white truncate">
                <template v-if="springerMitarbeiter.length">
                  <template v-for="(m, index) in springerMitarbeiter" :key="m.id">
                    {{ m.vorname }} {{ m.nachname }}<span v-if="index < springerMitarbeiter.length - 1">, </span>
                  </template>
                </template>
                <template v-else>-</template>
              </span>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Anmerkungen</legend>
          <textarea
            rows="4"
            :value="filialen.anmerkungen || ''"
            readonly
            class="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-white/90 outline-none"
          ></textarea>
        </fieldset>
      </section>
    </div>
  </article>
</template>
