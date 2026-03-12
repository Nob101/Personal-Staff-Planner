<!-- BenutzerCard.vue -->
<!-- 
============================================================================
// Aufgaben dieser Datei:
// - Darstellung einzelner Benutzer in Kartenform
// - Buttons zum Editieren und Löschen eines Benutzers
// - Editiermodus mit Datenvalidierung für Benutzername und Passwort
// ============================================================================
-->

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import Multiselect from 'vue-multiselect'

const props = defineProps({
  benutzer: { type: Object, required: true },
  allBenutzer: { type: Array, required: true }
})

const emit = defineEmits(['update', 'delete'])

const isEditing = ref(false)
const editData = ref({ id: null, username: '', password: '', role: '' })
const roles = ref(['user', 'admin'])

// Fehler-States
const usernameFehler = ref(false)
const passwordFehler = ref(false)
const adminNameFehler = ref(false)
const usernameExistsFehler = ref(false)

function startEdit() {
  usernameFehler.value = false
  passwordFehler.value = false
  usernameExistsFehler.value = false
  editData.value = { ...props.benutzer }
  adminNameFehler.value = false
  isEditing.value = true
}

function handleSave() {
  usernameFehler.value = false
  passwordFehler.value = false
  adminNameFehler.value = false
  usernameExistsFehler.value = false

  const currentUsername = (editData.value.username || '').trim()
  const currentPassword = (editData.value.password || '').trim()

  // Validierung: Pflichtfelder
  if (!currentUsername) usernameFehler.value = true
  if (!currentPassword) passwordFehler.value = true

  // Validierung: Reservierter Name "admin"
  if (currentUsername.toLowerCase() === 'admin') {
    adminNameFehler.value = true
  }

  // Check auf bereits existierenden Benutzernamen (außer man behält seinen eigenen)
  const existiertBereits = props.allBenutzer.some(
    (b) => b.username.toLowerCase() === currentUsername.toLowerCase() && b.id !== props.benutzer.id
  )

  if (existiertBereits) {
    usernameExistsFehler.value = true
  }

  if (usernameFehler.value || passwordFehler.value || adminNameFehler.value || usernameExistsFehler.value) return

  emit('update', { ...editData.value })
  isEditing.value = false
}
</script>

<template>
  <div class="benutzer-card" :class="{ 'is-editing': isEditing }">
    <div class="card-header">
      <h3 class="username-display">
        {{ isEditing ? 'Bearbeiten' : benutzer.username }}
      </h3>
      <div class="card-actions">
        <template v-if="!isEditing">
          <button @click="startEdit" class="btn-icon edit">✎</button>
          <button @click="$emit('delete', benutzer)" class="btn-icon delete">✕</button>
        </template>
        <template v-else>
          <button @click="handleSave" class="btn-save">✔</button>
          <button @click="isEditing = false" class="btn-cancel-small">✕</button>
        </template>
      </div>
    </div>

    <div class="card-body">
      <div v-if="isEditing" class="edit-fields">
        <div class="input-group">
          <label>Name</label>
          <input 
            v-model="editData.username" 
            class="input-field" 
            :class="{ 'input-error': usernameFehler || adminNameFehler || usernameExistsFehler }" 
          />
          <p v-if="usernameFehler" class="error-text">Name ist erforderlich</p>
          <p v-if="adminNameFehler" class="error-text">Dieser Benutzername darf nicht genommen werden</p>
          <p v-if="usernameExistsFehler" class="error-text">Benutzername existiert bereits</p>
        </div>

        <div class="input-group">
          <label>Passwort</label>
          <input 
            v-model="editData.password" 
            type="password" 
            class="input-field" 
            :class="{ 'input-error': passwordFehler }" 
          />
          <p v-if="passwordFehler" class="error-text">Passwort ist erforderlich</p>
        </div>

        <div class="input-group">
          <label>Rolle</label>
          <multiselect v-model="editData.role" :options="roles" :searchable="false" :show-labels="false" />
        </div>
      </div>
      
      <div v-else class="info-grid">
        <div class="info-item">
          <span class="label">Rolle</span>
          <span class="value role-badge" :class="benutzer.role">{{ benutzer.role }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- Temporöres Styling -> von Dumitru noch zu ersetzen! -->
<style scoped>
.benutzer-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  padding: 24px;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.benutzer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

.is-editing { border-color: #3b82f6; background: #f8fafc; }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.username-display { font-size: 1.25rem; font-weight: 700; color: #1e293b; }

.card-actions { display: flex; gap: 10px; }

.btn-icon {
  width: 36px; height: 36px; border-radius: 10px; border: none;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 1rem; transition: background 0.2s;
}

.edit { background: #eff6ff; color: #3b82f6; }
.delete { background: #fef2f2; color: #ef4444; }

.btn-save { background: #22c55e; color: white; border: none; border-radius: 10px; width: 36px; height: 36px; cursor: pointer; font-size: 1.1rem; }
.btn-cancel-small { background: #94a3b8; color: white; border: none; border-radius: 10px; width: 36px; height: 36px; cursor: pointer; }

.info-item { display: flex; justify-content: space-between; align-items: center; }
.label { font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.05em; }

.role-badge {
  padding: 4px 12px; border-radius: 999px; font-size: 0.85rem; font-weight: 600;
}
.role-badge.admin { background: #fee2e2; color: #991b1b; }
.role-badge.user { background: #f1f5f9; color: #475569; }

.edit-fields { display: flex; flex-direction: column; gap: 16px; }

.input-group { display: flex; flex-direction: column; gap: 4px; }
.input-group label { font-size: 0.75rem; font-weight: 700; color: #64748b; margin-left: 4px; }

.input-field { 
  padding: 10px 14px; 
  border: 1px solid #cbd5e0; 
  border-radius: 10px; 
  color: #1e293b !important; 
  background-color: #ffffff !important;
}

/* Fix für Multiselect Lesbarkeit */
:deep(.multiselect__input),
:deep(.multiselect__single) {
  color: #1e293b !important;
  background: transparent !important;

  
}

.input-error { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 0.75rem; margin-top: 2px; font-weight: 600; }
</style>
