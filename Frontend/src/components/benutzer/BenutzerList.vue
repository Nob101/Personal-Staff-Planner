<!-- BenutzerList.vue -->
<!-- 
============================================================================
// - Aufgaben dieser Datei:
// - Darstellung der Benutzerverwaltungsliste mit Möglichkeit zum Anlegen, Bearbeiten und Löschen von Benutzern
// - Anzeige aller Benutzer in Kartenform
// - Integration der BenutzerCard-Komponente für Darsellung aller Benutzer
// - Editiermodus für Benutzer mit Datenvalidierung
// ============================================================================
-->

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import BenutzerCard from '@/components/benutzer/BenutzerCard.vue'
import Multiselect from 'vue-multiselect'
import BaseLoader from '@/components/global/BaseLoader.vue'

const props = defineProps({
  benutzer: { type: Array, required: true },
  isLoading: { type: Boolean, required: true }
})

const emit = defineEmits(['create', 'update', 'delete'])

const showAddForm = ref(false)
const roles = ref(['user', 'admin'])
const newBenutzer = ref({ username: '', password: '', role: 'user' })


// Fehler-States
const usernameFehler = ref(false)
const passwordFehler = ref(false)
const adminNameFehler = ref(false)

// Erstellt neuen Benutzer nach Validierung der Eingaben, ansonsten werden Fehlermeldungen angezeigt
function confirmCreate() {
  // Reset aller Fehlermeldungen
  usernameFehler.value = false
  passwordFehler.value = false
  adminNameFehler.value = false

  const inputName = newBenutzer.value.username.trim()

  // 1. Pflichtfeld-Check
  if (!inputName) usernameFehler.value = true
  if (!newBenutzer.value.password.trim()) passwordFehler.value = true

  // 2. Admin-Check (Case Insensitive, damit auch 'Admin' oder 'ADMIN' abgefangen wird)
  if (inputName.toLowerCase() === 'admin') {
    adminNameFehler.value = true
  }

  // Wenn irgendein Fehler vorliegt, abbrechen
  if (usernameFehler.value || passwordFehler.value || adminNameFehler.value) return

  emit('create', { ...newBenutzer.value })
  cancelCreate()
}
// Erstell-Cancel und leert das Formular zurück auf die Default-Werte (leer), und entfernt Fehlermeldungen
function cancelCreate() {
  newBenutzer.value = { username: '', password: '', role: 'user' }
  usernameFehler.value = false
  passwordFehler.value = false
  adminNameFehler.value = false
  showAddForm.value = false
}
</script>

<template>
  <BaseLoader v-if="isLoading" text="Benutzer werden geladen..." />
  <!-- Zeigt alle Benutzer an. Wenn auf "Neuen Benutzer hinzufügen" geklickt wird, wird das Erstell-Formular angezeigt -->
  <div v-else class="benutzer-list-container">
    <div class="benutzer-list">
      <BenutzerCard
        v-for="b in benutzer"
        :key="b.id"
        :benutzer="b"
        @update="(data) => emit('update', data)"
        @delete="emit('delete', b)"
      />

      <div v-if="!showAddForm" class="add-placeholder" @click="showAddForm = true">
        <span class="plus-icon">+</span>
        <p>Neuen Benutzer hinzufügen</p>
      </div>

      <div v-else class="benutzer-card create-mode">
        <h2 class="form-title">Neu anlegen</h2>
        <div class="box">
          <div class="edit-row">
            <label>Name:</label>
            <div class="flex-1">
              <input 
                v-model="newBenutzer.username" 
                class="input-field" 
                :class="{ 'input-error': usernameFehler || adminNameFehler }" 
              />
              <p v-if="usernameFehler" class="error-text">Name erforderlich</p>
              <p v-if="adminNameFehler" class="error-text">Dieser Benutzername darf nicht genommen werden</p>
            </div>
          </div>

          <div class="edit-row">
            <label>Passwort:</label>
            <div class="flex-1">
              <input v-model="newBenutzer.password" class="input-field" :class="{ 'input-error': passwordFehler }" />
              <p v-if="passwordFehler" class="error-text">Passwort erforderlich</p>
            </div>
          </div>

          <div class="edit-row">
            <label>Rolle:</label>
            <multiselect v-model="newBenutzer.role" :options="roles" :searchable="false" :show-labels="false" />
          </div>
        </div>

        <div class="button-group">
          <button @click="confirmCreate" class="btn-confirm">Hinzufügen</button>
          <button @click="cancelCreate" class="btn-cancel">Abbrechen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Temporöres Styling -> von Dumitru noch zu ersetzen! -->
<style scoped>
.benutzer-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.benutzer-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 450px)); 
  gap: 24px;
  justify-content: center;
}

.add-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 280px;
  border: 2px dashed #cbd5e0;
  border-radius: 16px;
  background-color: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-placeholder:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
  color: #3b82f6;
}

.plus-icon { font-size: 3.5rem; line-height: 1; }

.benutzer-card.create-mode {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 20px;
  color: #1e293b;
  text-align: center;
}

.box {
  background: #f1f5f9;
  padding: 20px;
  border-radius: 12px;
}

.edit-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  align-items: center;
  margin-bottom: 12px;
}

.edit-row label { font-weight: 600; font-size: 0.9rem; color: #475569; }

.input-field {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #cbd5e0;
  border-radius: 8px;
  font-size: 0.95rem;
}

.button-group {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.btn-confirm { background: #22c55e; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; }
.btn-cancel { background: #94a3b8; color: white; padding: 10px 20px; border-radius: 8px; font-weight: 600; }

.error-text { color: #ef4444; font-size: 0.75rem; margin: -8px 0 8px 80px; font-weight: 600; }

.input-field {
  color: #1e293b !important; /* Dunkles Blau-Grau */
  background-color: #ffffff !important;
}


:deep(.multiselect__input),
:deep(.multiselect__single) {
  color: #1e293b !important;
  background: transparent !important;
}


.input-field::placeholder {
  color: #94a3b8;
}

:deep(.multiselect__placeholder) {
  color: #94a3b8 !important;
}

.input-error { border-color: #ef4444 !important; background-color: #fef2f2 !important; }
.error-text { color: #ef4444; font-size: 0.75rem; margin-top: 2px; font-weight: 600; }
.flex-1 { flex: 1; }
</style>
