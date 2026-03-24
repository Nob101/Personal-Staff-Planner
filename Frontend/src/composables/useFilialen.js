// useFilialen.js
// ============================================================================
// Composables für die Filialen-Logik
// Aufgaben dieser Datei:
// - State-Management für die Filialen
// - Kapselung der API-Aufrufe (CRUD) via filialenService
// - Vorbereiten der reaktiven Daten und Handler-Funktionen für Components
// ============================================================================

import { ref, onMounted, computed } from 'vue'
import * as filialenService from '@/services/filialenService'
import * as mitarbeiterService from '@/services/mitarbeiterService'

export function useFilialen() {
  // --- State ---
  const filialen = ref([])
  const mitarbeiter = ref([])
  const searchTerm = ref('')
  const isLoading = ref(true)

  // --- Sortiermöglichkeiten ---
  const sortOption = ref('nameAsc')
  const sortOptions = [
    { label: 'Filialname (A → Z)', value: 'nameAsc' },
    { label: 'Filialname (Z → A)', value: 'nameDesc' }
  ]

  // --- Filter-Logik für die Suche ---
  const filteredFilialen = computed(() => {
    const q = searchTerm.value.toLowerCase().trim()
    if (!q) return filialen.value

    return filialen.value.filter(f =>
      Object.values(f)
        .filter(wert => typeof wert === 'string' || typeof wert === 'number')
        .some(wert => wert.toString().toLowerCase().includes(q))
    )
  })

  // --- Sortier-Logik (alphabetisch nach filialname) ---
  const sortedFilialen = computed(() => {
    const list = [...filteredFilialen.value]
    switch (sortOption.value) {
      case 'nameAsc':
        return list.sort((a, b) => (a.filialname || '').localeCompare(b.filialname || ''))
      case 'nameDesc':
        return list.sort((a, b) => (b.filialname || '').localeCompare(a.filialname || ''))
      default:
        return list
    }
  })

  // --- Modale & Selektion ---
  const showModalFilialeCreate = ref(false)
  const showModalFilialeEdit = ref(false)
  const showDeleteModal = ref(false)
  const selectedFiliale = ref(null)
  const selectedFilialeToDelete = ref(null)

  // --- Daten laden ---
  // onMounted wird ausgeführt, wenn das entsprechende Vue-File geladen wird
  async function loadData() {
    isLoading.value = true
    try {
      const [resF, resM] = await Promise.all([
        filialenService.getFilialen(),
        mitarbeiterService.getMitarbeiter()
      ])
      filialen.value = resF.data
      mitarbeiter.value = resM.data
    } catch (err) {
      console.error("Fehler beim Laden der Daten:", err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(loadData)

  // --- CRUD Funktionen ---

  // Erstellt eine neue Filiale im Backend
  async function handleFilialeCreate(neu) {
    try {
      const res = await filialenService.createFiliale(neu)
      filialen.value.push(res.data)
    } catch (err) {
      console.error("Fehler beim Erstellen:", err)
    }
  }

  // Öffnet das Bearbeiten-Modal
  function handleEdit(f) {
    selectedFiliale.value = f
    showModalFilialeEdit.value = true
  }

  // (notwendig fürs Design/Overlay):
  // List-Click soll Details öffnen (wie bei Mitarbeiter)
  function handleSelect(f) {
    selectedFiliale.value = f
  }

  // (notwendig fürs Design/Overlay):
  // Schließt die Detailansicht und wechselt zurück in die Liste
  function closeDetails() {
    selectedFiliale.value = null
  }

  // Aktualisiert eine bestehende Filiale
  async function handleFilialeEdit(editedData) {
    try {
      const res = await filialenService.updateFiliale(editedData)
      const index = filialen.value.findIndex(f => f.fnr === editedData.fnr)
      if (index !== -1) {
        filialen.value[index] = res.data
      }

      // (notwendig fürs Design/Overlay):
      // Wenn diese Filiale gerade im Detail-Overlay offen ist, sofort aktualisieren
      if (selectedFiliale.value?.fnr === editedData.fnr) {
        selectedFiliale.value = res.data
      }
    } catch (err) {
      console.error("Fehler beim Bearbeiten:", err)
    }
  }

  // Öffnet das Bestätigungsmodal zum Löschen
  function handleDelete(f) {
    selectedFilialeToDelete.value = f
    showDeleteModal.value = true
  }

  // Löscht die Filiale nach Bestätigung endgültig
  async function confirmDelete() {
    if (!selectedFilialeToDelete.value) return
    try {
      const deletedFnr = selectedFilialeToDelete.value.fnr

      await filialenService.deleteFiliale(deletedFnr)
      filialen.value = filialen.value.filter(f => f.fnr !== deletedFnr)

      // (notwendig fürs Design/Overlay):
      // Detail-Overlay schließen, wenn genau diese Filiale offen ist
      if (selectedFiliale.value?.fnr === deletedFnr) {
        selectedFiliale.value = null
      }

      selectedFilialeToDelete.value = null
      showDeleteModal.value = false
    } catch (err) {
      console.error("Fehler beim Löschen:", err)
    }
  }

  // Schließt das Löschmodal ohne Aktion
  function cancelDelete() {
    selectedFilialeToDelete.value = null
    showDeleteModal.value = false
  }

  return {
    filialen,
    mitarbeiter,
    isLoading,
    searchTerm,
    filteredFilialen,
    sortedFilialen,
    sortOption,
    sortOptions,
    showModalFilialeCreate,
    showModalFilialeEdit,
    showDeleteModal,
    selectedFiliale,
    handleFilialeCreate,
    handleEdit,
    handleSelect,   
    closeDetails,   
    handleFilialeEdit,
    handleDelete,
    confirmDelete,
    cancelDelete
  }
}
