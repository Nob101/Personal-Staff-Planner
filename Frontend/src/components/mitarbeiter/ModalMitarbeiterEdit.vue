<!-- ModalMitarbeiterEdit.vue-->
 <!-- ModalMitarbeiterCreate.vue -->
<!-- TODO:
        - Code muss geschrieben werden. So nicht passend.
        - Input-Felder müssen noch geändert/ergänzt werden je nach Anforderung. Drop-downs für Filialen etc.
        - Geburtsdatum Eingabefeld ladet nicht bestehendes
-->

<script setup>
import { ref, watch } from 'vue'

// Emits, um das Modal zu schließen / bearbeiten
const emit = defineEmits(['close', 'mitarbeiterEdit'])

// Reaktive Formularfelder, initialisiert mit den Werten des übergebenen Mitarbeiters
const props = defineProps({
  mitarbeiter: {
    type: Object,
    required: true
  }
})

// Lokale Kopie der Daten (nicht direkt vom Props!)
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


// Watch füllt die lokalen Refs mit den Prop-Daten
// Vue beobachtet das mitarbeiter-Prop reaktiv mit () => props.mitarbeiter
// (editedMitarbeiter) ist der neue Wert des Props, wird getriggert wenn sich das Prop ändert
// immediate: true sorgt dafür, dass die Watch-Funktion sofort beim Komponenten-Mount ausgelöst wird
watch(() => props.mitarbeiter, (editedMitarbeiter) => {
  if (editedMitarbeiter) {
    vorname.value = editedMitarbeiter.vorname || ''
    nachname.value = editedMitarbeiter.nachname || ''
    geburtsdatum.value = editedMitarbeiter.geburtsdatum || ''
    email.value = editedMitarbeiter.email || ''
    telefon1.value = editedMitarbeiter.telefon1 || ''
    telefon2.value = editedMitarbeiter.telefon2 || ''
    strasse.value = editedMitarbeiter.strasse || ''
    ort.value = editedMitarbeiter.ort || ''
    postleitzahl.value = editedMitarbeiter.postleitzahl || ''
    anmerkungen.value = editedMitarbeiter.anmerkungen || ''
  }
}, { immediate: true })


function handleSubmit() {
 emit('mitarbeiterEdit', {
    id: props.mitarbeiter.id,
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
  emit('close')
}


</script>

<template>
  <div class="modal-background">
    <div class="mitarbeiterEdit-container">
      <h1>{{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}</h1>
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
          <textarea rows="3"v-model="anmerkungen"></textarea>
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