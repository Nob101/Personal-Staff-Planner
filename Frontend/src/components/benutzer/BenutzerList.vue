<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import BenutzerCard from '@/components/benutzer/BenutzerCard.vue'
import BaseLoader from '@/components/global/BaseLoader.vue'

const props = defineProps({
  benutzer: { type: Array, required: true },
  isLoading: { type: Boolean, required: true }
})

const emit = defineEmits(['create', 'update', 'delete'])

const showAddForm = ref(false)
const submitted = ref(false)
const newBenutzer = ref({
  username: '',
  password: ''
})

function confirmCreate() {
  submitted.value = true
  
  // Nur emittieren, wenn beide Felder befüllt sind
  if (newBenutzer.value.username && newBenutzer.value.password) {
    emit('create', { ...newBenutzer.value })
    cancelCreate()
  }
}

function cancelCreate() {
  newBenutzer.value = { username: '', password: '' }
  showAddForm.value = false
  submitted.value = false
}
</script>

<template>
  <BaseLoader v-if="isLoading" text="Benutzer werden geladen..." />

  <div v-else class="benutzer-list-container">
    <div class="benutzer-list grid gap-4">
      <BenutzerCard
        v-for="b in benutzer"
        :key="b.username"
        :benutzer="b"
        @update="(data) => emit('update', data)"
        @delete="emit('delete', b)"
      />

      <div v-if="!showAddForm" class="add-placeholder" @click="showAddForm = true">
        <span class="plus-icon">+</span>
        <p>Neuen Benutzer hinzufügen</p>
      </div>

      <div v-else class="benutzer-card create-mode">
        <h2 class="text-3xl font-semibold mb-4">Neu anlegen</h2>

        <div class="benutzer-card-columns">
          <div class="column">
            <fieldset class="box">
              
              <div class="edit-row">
                <label>Name:</label>
                <input 
                  v-model="newBenutzer.username" 
                  class="input-field" 
                  :class="{ 'input-error': submitted && !newBenutzer.username }"
                  placeholder="Username" 
                />
              </div>
              <p v-if="submitted && !newBenutzer.username" class="error-text">
                Name ist ein Pflichtfeld
              </p>

              <div class="edit-row">
                <label>Passwort:</label>
                <input 
                  v-model="newBenutzer.password" 
                  type="text" 
                  class="input-field" 
                  :class="{ 'input-error': submitted && !newBenutzer.password }"
                  placeholder="Passwort" 
                />
              </div>
              <p v-if="submitted && !newBenutzer.password" class="error-text">
                Passwort ist ein Pflichtfeld
              </p>

            </fieldset>
          </div>
        </div>

        <div class="flex justify-center gap-4 mt-8">
          <button @click="confirmCreate" class="btn-confirm">Hinzufügen</button>
          <button @click="cancelCreate" class="btn-cancel">Abbrechen</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.error-text {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: -8px;
  margin-bottom: 12px;
  margin-left: 100px;
}

.input-error {
  border-color: #e53e3e !important;
  background-color: #fff5f5;
}

.add-placeholder {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  background-color: #fcfcfc;
}

.benutzer-card {
  border: 1px solid #ccc;
  padding: 24px;
  border-radius: 8px;
  background-color: #fff;
  text-align: center;
}

.create-mode {
  border-left: 6px solid #48bb78;
}

.benutzer-card-columns {
  display: flex;
  justify-content: center;
  text-align: left;
}

.column { width: 100%; max-width: 400px; }

.box {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 12px 18px;
  background-color: #f9f9f9;
}

.edit-row {
  display: grid;
  grid-template-columns: 100px 1fr;
  align-items: center;
  margin: 12px 0;
}

.input-field {
  border: 1px solid #ccc;
  padding: 8px;
  border-radius: 4px;
}

/* Button-Styles */
.btn-confirm {
  background-color: #68d391;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
}

.btn-cancel {
  background-color: #e2e8f0;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: bold;
}

.plus-icon { font-size: 2.5rem; color: #4a5568; }
.hint { text-align: center; padding: 24px; color: #555; }
</style>