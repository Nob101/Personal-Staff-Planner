<!-- ModalFilialenCreate.vue -->

<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import { ref, defineProps, watch } from 'vue'
import ColorPicker from '@/components/global/ColorPicker.vue'

// (notwendig fürs Design): Icon-Buttons statt Textbuttons
import speichern_icon from '@/assets/icons/speichern_icon_solid.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon_solid.svg'

// Emits
const emit = defineEmits(['close', 'filialeCreate'])

// Props
const props = defineProps({
  mitarbeiter: { type: Object, required: false },
  filialen: { type: Object, required: true },
  show: { type: Boolean, required: true }
})

// Algorithmus Optionen
const algorithmOptions = [
  { label: 'Algorithmus 1', value: 1 },
  { label: 'Algorithmus 2', value: 2 }
]

// Reaktive Formularfelder
const filialname = ref('')
const email = ref('')
const telefon = ref('')
const strasse = ref('')
const ort = ref('')
const plz = ref('')
const land = ref('')
const farbe = ref('#ffffff')
const algorithmid = ref(null)

// Validierungs-States
const nameFehler = ref(false)
const algorithmFehler = ref(false)

// Reset der Fehlermeldungen beim Schließen des Modals
watch(() => props.show, (newVal) => {
  if (!newVal) {
    nameFehler.value = false
    algorithmFehler.value = false
  }
})

// Submit
function handleSubmit() {
  // Reset Fehler-States für neue Prüfung
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

  // Wenn Fehler vorhanden sind, hier abbrechen (beide Warnungen bleiben sichtbar)
  if (hatFehler) return

  emit('filialeCreate', {
    filialname: filialname.value,
    email: email.value || '',
    telefon: telefon.value || '',
    strasse: strasse.value || '',
    ort: ort.value || '',
    plz: plz.value || '',
    land: land.value || '',
    farbe: farbe.value,
    algorithmid: algorithmid.value ? algorithmid.value.value : null
  })

  // Formular zurücksetzen
  resetFormFields()
  emit('close')
}

function resetFormFields() {
  filialname.value = ''
  email.value = ''
  telefon.value = ''
  strasse.value = ''
  ort.value = ''
  plz.value = ''
  land.value = ''
  farbe.value = '#ffffff'
  algorithmid.value = null
  nameFehler.value = false
  algorithmFehler.value = false
}
</script>

<template>
  <BaseModal :show="show" @close="emit('close')" width="980px">
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
            Neue Filiale anlegen
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
            title="Erstellen"
          >
            <img :src="speichern_icon" class="h-5 w-5" alt="Erstellen" />
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
              placeholder="Filialname"
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
              <!-- Kontakt -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Kontakt
                </legend>

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Email</label>
                    <input
                      type="email"
                      v-model="email"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Telefon</label>
                    <input
                      type="tel"
                      v-model="telefon"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- Farbe -->
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
              <!-- Adresse + Algorithmus -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Adresse
                </legend>

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Straße</label>
                    <input
                      type="text"
                      v-model="strasse"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Ort</label>
                    <input
                      type="text"
                      v-model="ort"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Postleitzahl</label>
                    <input
                      type="text"
                      v-model="plz"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Land</label>
                    <input
                      type="text"
                      v-model="land"
                      class="w-64 rounded-lg border border-white/10 bg-black/25
                             px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20 text-right"
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