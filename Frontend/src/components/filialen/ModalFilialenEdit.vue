<!-- ModalFilialenEdit.vue -->

<script setup>
import { ref, defineProps, watch } from 'vue'
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import ColorPicker from '@/components/global/ColorPicker.vue'

// (notwendig fürs Design): Icon-Buttons statt Textbuttons
import speichern_icon from '@/assets/icons/speichern_icon_solid.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon_solid.svg'

const emit = defineEmits(['close', 'filialeEdit'])

const props = defineProps({
  filiale: { type: Object, required: true },
  show: { type: Boolean, required: true }
})

// Algorithmus Optionen
const algorithmOptions = [
  { label: 'Algorithmus 1', value: 1 },
  { label: 'Algorithmus 2', value: 2 }
]

// Lokale Kopien der Felder
const filialname = ref('')
const strasse = ref('')
const ort = ref('')
const plz = ref('')
const land = ref('')
const telefon = ref('')
const email = ref('')
const farbe = ref('')
const anmerkungen = ref('')
const algorithmid = ref(null)

// Validierungs-States
const nameFehler = ref(false)
const algorithmFehler = ref(false)

// Props → lokale Refs kopieren
watch(
  () => props.filiale,
  (edited) => {
    if (!edited) return
    filialname.value = edited.filialname || ''
    strasse.value = edited.strasse || ''
    ort.value = edited.ort || ''
    plz.value = edited.plz || ''
    land.value = edited.land || ''
    telefon.value = edited.telefon || ''
    email.value = edited.email || ''
    farbe.value = edited.farbe || '#ffffff' // Fallback auf Weiß, wenn nicht gesetzt
    anmerkungen.value = edited.anmerkungen || ''
    algorithmid.value =
      algorithmOptions.find(opt => opt.value === edited.algorithmid) || null
  },
  { immediate: true }
)

// entfernt Reset Fehler Meldung bei Schließen des Modals
watch(() => props.show, (newVal) => {
  if (!newVal) {
    nameFehler.value = false
    algorithmFehler.value = false
  }
})

// Submit
function handleSubmit() {
  // Zurücksetzen der Fehler-States für neue Prüfung
  nameFehler.value = false
  algorithmFehler.value = false

  let hatFehler = false

  // Filialname Pflichtfeld-Prüfung
  if (!filialname.value.trim()) {
    nameFehler.value = true
    hatFehler = true
  }

  // Algorithmus Pflichtfeld-Prüfung
  if (!algorithmid.value) {
    algorithmFehler.value = true
    hatFehler = true
  }

  // Wenn Fehler vorhanden sind, hier abbrechen (beide Meldungen bleiben stehen)
  if (hatFehler) return

  emit('filialeEdit', {
    fnr: props.filiale.fnr,
    filialname: filialname.value,
    strasse: strasse.value || '',
    ort: ort.value || '',
    plz: plz.value || '',
    land: land.value || '',
    telefon: telefon.value || '',
    email: email.value || '',
    farbe: farbe.value || '',
    anmerkungen: anmerkungen.value || '',
    algorithmid: algorithmid.value ? algorithmid.value.value : null
  })
  emit('close')
}
</script>

<template>
  <BaseModal v-if="filiale" :show="show" @close="emit('close')" width="980px">
    <!-- Header Slot -->
    <template #header>
      <div class="font-sans"></div>
    </template>

    <!-- Body Slot -->
    <template #body>
      <!-- Card Look (EINE Box) -->
      <div
        class="relative font-sans rounded-3xl border border-white/10
               bg-linear-to-b from-zinc-800/70 to-zinc-900/80
               p-8 pt-11 shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
      >
        <div class="mb-6">
          <h2 class="text-2xl font-extrabold tracking-tight text-white">
            Filiale bearbeiten: {{ filiale.filialname }}
          </h2>
        </div>

        <!-- ACTIONS oben rechts (Design wie Mitarbeiter) -->
        <div class="absolute right-8 top-8 flex gap-3">
          <button
            type="button"
            @click="handleSubmit"
            class="flex items-center justify-center rounded-xl
                   border border-green-400/30 bg-green-500/35
                   px-3 py-3 hover:bg-green-500/80 transition"
            title="Speichern"
          >
            <img :src="speichern_icon" class="h-5 w-5" alt="Speichern" />
          </button>

          <button
            type="button"
            @click="emit('close')"
            class="flex items-center justify-center rounded-xl
                   border border-red-400/30 bg-red-500/35
                   px-3 py-3 hover:bg-red-500/80 transition"
            title="Abbrechen"
          >
            <img :src="abbrechen_icon" class="h-5 w-5" alt="Abbrechen" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Filialname -->
          <div class="space-y-1">
            <input
              v-model="filialname"
              type="text"
              placeholder="Name der Filiale"
              class="w-full rounded-xl border border-white/10 bg-black/25
                     px-4 py-4 text-white outline-none"
            />
            <p v-if="nameFehler" class="text-red-400 text-sm">
              Filialenname ist erforderlich
            </p>
          </div>

          <!-- LINKS | LINIE | RECHTS -->
          <div class="mt-2 grid grid-cols-[1fr_1px_1fr] gap-10 text-base text-white/90">
            <!-- LINKS -->
            <section class="space-y-6">
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Kontakt
                </legend>

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Telefon</label>
                    <input
                      v-model="telefon"
                      type="text"
                      placeholder="Telefon"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Email</label>
                    <input
                      v-model="email"
                      type="text"
                      placeholder="Email"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none text-right"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Algorithmus
                </legend>

                <Multiselect
                  v-model="algorithmid"
                  :options="algorithmOptions"
                  :multiple="false"
                  placeholder="Algorithmus wählen"
                  selectLabel=""
                  deselectLabel=""
                  selectedLabel=""
                  label="label"
                  track-by="value"
                />
                <p v-if="algorithmFehler" class="text-red-400 mt-2 text-sm">
                  Algorithmus ist erforderlich
                </p>
              </fieldset>

              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Filialenfarbe
                </legend>
                <div class="mt-2">
                  <ColorPicker v-model="farbe" />
                </div>
              </fieldset>
            </section>

            <!-- Linie -->
            <div class="bg-white/15"></div>

            <!-- RECHTS -->
            <section class="space-y-6">
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Adresse
                </legend>

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Straße</label>
                    <input
                      v-model="strasse"
                      type="text"
                      placeholder="Straße"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Ort</label>
                    <input
                      v-model="ort"
                      type="text"
                      placeholder="Ort"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Postleitzahl</label>
                    <input
                      v-model="plz"
                      type="text"
                      placeholder="Postleitzahl"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Land</label>
                    <input
                      v-model="land"
                      type="text"
                      placeholder="Land"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Anmerkungen
                </legend>

                <textarea
                  rows="4"
                  v-model="anmerkungen"
                  class="w-full resize-none rounded-xl border border-white/10 bg-black/30
                         p-3 text-white/90 outline-none ring-1 ring-transparent focus:ring-white/20"
                />
              </fieldset>
            </section>
          </div>
        </form>
      </div>
    </template>

    <!-- Footer Slot -->
    <!-- WHY: absichtlich leer, damit NICHT doppelte Buttons entstehen (Design hat Actions oben rechts). -->
    <template #footer></template>
  </BaseModal>
</template>