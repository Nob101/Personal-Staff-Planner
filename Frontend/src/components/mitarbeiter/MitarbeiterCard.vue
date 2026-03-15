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
    class="ma-card-list"
    @click="handleSelect"
  >
    <!-- HEADER wie Filiale -->
    <div class="ma-list-head">
      <h3 class="ma-list-title">
        {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}
      </h3>

      <!-- Email unter dem Namen (sonst evtl. zu lang)-->
      <div class="ma-list-subtitle">
        {{ mitarbeiter.email1 ?? "-" }}
      </div>
    </div>

    <!-- BODY wie Filiale -->
    <div class="ma-list-body">
      <!-- Innere weiße Box wie Filiale (Grid-Wrapper) -->
      <div class="ma-list-inner">
        <div class="ma-list-panel">
          <div class="ma-list-grid">
            <!-- LINKS: Kontakt -->
            <div class="space-y-3 min-w-0">
              <div class="ma-list-section-title">
                Stammdaten:
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
              <div class="ma-list-section-title">
                Nebenfilialen:
              </div>

              <p class="text-sm leading-7 line-clamp-4 wrap-break-word">
                {{ nebenfilialenNamen }}
              </p>
            </div>
          </div>

          <div class="ma-list-hint">
            Klicken für Details →
          </div>
        </div>
      </div>
    </div>
  </article>

  <!-- DETAIL VARIANT -->
  <article
    v-else
    class="ma-card ma-card-detail"
  >
    <!-- HEADER -->
    <div class="ma-card-head">
      <div class="ma-card-head-inner">
        <!-- left -->
        <div class="min-w-0">
          <div class="ma-title">
            {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}
          </div>
          <div class="ma-subtitle-break">
            {{ mitarbeiter.email1 ?? "-" }}
          </div>
        </div>

        <!-- actions -->
        <div class="ma-action-wrap">
          <button
            @click="handleEdit"
            class="ma-action-btn ma-action-btn--sm ma-action-btn--blue"
            type="button"
            title="Bearbeiten"
          >
            <img :src="bearbeiten_icon" class="ma-action-icon" alt="Bearbeiten" />
          </button>

          <button
            @click="handleDelete"
            class="ma-action-btn ma-action-btn--sm ma-action-btn--red"
            type="button"
            title="Löschen"
          >
            <img :src="loeschen_icon" class="ma-action-icon" alt="Löschen" />
          </button>
        </div>
      </div>
    </div>

    <!-- BODY -->
    <div class="ma-card-body">
      <!-- Innere Box -->
      <div class="ma-card-body-inner">
        <div class="ma-card-panel">
          <!-- LINKS | LINIE | RECHTS -->
          <div class="ma-card-grid">
            <!-- LINKS -->
            <section class="space-y-4 min-w-0">
              <fieldset class="ma-fieldset">
                <legend class="ma-legend">
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

              <fieldset class="ma-fieldset">
                <legend class="ma-legend">
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

              <fieldset class="ma-fieldset">
                <legend class="ma-legend">
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
                      class="ma-pill"
                    >
                      {{ f.name }}
                    </span>
                    <span v-if="!mitarbeiter.nebenfilialen?.length" class="text-zinc-600">-</span>
                  </div>
                </div>
              </fieldset>
            </section>

            <!-- Linie -->
            <div class="ma-divider"></div>

            <!-- RECHTS -->
            <section class="space-y-4 min-w-0">
              <fieldset class="ma-fieldset">
                <legend class="ma-legend">
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

              <fieldset class="ma-fieldset">
                <legend class="ma-legend">
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

              <fieldset class="ma-fieldset">
                <legend
                  class="ma-legend"
                >
                  Anmerkungen
                </legend>

                <textarea
                  rows="3"
                  :value="mitarbeiter.anmerkungen || ''"
                  readonly
                  class="ma-form-textarea"
                ></textarea>
              </fieldset>
            </section>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>