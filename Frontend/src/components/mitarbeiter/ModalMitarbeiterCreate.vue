<!-- ModalMitarbeiterCreate.vue -->
<!-- TODO:
        - Input-Felder müssen noch geändert/ergänzt werden je nach Anforderung. Drop-downs für Filialen etc.
-->

<script setup>
import { ref, watch, defineProps, computed } from 'vue'

// Emits
const emit = defineEmits(['close', 'mitarbeiterCreate'])

// Props: Mitarbeiter-Objekt
const props = defineProps({
  mitarbeiter: {
    type: Object,
    required: true
  },
  filialen: {
    type: Array,
    required: true
  }
})

// Reaktive Formularfelder
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
const springer = ref(undefined)    // undefined = Nicht bekannt
const hauptfiliale = ref(null)
const nebenfilialen = ref([])
const anmerkungen = ref('')

// Nebenfilialen automatisch anpassen
watch(hauptfiliale, (newVal) => {
  nebenfilialen.value = nebenfilialen.value.filter(id => id !== newVal)
})

// Filter für Nebenfilialen im Template
const nebenfilialenOptionen = computed(() =>
  props.filialen.filter(f => f.id !== hauptfiliale.value)
)

// Submit-Funktion
function handleSubmit() {
  emit('mitarbeiterCreate', {
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
    springer: springer.value === true
      ? 'Ja'
      : springer.value === false
        ? 'Nein'
        : 'Nicht bekannt',
    hauptfiliale: hauptfiliale.value || null,
    nebenfilialen: nebenfilialen.value.length ? nebenfilialen.value : null,
    anmerkungen: anmerkungen.value || ''
  })
  emit('close')
}
</script>


<template>
  <div class="modal-background">
    <div class="mitarbeiterCreate-container">
      <h1>Neuer Mitarbeiter</h1>
      <form @submit.prevent="handleSubmit">

        <!-- Vorname -->
        <div>
          <label>Vorname:</label>
          <input type="text" v-model="vorname" required />
        </div>

        <!-- Nachname -->
        <div>
          <label>Nachname:</label>
          <input type="text" v-model="nachname" required />
        </div>

        <!-- Geburtsdatum -->
        <div>
          <label>Geburtsdatum:</label>
          <input type="date" v-model="geburtsdatum" />
        </div>

        <!-- E-Mail -->
        <div>
          <label>Email 1:</label>
          <input type="email" v-model="email1" />
        </div>
        <div>
          <label>Email 2:</label>
          <input type="email" v-model="email2" />
        </div>

        <!-- Telefon -->
        <div>
          <label>Telefon 1:</label>
          <input type="tel" v-model="telefon1" />
        </div>
        <div>
          <label>Telefon 2:</label>
          <input type="tel" v-model="telefon2" />
        </div>

        <!-- Adresse -->
        <div class="adresse">
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

        <!-- Arbeitsstunden -->
        <div>
          <label>Arbeitsstunden:</label>
          <input type="number" v-model="arbeitsstunden" />
        </div>

        <!-- Springer -->
        <div class="springer">
          <label>Springer:</label>
          <label>
            <input type="radio" v-model="springer" :value="true" /> Ja
          </label>
          <label>
            <input type="radio" v-model="springer" :value="false" /> Nein
          </label>
          <span v-if="springer === undefined" class="nichtBekannt">Nicht bekannt</span>
        </div>

        <!-- Hauptfiliale -->
        <div class="hauptfiliale">
          <label>Hauptfiliale:</label>
          <select v-model="hauptfiliale" required>
            <option disabled value="">Hauptfiliale wählen...</option>
            <option v-for="filiale in filialen" :key="filiale.id" :value="filiale.id">
              {{ filiale.name }}
            </option>
          </select>
        </div>

        <!-- Nebenfilialen -->
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

        <!-- Anmerkungen -->
        <div>
          <label>Anmerkungen:</label>
          <textarea rows="4" v-model="anmerkungen"></textarea>
        </div>

        <!-- Buttons -->
        <div class="modal-actions">
          <button type="submit">Erstellen</button>
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

.mitarbeiterCreate-container {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
}
</style>