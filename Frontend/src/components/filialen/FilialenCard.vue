<!-- FilialenCard.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps } from 'vue'

// (Design) Icon-Buttons statt Textbuttons
import bearbeiten_icon from '@/assets/icons/bearbeiten_icon_solid.png'
import loeschen_icon from '@/assets/icons/loeschen_icon_solid.png'

const props = defineProps({
  filialen: { type: Object, required: true },

  // (Design) Zwei Layouts (list + detail). Ohne das kann man nicht umschalten.
  variant: {
    type: String,
    default: 'detail'
  }
})

// Events: Bearbeiten und Löschen Klicks an Parent (FilialenList.vue) weitergeben, diese gibt es dann an FilialenView.vue weiter.
const emit = defineEmits(['edit', 'delete', 'select'])

function handleEdit() {
  emit('edit', props.filialen)
}

function handleDelete() {
  emit('delete', props.filialen)
}

// (Design) List-Card klickbar -> parent kann Detail-Overlay öffnen
function handleSelect() {
  emit('select', props.filialen)
}

/*
// ZU ENTFERNEN in finaler Version, NICHT GEBRAUCHT
// Helper-Funktion: Hauptmitarbeiter dieser Filiale

const hauptMitarbeiter = computed(() =>
  props.mitarbeiter.filter(
    m => Number(m.hauptfiliale) === Number(props.filialen.fnr)
  )
)

// Helper-Funktion: Springer dieser Filiale
const springerMitarbeiter = computed(() =>
  props.mitarbeiter.filter(
    m => m.hauptfiliale === props.filialen.fnr && m.springer === true
  )
)
*/
</script>

<template>
  <!-- LIST VARIANT (Design) -->
  <article
    v-if="variant === 'list'"
    class="relative cursor-pointer rounded-2xl
         border border-black/10 dark:border-white/10
         bg-white dark:bg-linear-to-b dark:from-zinc-700/70 dark:to-zinc-900/80
         p-6 shadow-[0_12px_30px_rgba(0,0,0,0.45)]
         hover:border-black/20 dark:hover:border-white/20 hover:-translate-y-0.5 transition font-sans
         overflow-hidden"
    @click="handleSelect"
  >
    <!-- Farbleiste links (Logik: farbe) -->
    <div
      class="absolute left-0 top-0 h-full w-1.5 opacity-90"
      :style="{ backgroundColor: filialen.farbe || '#ccc' }"
    />

    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {{ filialen.filialname }}
      </h3>
    </div>

    <div class="mt-5 grid grid-cols-[1fr_1px_1fr] gap-5 text-sm text-zinc-700 dark:text-white/85">
  <!-- LINKS: Kontakt -->
  <div class="space-y-3 min-w-0">
    <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-800/80">
      Kontakt
    </div>

    <div class="space-y-2">
      <div class="flex justify-between gap-3 min-w-0">
        <span class="text-right min-w-0 truncate">{{ filialen.telefon || '-' }}</span>
      </div>

      <div class="flex justify-between gap-3 min-w-0">
        <span class="text-right min-w-0 truncate">{{ filialen.email || '-' }}</span>
      </div>
    </div>
  </div>

  <!-- Linie -->
  <div class="bg-white/15"></div>

  <!-- RECHTS: Adresse -->
  <div class="space-y-3 min-w-0">
    <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-800/80">
      Adresse
    </div>

    <div class="space-y-2">
      <div class="flex justify-between gap-3 min-w-0">
        <span class="text-right min-w-0 truncate">{{ filialen.strasse || '-' }}</span>
      </div>

      <div class="flex justify-between gap-3 min-w-0">
        <span class="text-right min-w-0 truncate">{{ filialen.plz || '-' }} {{ filialen.ort || '-' }}</span>
      </div>
    </div>
  </div>
</div>


    <div class="mt-4 text-xs text-white/50">
      Klicken für Details →
    </div>
  </article>

  <!-- DETAIL VARIANT (Design) -->
  <article
    v-else
    class="font-sans relative rounded-3xl border border-white/10
           bg-linear-to-b from-zinc-800/70 to-zinc-900/80
           p-10 shadow-[0_18px_45px_rgba(0,0,0,0.55)]
           overflow-hidden"
  >
    <!-- Farbleiste links (Logik: farbe) -->
    <div
      class="absolute left-0 top-0 h-full w-1.5 opacity-90"
      :style="{ backgroundColor: filialen.farbe || '#ccc' }"
    />

    <!-- Edit/Delete Buttons (Design) -->
    <div class="absolute right-6 top-6 flex gap-3">
      <button
        @click="handleEdit"
        class="flex items-center justify-center rounded-xl border border-white/15 bg-blue-500/35 px-3 py-3 hover:bg-blue-500/80 transition"
        type="button"
        title="Bearbeiten"
      >
        <img :src="bearbeiten_icon" class="h-5 w-5" alt="Bearbeiten" />
      </button>

      <button
        @click="handleDelete"
        class="flex items-center justify-center rounded-xl border border-red-400/30 bg-red-500/35 px-3 py-3 hover:bg-red-500/80 transition"
        type="button"
        title="Löschen"
      >
        <img :src="loeschen_icon" class="h-5 w-5" alt="Löschen" />
      </button>
    </div>

    <!-- Titel -->
    <div class="flex flex-col gap-3">
      <h1 class="text-4xl font-extrabold tracking-tight text-white">
        {{ filialen.filialname }}
      </h1>
      <div class="h-px w-full bg-white/10" />
    </div>

    <!-- LINKS | LINIE | RECHTS -->
    <div class="mt-10 grid grid-cols-[1fr_1px_1fr] gap-12 text-lg text-white/90">
      <!-- LINKS -->
      <section class="space-y-6">
        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Email</legend>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Email</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.email || '-' }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Telefon</legend>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Telefon</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.telefon || '-' }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Filialenfarbe</legend>
          <div class="flex items-center gap-3">
            <span
              class="h-5 w-5 rounded-md border border-white/20"
              :style="{ backgroundColor: filialen.farbe || '#ccc' }"
            />
            <span class="text-white/90">{{ filialen.farbe || 'Keine Farbe gesetzt' }}</span>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Algorithmus</legend>
          <div class="flex justify-between gap-4">
            <span class="font-semibold text-white">Algorithmus</span>
            <span class="min-w-0 text-right text-white truncate">{{ filialen.algorithmid ?? '-' }}</span>
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
              <span class="min-w-0 text-right text-white truncate">{{ filialen.strasse || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Postleitzahl</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.plz || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Ort</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.ort || '-' }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Land</span>
              <span class="min-w-0 text-right text-white truncate">{{ filialen.land || '-' }}</span>
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

<style scoped>
/* absichtlich leer: Design läuft über Tailwind-Klassen */
</style>