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
  const isLoading = ref(true)
  const searchTerm = ref('')
  const sortOption = ref('nameAsc') // Default: alphabetisch aufsteigend

    // --- Sortiermöglichkeiten ---
  const sortOptions = [
    { label: 'Alphabetisch (A → Z)', value: 'nameAsc' },
    { label: 'Alphabetisch (Z → A)', value: 'nameDesc' },
    { label: 'Nach Filiale (A → Z)', value: 'filialeName' },
    { label: 'Nach Filiale (Z → A)', value: 'filialeNameDesc' }

  ]

  
const filteredMitarbeiter = computed(() => {
  const q = searchTerm.value.toLowerCase().trim()
  if (!q) return mitarbeiter.value

  return mitarbeiter.value.filter(m => {
    // 1. Alle flachen Werte des Mitarbeiters prüfen (vorname, nachname, email1, email2, telefon1, telefon2, strasse, ort, plz, anmerkungen...)
    const mainFieldsMatch = Object.values(m).some(val => 
      (typeof val === 'string' || typeof val === 'number') && 
      val.toString().toLowerCase().includes(q)
    )

    // 2. Hauptfiliale (Name)
    const hauptfilialeMatch = m.hauptfiliale?.name?.toLowerCase().includes(q)

    // 3. Alle Nebenfilialen (Namen) im Array prüfen
    const nebenfilialenMatch = m.nebenfilialen?.some(f => 
      f.name?.toLowerCase().includes(q)
    )

    return mainFieldsMatch || hauptfilialeMatch || nebenfilialenMatch
  })
})

  const sortedMitarbeiter = computed(() => {
  const list = [...filteredMitarbeiter.value]
  switch (sortOption.value) {
    case 'nameAsc':
      return list.sort((a,b) => (a.vorname + ' ' + a.nachname).toLowerCase().localeCompare((b.vorname + ' ' + b.nachname).toLowerCase()))
    case 'nameDesc':
      return list.sort((a,b) => (b.vorname + ' ' + b.nachname).toLowerCase().localeCompare((a.vorname + ' ' + a.nachname).toLowerCase()))
    case 'filialeName':
      return list.sort((a,b) => {
        const filialeA = a.hauptfiliale?.name?.toLowerCase() || ''
        const filialeB = b.hauptfiliale?.name?.toLowerCase() || ''
        if (filialeA === filialeB) {
          return (a.vorname + ' ' + a.nachname).toLowerCase().localeCompare((b.vorname + ' ' + b.nachname).toLowerCase())
        }
        return filialeA.localeCompare(filialeB)
      })
    case 'filialeNameDesc':
      return list.sort((a,b) => {
        const filialeA = a.hauptfiliale?.name?.toLowerCase() || ''
        const filialeB = b.hauptfiliale?.name?.toLowerCase() || ''
        if (filialeA === filialeB) {
          return (a.vorname + ' ' + a.nachname).toLowerCase().localeCompare((b.vorname + ' ' + b.nachname).toLowerCase())
        }
        return filialeB.localeCompare(filialeA)
      })

    default:
      return list
  }
})


  const showModalMitarbeiterCreate = ref(false)
  const showModalMitarbeiterEdit = ref(false)
  const selectedMitarbeiter = ref(null)
  const selectedMitarbeiterToDelete = ref(null)
  const showDeleteModal = ref(false)

  // --- Daten vom Backend mit Service laden ---
  async function loadData() {
    try {
      const resMitarbeiter = await mitarbeiterService.getMitarbeiter()
      mitarbeiter.value = resMitarbeiter.data

      filialen.value = (await filialenService.getFilialen()).data
    } catch (err) {
      console.error(err)
    } finally {
    isLoading.value = false
  }
  }
  // onMounted -> ladet die Daten wenn ein Vue-File/Komponent "geöffnet" wird
  onMounted(loadData)

  // --- CRUD Funktionen ---
  async function handleMitarbeiterCreate(neu) {
    try {
      const res = await mitarbeiterService.createMitarbeiter(neu)
      
      mitarbeiter.value.push(res.data)
      showModalMitarbeiterCreate.value = false
    } catch (err) {
      console.error("Fehler beim Erstellen:", err)
    }
  }

  // Öffnet Ändern Modal wenn bei einem Mitarbeiter auf "Bearbeiten" geklickt wird
  function handleEdit(m) {
    //NEU: Stellt sicher, dass das Edit-Formular beim Öffnen valide Stunden (mind. 40) hat
    selectedMitarbeiter.value = {
      ...m,
      arbeitsstunden: m.arbeitsstunden
    }
    showModalMitarbeiterEdit.value = true
  }

  // Überschreibt bestehende Mitarbeiterdaten mit den geänderten Daten
  async function handleMitarbeiterEdit(editedData) {
    try {
      //NEU: Mappt vor dem Absenden wieder auf den DB-Namen 'arbeitnehmertyp'
      const payload = {
        ...editedData,

        arbeitsstunden: editedData.arbeitsstunden ?? editedData.arbeitnehmertyp,
        arbeitnehmertyp: editedData.arbeitsstunden ?? editedData.arbeitnehmertyp
      }
      const res = await mitarbeiterService.updateMitarbeiter(payload)

      const index = mitarbeiter.value.findIndex(m => m.id === editedData.id)
      if (index !== -1) {
        //NEU: Aktualisiert Liste mit gemappten Daten vom Server
        mitarbeiter.value[index] = {
          ...res.data,
          arbeitsstunden: res.data.arbeitnehmertyp 
        }
      }

      /* WHY: Design/Overlay zeigt selectedMitarbeiter separat.
         Wenn du im Detail-Overlay bearbeitest, bleibt sonst der alte Stand angezeigt,
         obwohl die Liste schon aktualisiert ist. */
      if (selectedMitarbeiter.value?.id === editedData.id) {
      selectedMitarbeiter.value = mitarbeiter.value[index];
      }
        showModalMitarbeiterEdit.value = false  //NEU: Schließt Modal nach Erfolg
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

      mitarbeiter.value = mitarbeiter.value.filter(m => m.id !== deletedId)

      /* WHY: Wenn der gelöschte Mitarbeiter gerade im Detail-Overlay offen ist,
         muss das Overlay geschlossen werden, sonst zeigt es einen Datensatz,
         den es in der Liste nicht mehr gibt. */
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
  async function getVerfuegbareMitarbeiter(filialeFNR, datum) {
    try {
      const res = await mitarbeiterService.getVerfuegbareMitarbeiter(filialeFNR, datum)
      return res.data
    } catch (err) {
      console.error("Fehler beim Abrufen verfügbarer Mitarbeiter:", err)
      return []
    }
  }

  /* WHY: Design hat eine List-Ansicht + Detail-Overlay.
     Klick auf eine Card soll den Mitarbeiter "auswählen". */
  function handleSelect(m) {
    selectedMitarbeiter.value = m
  }

  /* WHY: Design braucht eine saubere Möglichkeit, das Detail-Overlay zu schließen. */
  function closeDetails() {
    selectedMitarbeiter.value = null
  }

  return {
    mitarbeiter,
    filialen,
    isLoading,
    searchTerm,
    filteredMitarbeiter,
    sortedMitarbeiter,
    sortOption,
    sortOptions,
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