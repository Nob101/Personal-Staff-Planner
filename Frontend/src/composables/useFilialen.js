// useFilialen.js
// Gesamte Script-Logik für Filialen
// FilialenView enthält nur Template + Event-Handler-Calls
// Backend Requests laufen über Service

import { ref, onMounted, computed } from 'vue'
import * as filialenService from '@/services/filialenService'
import * as mitarbeiterService from '@/services/mitarbeiterService'

export function useFilialen() {
  // --- State ---
  const filialen = ref([])
  const mitarbeiter = ref([])

  const searchTerm = ref('')

  const filteredFilialen = computed(() => {
    const q = searchTerm.value.toLowerCase().trim()
    if (!q) return filialen.value

    return filialen.value.filter(f =>
      Object.values(f)
        .filter(v =>
          typeof v === 'string' ||
          typeof v === 'number'
        )
        .some(v =>
          v.toString().toLowerCase().includes(q)
        )
    )
  })

  // --- Modale & Selection ---
  const showModalFilialeCreate = ref(false)
  const showModalFilialeEdit = ref(false)
  const selectedFiliale = ref(null)

  const selectedFilialeToDelete = ref(null)
  const showDeleteModal = ref(false)

  // --- Daten laden ---
  async function loadData() {
    try {
      filialen.value = (await filialenService.getFilialen()).data
      mitarbeiter.value = (await mitarbeiterService.getMitarbeiter()).data
    } catch (err) {
      console.error(err)
    }
  }

  onMounted(loadData)

  // --- CRUD ---
  async function handleFilialeCreate(neu) {
    try {
      const res = await filialenService.createFiliale(neu)
      filialen.value.push(res.data)
    } catch (err) {
      console.error('Fehler beim Erstellen:', err)
    }
  }

  function handleEdit(f) {
    selectedFiliale.value = f
    showModalFilialeEdit.value = true
  }

  async function handleFilialeEdit(editedData) {
    try {
      const res = await filialenService.updateFiliale(editedData)
      const index = filialen.value.findIndex(f => f.id === editedData.id)
      if (index !== -1) {
        filialen.value[index] = res.data
      }
    } catch (err) {
      console.error('Fehler beim Bearbeiten:', err)
    }
  }

  function handleDelete(f) {
    selectedFilialeToDelete.value = f
    showDeleteModal.value = true
  }

  async function confirmDelete() {
    if (!selectedFilialeToDelete.value) return

    try {
      await filialenService.deleteFiliale(selectedFilialeToDelete.value.id)
      filialen.value = filialen.value.filter(
        f => f.id !== selectedFilialeToDelete.value.id
      )
      selectedFilialeToDelete.value = null
      showDeleteModal.value = false
    } catch (err) {
      console.error('Fehler beim Löschen:', err)
    }
  }

  function cancelDelete() {
    selectedFilialeToDelete.value = null
    showDeleteModal.value = false
  }

  return {
    // State
    filialen,
    mitarbeiter,

    // Search
    searchTerm,
    filteredFilialen,

    // Modals
    showModalFilialeCreate,
    showModalFilialeEdit,
    showDeleteModal,

    // Selection
    selectedFiliale,
    selectedFilialeToDelete,

    // CRUD
    handleFilialeCreate,
    handleEdit,
    handleFilialeEdit,
    handleDelete,
    confirmDelete,
    cancelDelete
  }
}