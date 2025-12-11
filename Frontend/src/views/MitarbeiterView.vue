<!-- MitarbeiterView.vue -->
<!-- TODO:
        - Mitarbeiter ID: Was passiert wenn ein Mitarbeiter gelöscht wird? Neuvergabe der IDs?
-->
<script setup>
//Komponenten importieren
import { ref } from 'vue'
import MitarbeiterActionBar from '@/components/mitarbeiter/MitarbeiterActionBar.vue'
import MitarbeiterList from '@/components/mitarbeiter/MitarbeiterList.vue'
import ModalMitarbeiterCreate from '@/components/mitarbeiter/ModalMitarbeiterCreate.vue'
import ModalMitarbeiterEdit from '@/components/mitarbeiter/ModalMitarbeiterEdit.vue'
import BestätigungsModal from '@/components/global/BestätigungsModal.vue'

//Dummy-Daten für Testzwecke. MÜSSEN MIT BACKEND REQUESTS ersetzt werden.
const mitarbeiter = ref([
  {
    id: 1,
    vorname: 'Max',
    nachname: 'Mustermann',
    geburtsdatum: '1990-01-15',
    email1: 'max.mustermann@example.com',
    email2: 'max2@example.com',
    telefon1: '0123456789',
    telefon2: '0123456788',
    strasse: 'Musterstraße 1',
    ort: 'Musterstadt',
    postleitzahl: '2345',
    land: 'Österreich',
    arbeitsstunden: 40,
    springer: true,
    hauptfiliale: 1,
    nebenfilialen: [2],
    anmerkungen: 'Sehr motiviert'
  },
  {
    id: 2,
    vorname: 'Lisa',
    nachname: 'Müller',
    geburtsdatum: '1992-06-20',
    email1: 'lisa.mueller@example.com',
    email2: 'lisa2@example.com',
    telefon1: '0987654321',
    telefon2: '0987654322',
    strasse: 'Beispielweg 5',
    ort: 'Beispielstadt',
    postleitzahl: '4321',
    land: 'Österreich',
    arbeitsstunden: 30,
    springer: false,
    hauptfiliale: 2,
    nebenfilialen: [1, 3],
    anmerkungen: 'Teilzeit'
  }
])
const filialen = ref([
  { id: 1, name: 'Filiale A' },
  { id: 2, name: 'Filiale B' },
  { id: 3, name: 'Filiale C' }
])


//Modale - Steuerung

//Mitarbeiter Erstellen Modal
let showModalMitarbeiterCreate = ref(false)
//Funktion: Mitarbeiter Erstellen Modal öffnen

//Fügt neuen Mitarbeiter dem Mitarbeiter-Array hinzu. MUSS MÖGLICHERWEISE NOCH ANS BACKEND ANGEPASST WERDEN!
function handleMitarbeiterCreate(neu) {
  mitarbeiter.value.push({
    id: mitarbeiter.value.length + 1, // Beispiel-ID. In Realität sollte diese dann vom Backend vergeben werden!
    vorname: neu.vorname,
    nachname: neu.nachname,
    geburtsdatum: neu.geburtsdatum || null,
    email1: neu.email1 || '',
    email2: neu.email2 || '',
    telefon1: neu.telefon1 || '',
    telefon2: neu.telefon2 || '',
    strasse: neu.strasse || '',
    ort: neu.ort || '',
    postleitzahl: neu.postleitzahl || '',
    land: neu.land || '',
    arbeitsstunden: neu.arbeitsstunden ? Number(neu.arbeitsstunden) : null,                       //Arbeitstunden als Zahl, null falls leeres Inputfeld
    springer: neu.springer === true ? 'Ja' : neu.springer === false ? 'Nein' : 'Nicht bekannt',  //"Nicht bekannt" falls Ja/Nein nicht gewählt wurde
    hauptfiliale: neu.hauptfiliale || null,
    nebenfilialen: neu.nebenfilialen?.length ? neu.nebenfilialen : null,                         //// ? : prüft ob neu.nebenfilialen existiert und eine Länge > 0 hat; wenn ja wird neu.nebenfilialen genommen, sonst null
    anmerkungen: neu.anmerkungen || ''
  })
}




//Mitarbeiter Edit Modal
const showModalMitarbeiterEdit = ref(false)
//Variable für den gewählten Mitarbeiter
const selectedMitarbeiter = ref(null)

//Öffnet Ändern Modal wenn bei einem Mitarbeiter auf "Bearbeiten" geklickt wird
function handleEdit(mitarbeiter) {
  selectedMitarbeiter.value = mitarbeiter
  showModalMitarbeiterEdit.value = true
}
//Überschreibt bestehende Mitarbeiterdaten mit den geänderten
function handleMitarbeiterEdit(editedData) {
  const index = mitarbeiter.value.findIndex(m => m.id === editedData.id)
  if (index !== -1) {
    mitarbeiter.value[index] = { ...mitarbeiter.value[index], ...editedData }
  }
}

//Bestätigungs-Modal vor Löschen eines ausgewählten Mitarbeiters
const selectedMitarbeiterToDelete = ref(null)
const showDeleteModal = ref(false)

//Öffnet das Bestätigungsmodal für den ausgewählten Mitarbeiter
function handleDelete(mitarbeiter) {
  selectedMitarbeiterToDelete.value = mitarbeiter
  showDeleteModal.value = true
}
//löscht den ausgewählten Mitarbeiter nach Bestätigung
function confirmDelete() {
  if (selectedMitarbeiterToDelete.value) {
    mitarbeiter.value = mitarbeiter.value.filter(m => m.id !== selectedMitarbeiterToDelete.value.id)
    selectedMitarbeiterToDelete.value = null
  }
  showDeleteModal.value = false
}
//schließt das Berstätigungs-Modal wenn abgebrochen/ESC gedrückt wird
function cancelDelete() {
  selectedMitarbeiterToDelete.value = null
  showDeleteModal.value = false
}
</script>

<template>
  <div class="mitarbeiter-view container mx-auto p-4">
    <!-- ActionBar -->
    <MitarbeiterActionBar @mitarbeiterCreate="showModalMitarbeiterCreate = true" />

    <!-- Mitarbeiter Liste -->
    <MitarbeiterList :mitarbeiter="mitarbeiter" :filialen="filialen" @edit="handleEdit" @delete="handleDelete" />

    <!-- Modale am Ende -->
    <ModalMitarbeiterCreate 
      :show="showModalMitarbeiterCreate" 
      :filialen="filialen" 
      @close="showModalMitarbeiterCreate = false" 
      @mitarbeiterCreate="handleMitarbeiterCreate"
    />
    <ModalMitarbeiterEdit
      :show="showModalMitarbeiterEdit && selectedMitarbeiter"
      :mitarbeiter="selectedMitarbeiter"
      :filialen="filialen"
      @close="showModalMitarbeiterEdit = false"
      @mitarbeiterEdit="handleMitarbeiterEdit"
    />
    <BestätigungsModal
    :show="showDeleteModal"
    message="Möchtest du diesen Mitarbeiter wirklich löschen?"
    @confirm="confirmDelete"
    @close="cancelDelete"
    />
  </div>
</template>



