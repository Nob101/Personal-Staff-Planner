<!-- MitarbeiterCard.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps, computed } from 'vue'
import bearbeiten_icon from '@/assets/icons/bearbeiten_icon.png'
import loeschen_icon from '@/assets/icons/loeschen_icon.png'

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
    class="relative cursor-pointer font-sans
           rounded-3xl
           bg-linear-to-b from-zinc-300 to-zinc-600
           shadow-[0_16px_40px_rgba(0,0,0,0.4)]
           hover:-translate-y-0.5 transition"
    @click="handleSelect"
  >
    <!-- HEADER wie Filiale -->
    <div class="px-4 py-2">
      <h3 class="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
        {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}
      </h3>

      <!-- Email unter dem Namen (sonst evtl. zu lang)-->
      <div
        class="mt-0.5 text-sm text-zinc-800 dark:text-white/80"
      >
        {{ mitarbeiter.email1 ?? "-" }}
      </div>
    </div>

    <!-- BODY wie Filiale -->
    <div class="px-4 pt-2 pb-3">
      <!-- Innere weiße Box wie Filiale (Grid-Wrapper) -->
      <div class="rounded-2xl bg-white ring-1 ring-black/10">
        <div class="p-3">
          <div class="grid grid-cols-[1fr_1px_1fr] gap-5 text-sm text-zinc-700">
            <!-- LINKS: Kontakt -->
            <div class="space-y-3 min-w-0">
              <div class="text-l font-bold uppercase tracking-wide text-black">
                Stammdaten
              </div>

              <div class="space-y-2">
                <div class="flex justify-between gap-3 min-w-0">
                  <span class="text-right min-w-0 truncate">{{ mitarbeiter.telefon1 ?? "-" }}</span>
                </div>

                <div class="flex justify-between gap-3 min-w-0">
                  <span class="shrink-0">Filiale {{ hauptfilialeName }}</span>
                </div>

                <div class="flex justify-between gap-3 min-w-0">
                  <span class="shrink-0">{{ mitarbeiter.arbeitsstunden ?? "-" }} Stunden</span>
                </div>
              </div>
            </div>

            <!-- Linie -->
            <div class="bg-black/10"></div>

            <!-- RECHTS: Nebenfilialen -->
            <div class="space-y-2 min-w-0">
              <div class="text-l font-bold uppercase tracking-wide text-black">
                Nebenfilialen
              </div>

              <p class="text-sm leading-7 line-clamp-4 wrap-break-word">
                {{ nebenfilialenNamen }}
              </p>
            </div>
          </div>

          <div class="mt-3 text-xs text-zinc-400">
            Klicken für Details →
          </div>
        </div>
      </div>
    </div>
  </article>

  <!-- DETAIL VARIANT -->
  <article
    v-else
    class="mx-auto w-full max-w-[760px]
          font-sans relative rounded-3xl
           bg-white/70 dark:bg-zinc-900/50
           shadow-[0_16px_40px_rgba(0,0,0,0.4)]
           backdrop-blur overflow-hidden"
  >
    <!-- HEADER -->
    <div class="bg-linear-to-b from-zinc-300 to-zinc-400">
      <div class="flex items-center justify-between gap-3 px-4 py-2">
        <!-- left -->
        <div class="min-w-0">
          <div class="text-xl font-extrabold text-zinc-900 dark:text-white truncate">
            {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}
          </div>
          <div class="text-[11px] text-zinc-600 dark:text-white/70 break-all">
            {{ mitarbeiter.email1 ?? "-" }}
          </div>
        </div>

        <!-- actions -->
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

    <!-- BODY -->
    <div class="px-4 pt-2 pb-3 rounded-b-3xl bg-linear-to-b from-zinc-400 to-zinc-600">
      <!-- Innere Box -->
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
                    <span class="font-bold">Email 1</span>
                    <span class="min-w-0 text-right truncate">{{ mitarbeiter.email1 || "-" }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Email 2</span>
                    <span class="min-w-0 text-right truncate">{{ mitarbeiter.email2 || "-" }}</span>
                  </div>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend class="text-sm font-extrabold uppercase tracking-wide text-zinc-600 dark:text-white/70 px-1 -mb-3">
                  Telefon
                </legend>
                <div class="mt-2 space-y-2">
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Telefon 1</span>
                    <span class="min-w-0 text-right truncate">{{ mitarbeiter.telefon1 || "-" }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Telefon 2</span>
                    <span class="min-w-0 text-right truncate">{{ mitarbeiter.telefon2 || "-" }}</span>
                  </div>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend class="text-sm font-extrabold uppercase tracking-wide text-zinc-600 dark:text-white/70 px-1 -mb-3">
                  Filialen
                </legend>
                <div class="mt-2 space-y-2">
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Hauptfiliale</span>
                    <span class="min-w-0 text-right truncate">{{ hauptfilialeName }}</span>
                  </div>

                  <div class="font-bold">Nebenfilialen</div>
                  <div class="flex flex-wrap gap-2">
                    <span
                      v-for="f in mitarbeiter.nebenfilialen"
                      :key="f.id"
                      class="rounded-full ring-1 ring-black/10 dark:ring-white/10
                             bg-white/70 dark:bg-white/5
                             px-2.5 py-0.5 text-[11px]"
                    >
                      {{ f.name }}
                    </span>
                    <span v-if="!mitarbeiter.nebenfilialen?.length" class="text-zinc-600 dark:text-white/70">-</span>
                  </div>
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
                    <span class="min-w-0 text-right truncate">{{ mitarbeiter.strasse || "-" }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Postleitzahl</span>
                    <span class="min-w-0 text-right truncate">{{ mitarbeiter.postleitzahl || "-" }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Ort:</span>
                    <span class="min-w-0 text-right truncate">{{ mitarbeiter.ort || "-" }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Land</span>
                    <span class="min-w-0 text-right truncate">{{ mitarbeiter.land || "-" }}</span>
                  </div>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend class="text-sm font-extrabold uppercase tracking-wide text-zinc-600 dark:text-white/70 px-1 -mb-3">
                  Arbeit
                </legend>
                <div class="mt-2 space-y-2">
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Arbeitsstunden</span>
                    <span class="min-w-0 text-right truncate">{{ mitarbeiter.arbeitsstunden ?? "-" }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="font-bold">Springer</span>
                    <span class="min-w-0 text-right truncate">
                      {{ mitarbeiter.springer ? 'Ja' : 'Nein' }}
                    </span>
                  </div>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl bg-white dark:bg-black/25 ring-1 ring-black/10 dark:ring-white/10 p-3">
                <legend
                  class="text-sm font-extrabold uppercase tracking-wide
                        text-zinc-600 dark:text-white/70 px-1 -mb-3"
                >
                  Anmerkungen
                </legend>

                <textarea
                  rows="3"
                  :value="mitarbeiter.anmerkungen || ''"
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