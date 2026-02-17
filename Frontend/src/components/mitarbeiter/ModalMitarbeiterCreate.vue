<!-- ModalMitarbeiterCreate.vue -->

<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import { ref, watch, defineProps, computed } from 'vue'
import speichern_icon from '@/assets/icons/speichern_icon.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon.svg'


// Emits
const emit = defineEmits(['close', 'mitarbeiterCreate'])

// Props
const props = defineProps({
  filialen: { type: Array, required: true },
  show: { type: Boolean, required: true }                   // wird von Parent gesteuert
})

// Reaktive Formularfelder
const vorname = ref('')
const nachname = ref('')
const email1 = ref('')
const email2 = ref('')
const telefon1 = ref('')
const telefon2 = ref('')
const strasse = ref('')
const ort = ref('')
const postleitzahl = ref('')
const land = ref('')
const arbeitsstunden = ref('')
const springer = ref(undefined) // undefined, nichts vorausgewählt
const hauptfiliale = ref(null)
const nebenfilialen = ref([])
const anmerkungen = ref('')
const vornameFehler = ref(false)
const nachnameFehler = ref(false)
const hauptfilialeFehler = ref(false)

// Nebenfilialen automatisch anpassen
watch(hauptfiliale, (newVal) => {
  if (!newVal) return

  nebenfilialen.value = nebenfilialen.value.filter(
    f => f.fnr !== newVal.fnr
  )
})

// Filter für Nebenfilialen (Hauptfiliale ausschließen) und beim aussuchen alphabetisch sortiert anzeigen
const nebenfilialenOptionen = computed(() =>
  props.filialen
    .filter(f => !hauptfiliale.value || f.fnr !== hauptfiliale.value.fnr)
    .sort((a, b) => a.filialname.localeCompare(b.filialname))
)

// Ausgewählte Nebenfilialen alphabetisch anzeigen
const sortedNebenfilialen = computed({
  get: () => [...nebenfilialen.value].sort((a, b) => a.filialname.localeCompare(b.filialname)),
  set: val => nebenfilialen.value = val
})

// entfernt Reset Fehler Meldung bei Schließen des Modals
watch(() => props.show, (val) => {
  if (!val) {
    vornameFehler.value = false
    nachnameFehler.value = false
    hauptfilialeFehler.value = false
  }
})

// Submit
function handleSubmit() {
  vornameFehler.value = false
  nachnameFehler.value = false
  hauptfilialeFehler.value = false

  // Validierung
  if (!vorname.value.trim()) vornameFehler.value = true
  if (!nachname.value.trim()) nachnameFehler.value = true
  if (!hauptfiliale.value) hauptfilialeFehler.value = true

  // Wenn ein Fehler existiert, abbrechen
  if (vornameFehler.value || nachnameFehler.value || hauptfilialeFehler.value) return // Sammel-validierung -> So kommt die Fehlermeldung für Vorname, Nachname und Huaptfiliale wenn alle fehlen, anstatt nur eine!

  emit('mitarbeiterCreate', {
    vorname: vorname.value,
    nachname: nachname.value,
    email1: email1.value || '',
    email2: email2.value || '',
    telefon1: telefon1.value || '',
    telefon2: telefon2.value || '',
    strasse: strasse.value || '',
    ort: ort.value || '',
    postleitzahl: postleitzahl.value || '',
    land: land.value || '',
    arbeitsstunden: arbeitsstunden.value ? Number(arbeitsstunden.value) : null,
    springer: springer.value ?? false, // wenn undefined, dann false
    hauptfiliale: hauptfiliale.value?.fnr || null,
    nebenfilialen: nebenfilialen.value.length ? nebenfilialen.value.map(f => f.fnr) : null,
    anmerkungen: anmerkungen.value || ''
  })

  // Formular zurücksetzen
  vorname.value = ''
  nachname.value = ''
  email1.value = ''
  email2.value = ''
  telefon1.value = ''
  telefon2.value = ''
  strasse.value = ''
  ort.value = ''
  postleitzahl.value = ''
  land.value = ''
  arbeitsstunden.value = ''
  springer.value = undefined
  hauptfiliale.value = null
  nebenfilialen.value = []
  anmerkungen.value = ''

  emit('close')
}
</script>

<template>
  <BaseModal :show="show" @close="emit('close')" width="960px">
    <!-- Body Slot -->
    <template #body>
      <div
        class="relative font-sans rounded-3xl border border-white/10 bg-linear-to-b from-zinc-800/70 to-zinc-900/80 p-8 pt-11 shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
      >
        <div class="mb-6">
          <h2 class="text-2xl font-extrabold tracking-tight text-white">
            Neuen Mitarbeiter anlegen
          </h2>
        </div>

        <!-- ACTIONS oben rechts -->
        <div class="absolute right-8 top-8 flex gap-3">
          <button
            type="button"
            @click="handleSubmit"
            class="flex items-center justify-center rounded-xl
                   border border-green-400/30 bg-green-500/35
                   px-3 py-3 hover:bg-green-500 transition"
            title="Erstellen"
          >
            <img :src="speichern_icon" class="h-5 w-5" alt="Erstellen" />
          </button>

          <button
            type="button"
            @click="emit('close')"
            class="flex items-center justify-center rounded-xl
                   border border-red-400/30 bg-red-500/35
                   px-3 py-3 hover:bg-red-500 transition"
            title="Abbrechen"
          >
            <img :src="abbrechen_icon" class="h-5 w-5" alt="Abbrechen" />
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Vorname / Nachname -->
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1">
              <input
                v-model="vorname"
                type="text"
                placeholder="Vorname"
                class="w-104 rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none"
              />
              <p v-if="vornameFehler" class="text-red-500 text-sm">
                Vorname ist erforderlich
              </p>
            </div>

            <div class="flex justify-end">
              <div class="w-104 space-y-1">
                <input
                  v-model="nachname"
                  type="text"
                  placeholder="Nachname"
                  class="w-104 rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none"
                />
                <p v-if="nachnameFehler" class="text-red-500 text-sm">
                  Nachname ist erforderlich
                </p>
              </div>
            </div>
          </div>

          <!-- LINKS | LINIE | RECHTS -->
          <div class="mt-2 grid grid-cols-[1fr_1px_1fr] gap-10 text-base text-white/90">
            <!-- LINKS -->
            <section class="space-y-6">
              <!-- Email -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Email
                </legend>

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Email 1</label>
                    <input
                      type="email"
                      v-model="email1"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Email 2</label>
                    <input
                      type="email"
                      v-model="email2"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- Telefon -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Telefon
                </legend>

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Telefon 1:</label>
                    <input
                      type="tel"
                      v-model="telefon1"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Telefon 2:</label>
                    <input
                      type="tel"
                      v-model="telefon2"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- Filialen -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Filialen
                </legend>

                <div class="space-y-6">
                  <!-- Hauptfiliale -->
                  <div class="space-y-1">
                    <label class="text-sm font-semibold text-white/80">
                      Hauptfiliale
                    </label>
                    <Multiselect
                      v-model="hauptfiliale"
                      :options="props.filialen.sort((a,b)=>a.filialname.localeCompare(b.filialname))"
                      label="filialname"
                      track-by="fnr"
                      placeholder="Hauptfiliale wählen"
                      :clearable="false"
                      selectLabel=""
                      deselectLabel=""
                      selectedLabel=""
                    />
                    <p v-if="hauptfilialeFehler" class="text-red-400 text-sm">
                      Hauptfiliale ist erforderlich
                    </p>
                  </div>

                  <!-- Nebenfilialen -->
                  <div class="space-y-1">
                    <label class="text-sm font-semibold text-white/80">
                      Nebenfilialen
                    </label>
                    <Multiselect
                      v-model="sortedNebenfilialen"
                      :options="nebenfilialenOptionen"
                      label="filialname"
                      track-by="fnr"
                      placeholder="Nebenfiliale(n) wählen"
                      :multiple="true"
                      :close-on-select="false"
                      selectLabel=""
                      deselectLabel=""
                      selectedLabel=""
                    />
                  </div>
                </div>
              </fieldset>
            </section>

            <!-- Linie -->
            <div class="bg-white/15"></div>

            <!-- RECHTS -->
            <section class="space-y-6">
              <!-- Adresse -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Adresse
                </legend>

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Straße:</label>
                    <input
                      type="text"
                      v-model="strasse"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Ort:</label>
                    <input
                      type="text"
                      v-model="ort"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Postleitzahl:</label>
                    <input
                      type="text"
                      v-model="postleitzahl"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Land:</label>
                    <input
                      type="text"
                      v-model="land"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- Arbeit -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Arbeit
                </legend>

                <div class="space-y-3 items-start">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Arbeitsstunden:</label>
                    <input
                      type="number"
                      v-model="arbeitsstunden"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>

                  <div class="flex justify-between items-center gap-4">
                    <label class="text-sm font-semibold text-white/80">
                      Springer:
                    </label>

                    <div class="flex gap-5 text-white/90">
                      <label class="flex items-center gap-2">
                        <input type="radio" v-model="springer" :value="true" />
                        Ja
                      </label>

                      <label class="flex items-center gap-2">
                        <input type="radio" v-model="springer" :value="false" />
                        Nein
                      </label>
                    </div>
                  </div>

                </div>
              </fieldset>

              <!-- Anmerkungen -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Anmerkungen
                </legend>

                <div class="mt-3">
                  <textarea
                    rows="4"
                    v-model="anmerkungen"
                    class="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-white/90 outline-none ring-1 ring-transparent focus:ring-white/20"
                  />
                </div>
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

<style>
</style>