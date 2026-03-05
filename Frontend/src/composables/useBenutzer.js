// useBenutzer.js
import { ref, onMounted } from 'vue'
import * as benutzerService from '@/services/benutzerService'

export function useBenutzer() {
  const benutzer = ref([])
  const isLoading = ref(true)

  async function loadData() {
    isLoading.value = true
    try {
      const res = await benutzerService.getBenutzer()
      benutzer.value = res.data
    } catch (err) {
      // Kein Error-State mehr, nur ein kurzer Log für dich während der Entwicklung
      console.error('Ladefehler:', err)
    } finally {
      isLoading.value = false
    }
  }

  onMounted(loadData)

  async function handleCreate(userData) {
    try {
      const res = await benutzerService.createBenutzer(userData)
      // Wir nehmen direkt den User aus der Response (oder das userData Objekt)
      const newUser = res.data.user || userData 
      benutzer.value.push(newUser)
      return true
    } catch (err) {
      return false
    }
  }

  async function handleUpdate(editData) {
    try {
      await benutzerService.updateBenutzer(editData)
      const index = benutzer.value.findIndex(b => b.username === editData.username)
      if (index !== -1) {
        benutzer.value[index] = { ...editData }
      }
      return true
    } catch (err) {
      return false
    }
  }

  async function handleDelete(benutzerObj) {
    try {
      await benutzerService.deleteBenutzer(benutzerObj.username)
      benutzer.value = benutzer.value.filter(b => b.username !== benutzerObj.username)
    } catch (err) {
      console.error('Löschen fehlgeschlagen')
    }
  }

  return { benutzer, isLoading, handleCreate, handleUpdate, handleDelete }
}