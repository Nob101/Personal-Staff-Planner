<!-- MitarbeiterView.vue -->
<!-- TODO:
        - Mitarbeiter ID: Was passiert wenn ein Mitarbeiter gelöscht wird? Neuvergabe der IDs?
-->
<script setup>
// Funktionalitäten und Komponenten importieren
import { ref } from 'vue'
import MitarbeiterActionBar from '@/components/mitarbeiter/MitarbeiterActionBar.vue'
import MitarbeiterList from '@/components/mitarbeiter/MitarbeiterList.vue'
import ModalMitarbeiterCreate from '@/components/mitarbeiter/ModalMitarbeiterCreate.vue'
import ModalMitarbeiterEdit from '@/components/mitarbeiter/ModalMitarbeiterEdit.vue'

// Dummy-Daten für Test
const mitarbeiter = ref([
  {
    id: 1,
    vorname: 'Max',
    nachname: 'Müller',
    geburtsdatum: '15.01.1985',
    email: '',
    telefon1: '01234 567890',
    telefon2: '',
    strasse: 'Musterstraße 1',
    ort: 'Musterstadt',
    postleitzahl: '1234',
    hauptfilialeId: 2,
    nebenfilialenIds: [1, 3],
    springer: true,
    springerAlgorithmId: 1,
    counter: 5
  },
  {
    id: 2,
    vorname: 'Lisa',
    nachname: 'Meyer',
    geburtsdatum: '15.01.1985',
    email: '',
    telefon1: '01234 567890',
    telefon2: '',
    strasse: 'Musterstraße 1',
    ort: 'Musterstadt',
    postleitzahl: '1234',
    hauptfilialeId: 1,
    nebenfilialenIds: [],
    springer: false,
    springerAlgorithmId: null,
    counter: 2
  }
])

// Event-Funktionen

//Temporärer Konsolen-Log für Edit. MUSS NOCH IMPLEMENTIERT WERDEN!
//function handleEdit(mitarbeiter) {
//  console.log('Bearbeiten:', mitarbeiter)
//}
//temporärer Konsolen-Log für Delete. MUSS NOCH IMPLEMENTIERT WERDEN!
function handleDelete(mitarbeiter) {
  console.log('Löschen:', mitarbeiter)
}

//Fügt neuen Mitarbeiter dem Mitarbeiter-Array hinzu. MUSS MÖGLICHERWEISE NOCH ANS BACKEND ANGEPASST WERDEN!
function handleMitarbeiterCreate(neu) {
  mitarbeiter.value.push({
    id: mitarbeiter.value.length + 1, // Beispiel-ID. In Realität sollte diese vom Backend vergeben werden?
    vorname: neu.vorname,
    nachname: neu.nachname,
    geburtsdatum: neu.geburtsdatum,
    email: neu.email,
    telefon1: neu.telefon1,
    telefon2: neu.telefon2,
    strasse: neu.strasse,
    ort: neu.ort,
    postleitzahl: neu.postleitzahl,
    anmerkungen: neu.anmerkungen,
    hauptfilialeId: null,
    nebenfilialenIds: [],
    springer: false,
    springerAlgorithmId: null,
    counter: 0
  })
}
//Modale - Steuerung

//Mitarbeiter Erstellen Modal
let showModalMitarbeiterCreate = ref(false)
function openModalMitarbeiterCreate() {
  showModalMitarbeiterCreate.value = true
}

//Mitarbeiter Ändern Modal - NOCH NICHT IMPLEMENTIERT
const selectedMitarbeiter = ref(null)
const showModalMitarbeiterEdit = ref(false)

function handleEdit(mitarbeiter) {
  selectedMitarbeiter.value = mitarbeiter
  showModalMitarbeiterEdit.value = true
}

function handleMitarbeiterEdit(editedData) {
  const index = mitarbeiter.value.findIndex(m => m.id === editedData.id)
  if (index !== -1) {
    mitarbeiter.value[index] = { ...mitarbeiter.value[index], ...editedData }
  }
}

</script>

<template>
  <div class="mitarbeiter-view container mx-auto p-4">
    <!-- ActionBar -->
    <MitarbeiterActionBar @mitarbeiterCreate="openModalMitarbeiterCreate" />

    <!-- Mitarbeiter Liste -->
    <MitarbeiterList :mitarbeiter="mitarbeiter" @edit="handleEdit" @delete="handleDelete" />

    <!-- Modale ganz am Ende des Containers, damit es über allem liegt -->
    <ModalMitarbeiterCreate v-if="showModalMitarbeiterCreate" @close="showModalMitarbeiterCreate = false" @mitarbeiterCreate="handleMitarbeiterCreate" />
    <ModalMitarbeiterEdit v-if="showModalMitarbeiterEdit && selectedMitarbeiter" :mitarbeiter="selectedMitarbeiter" @close="showModalMitarbeiterEdit = false" @mitarbeiterEdit="handleMitarbeiterEdit" />
  </div>
</template>
