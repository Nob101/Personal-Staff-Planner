// useMitarbeiter.js Composable
// Hier ist gesamte Script-Logik für Mitarbeiter. MitarbeiterView enthält nur noch Template + Event-Handler-Calls
// Alle Refs, Modale, Funktionen (Create, Edit, Delete, Daten laden) kommen
// JSON Server Requests laufen über Service

// ref -> reaktiv, onMounted -> wird als erstes gemacht, wenn ein Vue-File/Komponent geladen wird
// getMitarbeiter und getFilialen holt sich die Daten vom Backend übers Service
import { ref, onMounted, computed } from 'vue'
import * as mitarbeiterService from "@/services/mitarbeiterService"
import * as filialenService from "@/services/filialenService"

export function useMitarbeiter() {
  // --- State ---
  const mitarbeiter = ref([])
  const filialen = ref([])

  const searchTerm = ref('')

    const filteredMitarbeiter = computed(() => {
    const q = searchTerm.value.toLowerCase().trim()
    if (!q) return mitarbeiter.value

    return mitarbeiter.value.filter(m =>
      Object.values(m)
        .filter(v =>
          typeof v === 'string' ||
          typeof v === 'number'
        )
        .some(v =>
          v.toString().toLowerCase().includes(q)
        )
    )
  })


  const showModalMitarbeiterCreate = ref(false)
  const showModalMitarbeiterEdit = ref(false)
  const selectedMitarbeiter = ref(null)
  const selectedMitarbeiterToDelete = ref(null)
  const showDeleteModal = ref(false)

  // --- Daten vom Backend mit Service laden ---
  async function loadData() {
    try {
      mitarbeiter.value = (await mitarbeiterService.getMitarbeiter()).data
      filialen.value = (await filialenService.getFilialen()).data
    } catch (err) {
      console.error(err)
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
        mitarbeiter.value[index] = res.data
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
      await mitarbeiterService.deleteMitarbeiter(selectedMitarbeiterToDelete.value.id)
      mitarbeiter.value = mitarbeiter.value.filter(m => m.id !== selectedMitarbeiterToDelete.value.id)
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
  async function getVerfuegbareMitarbeiter(filialeFNR, datum) {
    try {
      const res = await mitarbeiterService.getVerfuegbareMitarbeiter(filialeFNR, datum)
      return res.data
    } catch (err) {
      console.error("Fehler beim Abrufen verfügbarer Mitarbeiter:", err)
      return []
    }
  }

  return {
    mitarbeiter,
    filialen,
    searchTerm,
    filteredMitarbeiter,
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
    getVerfuegbareMitarbeiter
  }
}
