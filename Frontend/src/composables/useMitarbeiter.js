// useMitarbeiter.js Composable
// Hier ist gesamte Script-Logik für Mitarbeiter. MitarbeiterView enthält nur noch Template + Event-Handler-Calls
// Alle Refs, Modale, Funktionen (Create, Edit, Delete, Daten laden) kommen
// JSON Server Requests laufen über Service

// ref -> reaktiv, onMounted -> wird als erstes gemacht, wenn ein Vue-File/Komponent geladen wird
// getMitarbeiter und getFilialen holt sich die Daten vom Backend übers Service
import { ref, onMounted, h } from 'vue'
import * as mitarbeiterService from "@/services/mitarbeiterService"
import * as filialenService from "@/services/filialenService"

export function useMitarbeiter() {
  // --- State ---
  const mitarbeiter = ref([{ // Beispiel-Daten für Vorschau
      id: 1,
      vorname: "Max",
      nachname: "Mustermann",
      telefon1: "0664 123456",
      email1: "max.mustermann@test.at",
      hauptfiliale: 1,
    },
    {
      id: 2,
      vorname: "Anna",
      nachname: "Musterfrau",
      telefon1: "0676 987654",
      email1: "anna@test.at",
      hauptfiliale: 2,
    },])


  const filialen = ref([])

  const showModalMitarbeiterCreate = ref(false)
  const showModalMitarbeiterEdit = ref(false)
  const selectedMitarbeiter = ref(null)
  const selectedMitarbeiterToDelete = ref(null)
  const showDeleteModal = ref(false)

  // --- Daten vom Backend mit Service laden ---
  async function loadData() {
    try {
      const mitarbeiterRes = await mitarbeiterService.getMitarbeiter()
      mitarbeiter.value = mitarbeiterRes.data

      const filialenRes = await filialenService.getFilialen()
      filialen.value = filialenRes.data
    } catch (err) {
      console.error("Fehler beim Laden der Daten:", err)
    }
  }
  // onMounted -> ladet die Daten wenn ein Vue-File/Komponent "geöffnet" wird
  onMounted(loadData)

  // --- CRUD Funktionen ---
  async function handleMitarbeiterCreate(neu) {
    try {
      const res = await mitarbeiterService.createMitarbeiter(neu)
      mitarbeiter.value.push(res.data)
    } catch (err) {
      console.error("Fehler beim Erstellen:", err)
    }
  }

  // Öffnet Ändern Modal wenn bei einem Mitarbeiter auf "Bearbeiten" geklickt wird
  function handleEdit(m) {
    selectedMitarbeiter.value = m
    showModalMitarbeiterEdit.value = true
  }

  // Überschreibt bestehende Mitarbeiterdaten mit den geänderten Daten
  async function handleMitarbeiterEdit(editedData) {
    try {
      const res = await mitarbeiterService.updateMitarbeiter(editedData)
      const index = mitarbeiter.value.findIndex(m => m.id === editedData.id)
      if (index !== -1) {
        mitarbeiter.value[index] = { ...res.data }
      }
  // Zusatz, um Mitarbeiter aktualisiert anzuzeigen
      if (selectedMitarbeiter.value && selectedMitarbeiter.value.id === editedData.id) {
        selectedMitarbeiter.value = { ...res.data }
      }
    } catch (err) {
      console.error("Fehler beim Bearbeiten:", err)
    }
  }

  // Öffnet das Bestätigungsmodal für den ausgewählten Mitarbeiter
  function handleDelete(m) {
    selectedMitarbeiterToDelete.value = m
    showDeleteModal.value = true
  }

  // Löscht den ausgewählten Mitarbeiter nach Bestätigung
async function confirmDelete() {
  if (!selectedMitarbeiterToDelete.value) return

  try {
    const deletedId = selectedMitarbeiterToDelete.value.id

    await mitarbeiterService.deleteMitarbeiter(deletedId)

    // aus der Liste entfernen
    mitarbeiter.value = mitarbeiter.value.filter(m => m.id !== deletedId)

    // Detail-Overlay schließen, wenn genau dieser Mitarbeiter offen ist
    if (selectedMitarbeiter.value?.id === deletedId) {
      selectedMitarbeiter.value = null
    }

    selectedMitarbeiterToDelete.value = null
    showDeleteModal.value = false
  } catch (err) {
    console.error("Fehler beim Löschen:", err)
  }
}


  // Schließt das Bestätigungs-Modal wenn Abbrechen/ESC gedrückt wird
  function cancelDelete() {
    selectedMitarbeiterToDelete.value = null
    showDeleteModal.value = false
  }

  // --- Zusätzliche Funktion: Verfügbare Mitarbeiter nach Filiale & Datum abrufen || unnötig?---
  async function getVerfuegbareMitarbeiter(filialeId, datum) {
    try {
      const res = await mitarbeiterService.getVerfuegbareMitarbeiter(filialeId, datum)
      return res.data
    } catch (err) {
      console.error("Fehler beim Abrufen verfügbarer Mitarbeiter:", err)
      return []
    }
  }

  // Neue Funktionen um von MitarbeiterList in die MitarbeiterCard zu wechseln
  function handleSelect(m) {
    selectedMitarbeiter.value = m
  }

  // Schließt die Detailansicht und wechselt zurück in MitarbeiterList
  function closeDetails() {
    selectedMitarbeiter.value = null
  }

  return {
    mitarbeiter,
    filialen,
    showModalMitarbeiterCreate,
    showModalMitarbeiterEdit,
    selectedMitarbeiter,
    selectedMitarbeiterToDelete,
    showDeleteModal,
    handleMitarbeiterCreate,
    handleEdit,
    handleMitarbeiterEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
    getVerfuegbareMitarbeiter,
    handleSelect,
    closeDetails
  }
}
