<!-- ModalMitarbeiterCreate.vue -->
<!-- TODO:
        - Input-Felder müssen noch geändert/ergänzt werden je nach Anforderung. Drop-downs für Filialen etc.
-->

<script setup>
import { ref } from 'vue'

// Emits um das Modal zu schließen / erstellen
const emit = defineEmits(['close', 'mitarbeiterCreate'])

// Leere, reaktive Formularfelder
const vorname = ref('')
const nachname = ref('')
const geburtsdatum = ref('')
const email = ref('')
const telefon1 = ref('')
const telefon2 = ref('')
const strasse = ref('')
const ort = ref('')
const postleitzahl = ref('')
const anmerkungen = ref('')

// Submit-Funktion (schickt Daten an Parent - MitarbeiterView)
function handleSubmit() {
  // Emit mit den neuen Mitarbeiterdaten
  emit('mitarbeiterCreate', {
    vorname: vorname.value,
    nachname: nachname.value,
    geburtsdatum: geburtsdatum.value,
    email: email.value,
    telefon1: telefon1.value,
    telefon2: telefon2.value,
    strasse: strasse.value,
    ort: ort.value,
    postleitzahl: postleitzahl.value,
    anmerkungen: anmerkungen.value
  })
  // Modal schließen nach dem Erstellen
  emit('close')
}
</script>

<template>
  <div class="modal-background">
    <div class="mitarbeiterCreate-container">
      <h1>Neuer Mitarbeiter</h1>
      <form @submit.prevent="handleSubmit">
        <div>
          <label>Vorname:</label>
          <input type="text" v-model="vorname" />
        </div>
        <div>
          <label>Nachname:</label>
          <input type="text" v-model="nachname" />
        </div>
        <div>
          <label>Geburtsdatum:</label>
          <input type="date" v-model="geburtsdatum" />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" v-model="email" />
        </div>
        <div>
          <label>Telefon 1:</label>
          <input type="tel" v-model="telefon1" />
        </div>
        <div>
          <label>Telefon 2:</label>
          <input type="tel" v-model="telefon2" />
        </div>
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
            <input type="number" v-model="postleitzahl" />
          </div>
        </div>
        <div>
          <label>Anmerkungen</label>
          <textarea rows="4"v-model="anmerkungen"></textarea>
        </div>
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