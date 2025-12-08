<!-- ModalMitarbeiterEdit.vue-->
 <!-- ModalMitarbeiterCreate.vue -->
<!-- TODO:
        - Code muss geschrieben werden. So nicht passend.
        - Input-Felder müssen noch geändert/ergänzt werden je nach Anforderung. Drop-downs für Filialen etc.
        - Geburtsdatum Eingabefeld ladet nicht bestehendes
-->

<script setup>
import { ref, defineProps, watch, computed } from 'vue'

// Emits, um das Modal zu schließen / bearbeiten
const emit = defineEmits(['close', 'mitarbeiterEdit'])

// Reaktive Formularfelder, initialisiert mit den Werten des übergebenen Mitarbeiters
// Props: Mitarbeiter-Objekt
const props = defineProps({
  mitarbeiter: { type: Object, required: true },
  filialen: { type: Array, required: true }
})

// Lokale Kopie der Daten (nicht direkt vom Props!)
const vorname = ref('')
const nachname = ref('')
const geburtsdatum = ref('')
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
      geburtsdatum.value = edited.geburtsdatum || ''
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
      hauptfiliale.value = edited.hauptfiliale || null
      nebenfilialen.value = edited.nebenfilialen?.length ? edited.nebenfilialen : []
      anmerkungen.value = edited.anmerkungen || ''
    }
  },
  { immediate: true }
)

// Nebenfilialen automatisch anpassen, Hauptfiliale aus Filter entfernen
watch(hauptfiliale, (newVal) => {
  nebenfilialen.value = nebenfilialen.value.filter(id => id !== newVal)
})

// Computed für Nebenfilialen-Optionen (Hauptfiliale auslassen) -> filtert diese raus damit die Hauptfiliale nicht auch als Nebenfiliale genommen werden kann
const nebenfilialenOptionen = computed(() =>
  props.filialen.filter(f => f.id !== hauptfiliale.value)
)
// Submit-Funktion
function handleSubmit() {
  emit('mitarbeiterEdit', {
    id: props.mitarbeiter.id,
    vorname: vorname.value,
    nachname: nachname.value,
    geburtsdatum: geburtsdatum.value || null,
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
    hauptfiliale: hauptfiliale.value || null,
    nebenfilialen: nebenfilialen.value.length ? nebenfilialen.value : null,
    anmerkungen: anmerkungen.value || ''
  })
  emit('close')
}
</script>

<template>
  <div class="modal-background">
    <div class="mitarbeiterEdit-container">
      <h1>Mitarbeiter bearbeiten: {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}</h1>
      <form @submit.prevent="handleSubmit">

        <div>
          <label>Vorname:</label>
          <input type="text" v-model="vorname" required />
        </div>

        <div>
          <label>Nachname:</label>
          <input type="text" v-model="nachname" required />
        </div>

        <div>
          <label>Geburtsdatum:</label>
          <input type="date" v-model="geburtsdatum" />
        </div>

        <div>
          <label>Email 1:</label>
          <input type="email" v-model="email1" />
        </div>

        <div>
          <label>Email 2:</label>
          <input type="email" v-model="email2" />
        </div>

        <div>
          <label>Telefon 1:</label>
          <input type="tel" v-model="telefon1" />
        </div>

        <div>
          <label>Telefon 2:</label>
          <input type="tel" v-model="telefon2" />
        </div>

        <!-- Adresse Box -->
        <div class="adresse-box">
          <div>
            <label>Straße:</label>
            <input type="text" v-model="strasse" />
          </div>
          <div>
            <label>Ort:</label>
            <input type="text" v-model="ort" />
          </div>
          <div>
            <label>Postleitzahl:</label>
            <input type="text" v-model="postleitzahl" />
          </div>
          <div>
            <label>Land:</label>
            <input type="text" v-model="land" />
          </div>
        </div>

        <div>
          <label>Arbeitsstunden:</label>
          <input type="number" v-model="arbeitsstunden" />
        </div>

        <div class="springer">
          <label>Springer:</label>
          <label>
            <input type="radio" v-model="springer" :value="true" /> Ja
          </label>
          <label>
            <input type="radio" v-model="springer" :value="false" /> Nein
          </label>
          <span v-if="springer === undefined" class="not-known">Nicht bekannt</span>
        </div>

        <div class="hauptfiliale">
          <label>Hauptfiliale:</label>
          <select v-model="hauptfiliale" required>
            <option disabled value="">Hauptfiliale wählen...</option>
            <option v-for="filiale in filialen" :key="filiale.id" :value="filiale.id">
              {{ filiale.name }}
            </option>
          </select>
        </div>

        <div class="nebenfilialen">
          <label>Nebenfilialen:</label>
          <select v-model="nebenfilialen" multiple>
            <option disabled value="">Nebenfiliale(n) wählen...</option>
            <option
              v-for="filiale in nebenfilialenOptionen"
              :key="filiale.id"
              :value="filiale.id"
            >
              {{ filiale.name }}
            </option>
          </select>
        </div>

        <div>
          <label>Anmerkungen:</label>
          <textarea rows="4" v-model="anmerkungen"></textarea>
        </div>

        <div class="modal-actions">
          <button type="submit">Änderungen speichern</button>
          <button type="button" @click="emit('close')">Abbrechen</button>
        </div>

      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-background {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.mitarbeiterEdit-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}
</style>