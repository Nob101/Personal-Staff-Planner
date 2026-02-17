<!-- BenutzerCard.vue -->

<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue'

const props = defineProps({
  benutzer: { type: Object, required: true }
})

const emit = defineEmits(['update', 'delete'])

const isEditing = ref(false)
const editData = reactive({ username: '', password: '' })

function startEdit() {
  editData.username = props.benutzer.username
  editData.password = props.benutzer.password
  isEditing.value = true
}

function handleSave() {
  // Verhindert, dass leere Daten gespeichert werden
  if (!editData.username || !editData.password) {
    alert("Name und Passwort dürfen nicht leer sein.");
    return;
  }
  
  emit('update', { ...props.benutzer, ...editData })
  isEditing.value = false
}
</script>

<template>
  <div class="benutzer-card" :class="{ 'editing-active': isEditing }">
    
    <template v-if="isEditing">
      <div class="card-actions">
        <button @click="handleSave" class="bg-green-400">Speichern</button>
        <button @click="isEditing = false" class="bg-gray-300">Abbrechen</button>
      </div>
      <h1 class="text-3xl font-semibold">Bearbeiten</h1>
      <div class="benutzer-card-columns">
        <div class="column">
          <fieldset class="box">
            <div class="edit-row">
              <label>Name:</label>
              <input v-model="editData.username" class="input-field" />
            </div>
            <div class="edit-row">
              <label>Passwort:</label>
              <input v-model="editData.password" class="input-field" />
            </div>
          </fieldset>
        </div>
      </div>
    </template>

    <template v-else>
      <div class="card-actions">
        <button @click="startEdit" class="bg-blue-300">Bearbeiten</button>
        <button @click="$emit('delete', benutzer)" class="bg-red-300">Löschen</button>
      </div>
      <h1 class="text-3xl font-semibold">{{ benutzer.username }}</h1>
      <div class="benutzer-card-columns">
        <div class="column">
          <fieldset class="box">
            <p data-label="Benutzername:">{{ benutzer.username }}</p>
            <p data-label="Passwort:">{{ benutzer.password }}</p>
          </fieldset>
        </div>
      </div>
    </template>

  </div>
</template>

<style scoped>
.editing-active {
  border-left-color: #3182ce !important;
}

.edit-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  margin-bottom: 8px;
}

.input-field {
  border: 1px solid #ccc;
  padding: 4px 8px;
  border-radius: 4px;
}

.bg-green-400 { background-color: #68d391; }

.bg-gray-300 { background-color: #e2e8f0; }

.benutzer-card {
  position: relative;
  text-align: center;
  border: 1px solid #ccc;
  border-left: 6px solid #4a5568;
  padding: 48px 24px 24px 24px;
  border-radius: 8px;
  margin-bottom: 16px;
  background-color: #fff;
}

.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.card-actions button {
  padding: 6px 14px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  font-weight: 500;
}

.benutzer-card-columns {
  display: flex;
  justify-content: center;
  text-align: left;
  margin-top: 16px;
}

.column {
  width: 100%;
  max-width: 400px;
}

.box {
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  padding: 12px 18px;
}

.box legend {
  padding: 0 6px;
  font-weight: 600;
}

.box p {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  margin: 8px 0;
  align-items: center;
}

.box p::before {
  content: attr(data-label);
  font-weight: 600;
}

.bg-blue-300 { background-color: #93c5fd; }

.bg-red-300 { background-color: #fca5a5; }
</style>