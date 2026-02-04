<!-- ModalMitarbeiterCreate.vue -->

<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import { ref, watch, defineProps, computed } from 'vue'


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
  }
})

// Submit
function handleSubmit() {
  vornameFehler.value = false
  nachnameFehler.value = false

  if (!vorname.value.trim()) {
    vornameFehler.value = true
  }

  if (!nachname.value.trim()) {
    nachnameFehler.value = true
  }

  if (vornameFehler.value || nachnameFehler.value) return // Sammel-validierung -> So kommt die Fehlermeldung für Vorname u. Nachname wenn beide fehlen, anstatt nur eine!

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
  <BaseModal :show="show" @close="emit('close')" width="500px">
    <!-- Header Slot -->
    <template #header>
      <h1 class="text-2xl font-semibold">Neuer Mitarbeiter</h1>
    </template>

    <!-- Body Slot -->
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Vorname/Nachname -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Vorname:</label>
            <input type="text" v-model="vorname" required class="w-full border rounded px-2 py-1"/>
              <p v-if="vornameFehler" class="text-red-600 mt-1 text-sm">
                Vorname ist erforderlich
              </p>
          </div>
          <div>
            <label>Nachname:</label>
            <input type="text" v-model="nachname" required class="w-full border rounded px-2 py-1"/>
              <p v-if="nachnameFehler" class="text-red-600 mt-1 text-sm">
                Nachname ist erforderlich
              </p>
          </div>
        </div>

        <!-- Email -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Email 1:</label>
            <input type="email" v-model="email1" class="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label>Email 2:</label>
            <input type="email" v-model="email2" class="w-full border rounded px-2 py-1"/>
          </div>
        </div>

        <!-- Telefon -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Telefon 1:</label>
            <input type="tel" v-model="telefon1" class="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label>Telefon 2:</label>
            <input type="tel" v-model="telefon2" class="w-full border rounded px-2 py-1"/>
          </div>
        </div>

        <!-- Adresse -->
        <fieldset class="border rounded p-3">
          <legend>Adresse</legend>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label>Straße:</label>
              <input type="text" v-model="strasse" class="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label>Ort:</label>
              <input type="text" v-model="ort" class="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label>Postleitzahl:</label>
              <input type="text" v-model="postleitzahl" class="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label>Land:</label>
              <input type="text" v-model="land" class="w-full border rounded px-2 py-1"/>
            </div>
          </div>
        </fieldset>

        <!-- Arbeitsstunden / Springer -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Arbeitsstunden:</label>
            <input type="number" v-model="arbeitsstunden" class="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label>Springer:</label>
            <div class="flex gap-4 items-center mt-1">
              <label><input type="radio" v-model="springer" :value="true"/> Ja</label>
              <label><input type="radio" v-model="springer" :value="false"/> Nein</label>
            </div>
          </div>
        </div>

        <!-- Hauptfiliale / Nebenfilialen -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Hauptfiliale:</label>
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
          </div>
          <div>
            <label>Nebenfilialen:</label>
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

        <!-- Anmerkungen -->
        <div>
          <label>Anmerkungen:</label>
          <textarea rows="4" v-model="anmerkungen" class="w-full border rounded px-2 py-1"></textarea>
        </div>
      </form>
    </template>

    <!-- Footer Slot -->
    <template #footer>
      <button type="button" class="bg-blue-300" @click="handleSubmit">Erstellen</button>
      <button type="button" class="bg-gray-400" @click="emit('close')">Abbrechen</button>
    </template>
</BaseModal>
</template>

<style>
</style>