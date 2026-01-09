<!-- ModalMitarbeiterEdit.vue-->

<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import { ref, defineProps, watch, computed } from 'vue'


// Emits, um das Modal zu schließen / bearbeiten
const emit = defineEmits(['close', 'mitarbeiterEdit'])

// Reaktive Formularfelder, initialisiert mit den Werten des übergebenen Mitarbeiters
// Props: Mitarbeiter-Objekt
const props = defineProps({
  mitarbeiter: { type: Object, required: true },
  filialen: { type: Array, required: true },
  show: { type: Boolean, required: true } // vom Parent gesteuert
})

// Lokale Kopie der Daten (nicht direkt vom Props!)
//wird verwendet damit die tatsächlichen Mitarbeiterdaten erst beim speichern überschrieben werden!
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
const springer = ref(undefined)
const hauptfiliale = ref(null)
const nebenfilialen = ref([])
const anmerkungen = ref('')


// Watch füllt die lokalen Refs mit den Prop-Daten
// Vue beobachtet das mitarbeiter-Prop reaktiv mit () => props.mitarbeiter
// (editedMitarbeiter) ist der neue Wert des Props, wird getriggert wenn sich das Prop ändert
// immediate: true sorgt dafür, dass die Watch-Funktion sofort beim Komponenten-Mount ausgelöst wird
watch(
  () => props.mitarbeiter,
  (edited) => {
    if (edited) {
      vorname.value = edited.vorname || ''
      nachname.value = edited.nachname || ''
      email1.value = edited.email1 || ''
      email2.value = edited.email2 || ''
      telefon1.value = edited.telefon1 || ''
      telefon2.value = edited.telefon2 || ''
      strasse.value = edited.strasse || ''
      ort.value = edited.ort || ''
      postleitzahl.value = edited.postleitzahl || ''
      land.value = edited.land || ''
      arbeitsstunden.value = edited.arbeitsstunden ?? ''
      springer.value = 
        edited.springer === 'Ja' ? true :
        edited.springer === 'Nein' ? false : undefined
      hauptfiliale.value = props.filialen.find(f => f.id === edited.hauptfiliale) || null
      nebenfilialen.value = edited.nebenfilialen?.length ? props.filialen.filter(f => edited.nebenfilialen.includes(f.id)): []
      anmerkungen.value = edited.anmerkungen || ''
    }
  },
  { immediate: true }
)

// Nebenfilialen automatisch anpassen, Hauptfiliale aus Filter entfernen
watch(hauptfiliale, (newVal) => {
  nebenfilialen.value = nebenfilialen.value.filter(
    f => f.id !== newVal?.id
  )
})

// Computed für Nebenfilialen-Optionen (Hauptfiliale auslassen) -> filtert diese raus damit die Hauptfiliale nicht auch als Nebenfiliale genommen werden kann
const nebenfilialenOptionen = computed(() =>
  props.filialen.filter(f => f.id !== hauptfiliale.value?.id)
)
// Submit-Funktion
function handleSubmit() {
  emit('mitarbeiterEdit', {
    id: props.mitarbeiter.id,
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
    springer: springer.value === true ? 'Ja' : springer.value === false ? 'Nein' : 'Nicht bekannt',
    hauptfiliale: hauptfiliale.value?.id || null,
    nebenfilialen: nebenfilialen.value.length ? nebenfilialen.value.map(f => f.id) : null,
    anmerkungen: anmerkungen.value || ''
  })
  emit('close')
}

</script>

<template>
  <BaseModal :show="show" @close="emit('close')" width="500px">
    <!-- Header Slot -->
    <template #header>
      <h2 class="text-2xl font-semibold">Mitarbeiter bearbeiten: {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}</h2>
    </template>

    <!-- Body Slot -->
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Vorname/Nachname -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Vorname:</label>
            <input type="text" v-model="vorname" required class="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label>Nachname:</label>
            <input type="text" v-model="nachname" required class="w-full border rounded px-2 py-1"/>
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
              :options="filialen"
              label="name"
              track-by="id"
              placeholder="Hauptfiliale wählen"
              :clearable="false"
            />
          </div>
          <div>
            <label>Nebenfilialen:</label>
            <Multiselect
              v-model="nebenfilialen"
              :options="nebenfilialenOptionen"
              label="name"
              track-by="id"
              placeholder="Nebenfilialen wählen"
              :multiple="true"
              :close-on-select="false"
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
      <div class="flex justify-center gap-4 mt-4">
        <button class=" bg-blue-300 px-4 py-2 rounded" @click="handleSubmit" >Änderungen speichern</button>
        <button  class=" bg-gray-200 px-4 py-2 rounded" @click="emit('close')">Abbrechen</button>
      </div>
    </template>
  </BaseModal>
</template>

<style>
</style>