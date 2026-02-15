<!-- MitarbeiterCard.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps, computed } from 'vue'
import bearbeiten_icon from '@/assets/icons/bearbeiten_icon_solid.png'
import loeschen_icon from '@/assets/icons/loeschen_icon_solid.png'

const props = defineProps({
  mitarbeiter: {
    type: Object,
    required: true
  },
  filialen: { type: Array, required: true },

  
  // WHY: Design hat zwei Layouts (list + detail). Ohne prop kann man das nicht umschalten.
  variant: {
    type: String,
    default: 'detail'
  }
})

// Events: Bearbeiten und Löschen Klicks an Parent (MitarbeiterList.vue) weitergeben, diese gibt es dann an MitarbeiterView.vue weiter.
const emit = defineEmits([
  'edit',
  'delete',

  // (notwendig fürs Design): select Event
  // WHY: In List-Ansicht soll ein Klick auf die Card den Mitarbeiter "auswählen" (Overlay/Detail).
  'select'
])

// Helper für Hauptfiliale-Name, damit der Name anstatt der ID angezeigt wird
const hauptfilialeName = computed(() =>
 props.mitarbeiter.hauptfiliale?.name ?? "-"
);

// Helper für Nebenfilialen-Namen, damit der Name anstatt der ID angezeigt wird
////map geht jedes Element des Arrays durch und gibt für jede ID den Filialnamen zurück, so dass am Ende ein neues Array mit Namen entsteht
const nebenfilialenNamen = computed(() =>
 props.mitarbeiter.nebenfilialen?.length
   ? props.mitarbeiter.nebenfilialen.map(f => f.name).join(", ")
   : "-"
);


function handleEdit() {
  emit('edit', props.mitarbeiter)
}

function handleDelete() {
  emit('delete', props.mitarbeiter)
}


// WHY: List-Card klickbar -> parent kann Detail-Overlay öffnen
function handleSelect() {
  emit('select', props.mitarbeiter)
}
</script>

<template>
  <!-- LIST VARIANT (Design) -->
  <article
    v-if="variant === 'list'"
    class="relative cursor-pointer rounded-2xl
       border border-black/10 dark:border-white/10
       bg-white dark:bg-linear-to-b dark:from-zinc-700/70 dark:to-zinc-900/80
       p-6 shadow-[0_12px_30px_rgba(0,0,0,0.45)]
       hover:border-black/20 dark:hover:border-white/20 hover:-translate-y-0.5 transition font-sans"
    @click="handleSelect"
  >
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}
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
            <span class="text-right min-w-0 truncate">{{ mitarbeiter.telefon1 ?? '-' }}</span>
          </div>

          <div class="flex justify-between gap-3 min-w-0">
            <span class="text-right min-w-0 truncate">{{ mitarbeiter.email1 ?? '-' }}</span>
          </div>

          <div class="flex justify-between gap-3 min-w-0">
            <span class="shrink-0">Filiale {{ hauptfilialeName }}</span>
          </div>

          <div class="flex justify-between gap-3 min-w-0">
            <span class="shrink-0">{{ mitarbeiter.arbeitsstunden ?? '-' }} Arbeitsstunden</span>
          </div>
        </div>
      </div>

      <!-- Linie -->
      <div class="bg-black/10 dark:bg-white/15"></div>

      <!-- RECHTS: Nebenfilialen (List) -->
      <div class="space-y-2 min-w-0">
        <div class="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-800/80">
          Nebenfilialen
        </div>

        <div class="line-clamp-3">
          <div class="flex flex-wrap gap-1">
            <span
              v-for="f in mitarbeiter.nebenfilialen"
              :key="f.id"
              class="rounded-full border border-black/10 dark:border-white/10
                    bg-black/5 dark:bg-white/10
                    px-2 py-0.5 text-xs text-zinc-700 dark:text-white/90"
            >
              {{ f.name }}
            </span>
          </div>
        </div>
      </div>
    </div>


    <div class="mt-4 text-xs text-white/50">
      Klicken für Details →
    </div>
  </article>

  <!--  DETAIL VARIANT (Design) -->
  <article
    v-else
    class="font-sans relative rounded-3xl border border-white/10
           bg-linear-to-b from-zinc-800/70 to-zinc-900/80
           p-10 shadow-[0_18px_45px_rgba(0,0,0,0.55)]
           overflow-hidden"
  >
    <!-- Actions oben rechts -->
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
      <h1 class="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}
      </h1>
      <div class="h-px w-full bg-black/10 dark:bg-white/10" />
    </div>

    <!-- LINKS | LINIE | RECHTS -->
    <div class="mt-10 grid grid-cols-[1fr_1px_1fr] gap-12 text-lg text-white/90">
      <!-- LINKS -->
      <section class="space-y-6">
        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Email</legend>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Email 1:</span>
              <span class="min-w-0 text-right text-white truncate">{{ mitarbeiter.email1 || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Email 2:</span>
              <span class="min-w-0 text-right text-white truncate">{{ mitarbeiter.email2 || "-" }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Telefon</legend>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Telefon 1:</span>
              <span class="min-w-0 text-right text-white truncate">{{ mitarbeiter.telefon1 || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Telefon 2:</span>
              <span class="min-w-0 text-right text-white truncate">{{ mitarbeiter.telefon2 || "-" }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Filialen</legend>
          <div class="space-y-3">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Hauptfiliale:</span>
              <span class="min-w-0 text-right text-white truncate">{{ hauptfilialeName }}</span>
            </div>
            <div class="space-y-2">
              <div class="font-semibold text-white">Nebenfilialen:</div>

              <div class="flex flex-wrap gap-2">
                <span
                  v-for="f in mitarbeiter.nebenfilialen"
                  :key="f.id"
                  class="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/90"
                >
                  {{ f.name }}
                </span>
              </div>
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
              <span class="font-semibold text-white">Straße:</span>
              <span class="min-w-0 text-right text-white truncate">{{ mitarbeiter.strasse || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Postleitzahl:</span>
              <span class="min-w-0 text-right text-white truncate">{{ mitarbeiter.postleitzahl || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Ort:</span>
              <span class="min-w-0 text-right text-white truncate">{{ mitarbeiter.ort || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Land:</span>
              <span class="min-w-0 text-right text-white truncate">{{ mitarbeiter.land || "-" }}</span>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Arbeit</legend>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Arbeitsstunden:</span>
              <span class="min-w-0 text-right text-white truncate">{{ mitarbeiter.arbeitsstunden ?? "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Springer:</span>
              <span class="min-w-0 text-right text-white truncate">
                {{ mitarbeiter.springer ? 'Ja' : 'Nein' }}
              </span>
            </div>
          </div>
        </fieldset>

        <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">Anmerkungen</legend>
          <textarea
            rows="4"
            :value="mitarbeiter.anmerkungen || ''"
            readonly
            class="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-white/90 outline-none"
          ></textarea>
        </fieldset>
      </section>
    </div>
  </article>
</template>