// useBenutzer.js
// ============================================================================
// Composables für die Benutzer-Logik
// Aufgaben dieser Datei:
// - State-Management für die Benutzerliste
// - Kapselung der API-Aufrufe (CRUD) via benutzerService
// - Vorbereiten der reaktiven Daten und Handler-Funktionen für Components
// ============================================================================

import { ref, onMounted } from 'vue'
import * as benutzerService from '@/services/benutzerService'

export function useBenutzer() {
  const benutzer = ref([])
  const isLoading = ref(true)

  // Modal-Logik (Löschbestätigung)
  const showDeleteModal = ref(false)
  const benutzerToDelete = ref(null)

  // Daten laden
  async function loadData() {
    isLoading.value = true
    try {
      const res = await benutzerService.getBenutzer()
      benutzer.value = res.data
    } catch (err) {
      console.error('Ladefehler:', err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(loadData)

  // CRUD - Erstellen eines neuen Benutzers
  async function handleCreate(userData) {
    try {
      const res = await benutzerService.createBenutzer(userData)
      
      // Server schickt Antwort(id, username, role)
      // Passwort aus userData hinzu hinzufügen
      const neuerBenutzer = {
        ...res.data,
        password: userData.password
      }

      benutzer.value = [...benutzer.value, neuerBenutzer]
      return true
    } catch (err) {
      console.error('Erstellen fehlgeschlagen:', err)
      return false
    }
  }

  // CRUD - Aktualisieren eines bestehenden Benutzers
  async function handleUpdate(editData) {
    try {
      await benutzerService.updateBenutzer(editData)
      const index = benutzer.value.findIndex(b => b.id === editData.id)
      if (index !== -1) {
        benutzer.value[index] = { ...editData }
      }
      return true
    } catch (err) {
      console.error('Update fehlgeschlagen:', err)
      return false
    }
  }

  // Lösch-Modal öffnen und den zu löschenden Benutzer setzen
  function openDeleteModal(b) {
    benutzerToDelete.value = b
    showDeleteModal.value = true
  }

  // Lösch-Modal schließen und den zu löschenden Benutzer zurücksetzen
  function cancelDelete() {
    showDeleteModal.value = false
    benutzerToDelete.value = null
  }

  //Löschen eines Benutzers nach Bestätigung im Modal
  async function confirmDelete() {
    if (benutzerToDelete.value) {
      try {
        await benutzerService.deleteBenutzer(benutzerToDelete.value.id)
        benutzer.value = benutzer.value.filter(b => b.id !== benutzerToDelete.value.id)
      } catch (err) {
        console.error('Löschen fehlgeschlagen')
      } finally {
        cancelDelete()
      }
    }
  }

  return { 
    benutzer, 
    isLoading, 
    showDeleteModal, 
    benutzerToDelete, 
    handleCreate, 
    handleUpdate, 
    openDeleteModal, 
    confirmDelete, 
    cancelDelete 
  }
}