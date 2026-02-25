<!-- FilialenCard.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps } from 'vue'

// (Design) Icon-Buttons statt Textbuttons
import bearbeiten_icon from '@/assets/icons/bearbeiten_icon.png'
import loeschen_icon from '@/assets/icons/loeschen_icon.png'

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
    class="relative cursor-pointer font-sans
           overflow-hidden
           rounded-3xl
           bg-linear-to-b from-zinc-200 to-zinc-500
           shadow-[0_16px_40px_rgba(0,0,0,0.4)]
           hover:-translate-y-0.5 transition"
    @click="handleSelect"
  >
    <!-- Farbleiste links (Logik: farbe) -->
    <div
      class="absolute left-0 top-0 h-full w-1.5 opacity-90 rounded-l-3xl"
      :style="{ backgroundColor: filialen.farbe || '#ccc' }"
    />

    <div class="px-4 py-2">
      <h3 class="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {{ filialen.filialname }}
      </h3>

      <div class="mt-0.5 text-sm text-zinc-800 dark:text-white/80">
        {{ filialen.email || '-' }}
      </div>
    </div>

    <div class="px-4 pt-2 pb-3">
      <div class="rounded-2xl bg-white ring-1 ring-black/10">
        <div class="p-3">
          <div class="grid grid-cols-[1fr_1px_1fr] gap-5 text-sm text-zinc-700">
            <!-- LINKS: Kontakt -->
            <div class="space-y-3 min-w-0">
              <div class="text-l font-bold uppercase tracking-wide text-black">
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
            <div class="bg-black/10"></div>

            <!-- RECHTS: Adresse -->
            <div class="space-y-3 min-w-0">
              <div class="text-l font-bold uppercase tracking-wide text-black">
                Adresse
              </div>

              <div class="space-y-2">
                <div class="flex justify-between gap-3 min-w-0">
                  <span class="text-right min-w-0 truncate">{{ filialen.strasse || '-' }}</span>
                </div>

                <div class="flex justify-between gap-3 min-w-0">
                  <span class="text-right min-w-0 truncate">
                    {{ filialen.plz || '-' }} {{ filialen.ort || '-' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-3 text-xs text-zinc-400">
            Klicken für Details →
          </div>
        </div>
      </div>
    </div>
  </article>

  <!-- DETAIL VARIANT (Design) -->
  <article
    v-else
    class="mx-auto w-full max-w-[760px]
           font-sans relative overflow-hidden rounded-3xl
           bg-white/70 dark:bg-zinc-900/50
           shadow-[0_16px_40px_rgba(0,0,0,0.4)]
           backdrop-blur"
  >
    <!-- Farbleiste links (Logik: farbe) -->
    <div
      class="absolute left-0 top-0 h-full w-1.5 opacity-90 rounded-l-3xl"
      :style="{ backgroundColor: filialen.farbe || '#ccc' }"
    />

    <!-- HEADER -->
    <div class="bg-linear-to-b from-zinc-200 to-zinc-300">
      <div class="flex items-center justify-between gap-3 px-4 py-2">
        <div class="min-w-0">
          <div class="text-xl font-extrabold text-zinc-900 dark:text-white truncate">
            {{ filialen.filialname }}
          </div>
          <div class="text-[11px] text-zinc-600 dark:text-white/70 break-all">
            {{ filialen.email || '-' }}
          </div>
        </div>

        <!-- Edit/Delete Buttons (Design) -->
        <div
          class="flex items-center gap-1 rounded-xl
                 bg-white/60 dark:bg-white/10
                 ring-1 ring-black/10 dark:ring-white/10
                 p-1"
        >
          <button
            @click="handleEdit"
            class="inline-flex h-8 w-8 items-center justify-center rounded-xl
                   bg-linear-to-b from-blue-300 to-blue-900
                   hover:from-blue-900 hover:to-blue-300
                   ring-1 ring-blue-600/30 shadow-sm
                   transition active:scale-[0.97]"
            type="button"
            title="Bearbeiten"
          >
            <img :src="bearbeiten_icon" class="h-4 w-4 opacity-90" alt="Bearbeiten" />
          </button>

          <button
            @click="handleDelete"
            class="inline-flex h-8 w-8 items-center justify-center rounded-xl
                   bg-linear-to-b from-red-300 to-red-900
                   hover:from-red-900 hover:to-red-300
                   ring-1 ring-red-600/30 shadow-sm
                   transition active:scale-[0.97]"
            type="button"
            title="Löschen"
          >
            <img :src="loeschen_icon" class="h-4 w-4 opacity-90" alt="Löschen" />
          </button>
        </div>
      </div>
    </div>

    <div class="px-4 pt-2 pb-3 rounded-b-3xl bg-linear-to-b from-zinc-300 to-zinc-500">
      <div class="rounded-2xl bg-white/55 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10">
        <div class="p-4">
          <!-- LINKS | LINIE | RECHTS -->
          <div class="grid grid-cols-[1fr_1px_1fr] gap-5 text-sm text-zinc-900 dark:text-white/90">
            <!-- LINKS -->
            <section class="space-y-4 min-w-0">
              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend class="text-sm font-extrabold uppercase tracking-wide text-zinc-600 dark:text-white/70 px-1 -mb-3">
                  Email
                </legend>
                <div class="mt-2 space-y-2">
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Email</span>
                    <span class="min-w-0 text-right truncate">{{ filialen.email || '-' }}</span>
                  </div>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend class="text-sm font-extrabold uppercase tracking-wide text-zinc-600 dark:text-white/70 px-1 -mb-3">
                  Telefon
                </legend>
                <div class="mt-2 space-y-2">
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Telefon</span>
                    <span class="min-w-0 text-right truncate">{{ filialen.telefon || '-' }}</span>
                  </div>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend class="text-sm font-extrabold uppercase tracking-wide text-zinc-600 dark:text-white/70 px-1 -mb-3">
                  Filialenfarbe
                </legend>
                <div class="mt-2 flex items-center justify-between gap-3">
                  <span class="font-bold">Farbe</span>
                  <span class="inline-flex items-center gap-2 min-w-0 justify-end">
                    <span
                      class="h-4 w-4 rounded-md ring-1 ring-black/10 dark:ring-white/15 shrink-0"
                      :style="{ backgroundColor: filialen.farbe || '#ccc' }"
                    />
                    <span class="min-w-0 text-right truncate">{{ filialen.farbe || 'Keine Farbe gesetzt' }}</span>
                  </span>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend class="text-sm font-extrabold uppercase tracking-wide text-zinc-600 dark:text-white/70 px-1 -mb-3">
                  Algorithmus
                </legend>
                <div class="mt-2 flex justify-between gap-3">
                  <span class="font-bold">Algorithmus</span>
                  <span class="min-w-0 text-right truncate">{{ filialen.algorithmid ?? '-' }}</span>
                </div>
              </fieldset>
            </section>

            <!-- Linie -->
            <div class="bg-black/10 dark:bg-white/15"></div>

            <!-- RECHTS -->
            <section class="space-y-4 min-w-0">
              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend class="text-sm font-extrabold uppercase tracking-wide text-zinc-600 dark:text-white/70 px-1 -mb-3">
                  Adresse
                </legend>
                <div class="mt-2 space-y-2">
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Straße</span>
                    <span class="min-w-0 text-right truncate">{{ filialen.strasse || '-' }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Postleitzahl</span>
                    <span class="min-w-0 text-right truncate">{{ filialen.plz || '-' }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Ort</span>
                    <span class="min-w-0 text-right truncate">{{ filialen.ort || '-' }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Land</span>
                    <span class="min-w-0 text-right truncate">{{ filialen.land || '-' }}</span>
                  </div>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend class="text-sm font-extrabold uppercase tracking-wide text-zinc-600 dark:text-white/70 px-1 -mb-3">
                  Anmerkungen
                </legend>
                <textarea
                  rows="4"
                  :value="filialen.anmerkungen || ''"
                  readonly
                  class="w-full resize-none rounded-xl
                         ring-1 ring-white/80 dark:ring-white/20
                         bg-white/70 dark:bg-black/30
                         p-2 text-sm text-zinc-900 dark:text-white/90
                         outline-none"
                ></textarea>
              </fieldset>
            </section>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>