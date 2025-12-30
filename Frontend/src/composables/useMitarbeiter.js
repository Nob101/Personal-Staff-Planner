//useMitarbeiter.js Composable
//Hier ist gesamte Script-Logik für Mitarbeiter. MitarbeiterView  enthält nur noch mehr Template + Event-Handler-Calls
//Alle Refs, Modale, Funktionen (Create, Edit, Delete, Daten laden) kommen
//JSON Server Requests laufen über Service

//ref -> reaktiv, onMounted -> wird als erstes gemacht wenn ein Vue-File/Komponent geladen wird
//getMitarbeiter und GetFilialen holt sich die Daten vom Backend übers Service
import { ref, onMounted } from 'vue'
import * as mitarbeiterService from "@/services/mitarbeiterService"
import * as filialenService from "@/services/filialenService"

export function useMitarbeiter() {
  // --- State ---
  const mitarbeiter = ref([])
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
  //onMounted -> ladet die Daten wenn ein Vue-File/Komponent "geöffnet" wird
  onMounted(loadData)

  // --- CRUD Funktionen ---
  async function handleMitarbeiterCreate(neu) {
    try {
      const res = await mitarbeiterService.createMitarbeiter(neu)
      // Antwort vom Backend (inkl. ID) direkt in das Array pushen?? Geht das so?
      mitarbeiter.value.push(res.data)
    } catch (err) {
      console.error("Fehler beim Erstellen:", err)
    }
  }

  //Öffnet Ändern Modal wenn bei einem Mitarbeiter auf "Bearbeiten" geklickt wird
  function handleEdit(mitarbeiter) {
    selectedMitarbeiter.value = mitarbeiter
    showModalMitarbeiterEdit.value = true
  }
  //Überschreibt bestehende Mitarbeiterdaten mit den geänderten Daten
  async function handleMitarbeiterEdit(editedData) {
    try {
      const res = await mitarbeiterService.updateMitarbeiter(editedData)
      const index = mitarbeiter.value.findIndex(m => m.id === editedData.id)
      if (index !== -1) {
        mitarbeiter.value[index] = res.data
      }
    } catch (err) {
      console.error("Fehler beim Bearbeiten:", err)
    }
  }
  //Öffnet das Bestätigungsmodal für den ausgewählten Mitarbeiter
  function handleDelete(mitarbeiter) {
    selectedMitarbeiterToDelete.value = mitarbeiter
    showDeleteModal.value = true
  }
  //löscht den ausgewählten Mitarbeiter nach Bestätigung
  async function confirmDelete() {
    if (!selectedMitarbeiterToDelete.value) return

    try {
      await mitarbeiterService.deleteMitarbeiter(selectedMitarbeiterToDelete.value.id)
      mitarbeiter.value = mitarbeiter.value.filter(m => m.id !== selectedMitarbeiterToDelete.value.id)
      selectedMitarbeiterToDelete.value = null
      showDeleteModal.value = false
    } catch (err) {
      console.error("Fehler beim Löschen:", err)
    }
  }
  //schließt das Berstätigungs-Modal wenn Abbrechen/ESC gedrückt wird
  function cancelDelete() {
    selectedMitarbeiterToDelete.value = null
    showDeleteModal.value = false
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
    cancelDelete
  }
}