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
import speichern_icon from '@/assets/icons/speichern_icon.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon.svg'

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
const usernameExistsFehler = ref(false)

function confirmCreate() {
  // Reset aller Fehlermeldungen
  usernameFehler.value = false
  passwordFehler.value = false
  adminNameFehler.value = false
  usernameExistsFehler.value = false

  const inputName = newBenutzer.value.username.trim()

  // 1. Pflichtfeld-Check
  if (!inputName) usernameFehler.value = true
  if (!newBenutzer.value.password.trim()) passwordFehler.value = true

  // 2. Admin-Check (Case Insensitive, damit auch 'Admin' oder 'ADMIN' abgefangen wird)
  if (inputName.toLowerCase() === 'admin') adminNameFehler.value = true

  // Check auf bereits existierenden Benutzernamen
  const existiertBereits = props.benutzer.some(
    (b) => b.username.toLowerCase() === inputName.toLowerCase()
  )
  
  if (existiertBereits) {
    usernameExistsFehler.value = true
  }
  // Wenn irgendein Fehler vorliegt, abbrechen
  if (usernameFehler.value || passwordFehler.value || adminNameFehler.value || usernameExistsFehler.value) return

  emit('create', { ...newBenutzer.value })
  cancelCreate()
}
// Erstell-Cancel und leert das Formular zurück auf die Default-Werte (leer), und entfernt Fehlermeldungen
function cancelCreate() {
  newBenutzer.value = { username: '', password: '', role: 'user' }
  usernameFehler.value = false
  passwordFehler.value = false
  adminNameFehler.value = false
  usernameExistsFehler.value = false
  showAddForm.value = false
}
</script>

<template>
  <BaseLoader v-if="isLoading" text="Benutzer werden geladen..." />

  <div v-else class="bu-list-container">
    <div class="bu-list-grid">

      <BenutzerCard
        v-for="b in benutzer"
        :key="b.id"
        :benutzer="b"
        :allBenutzer="benutzer"
        @update="(data) => emit('update', data)"
        @delete="emit('delete', b)"
      />

      <!-- ADD PLACEHOLDER -->
      <div
        v-if="!showAddForm"
        class="bu-add-placeholder"
        @click="showAddForm = true"
      >
        <span class="bu-add-plus">+</span>
        <p class="bu-add-text">Neuen Benutzer hinzufügen</p>
      </div>

      <!-- CREATE CARD -->
      <article
        v-else
        class="bu-card"
      >
        <div class="bu-card-head">
          <div class="bu-card-head-inner">

            <div class="bu-card-title">
              Neuen Benutzer anlegen
            </div>

            <div class="bu-action-wrap">
              <button
                @click="confirmCreate"
                class="bu-action-btn bu-action-btn--emerald"
              >
                <img :src="speichern_icon" class="bu-action-icon" />
              </button>

              <button
                @click="cancelCreate"
                class="bu-action-btn bu-action-btn--red"
              >
                <img :src="abbrechen_icon" class="bu-action-icon" />
              </button>
            </div>

          </div>
        </div>

        <div class="bu-card-body">
          <fieldset class="bu-fieldset-stack">

            <div class="bu-row">
              <span class="bu-label">Name</span>
              <input
                v-model="newBenutzer.username"
                class="bu-input"
                :class="usernameFehler || adminNameFehler || usernameExistsFehler
                  ? 'bu-input-error'
                  : 'bu-input-normal'"
              />
            </div>

            <div class="bu-row">
              <span class="bu-label">Passwort</span>
              <input
                v-model="newBenutzer.password"
                type="password"
                class="bu-input"
                :class="passwordFehler ? 'bu-input-error' : 'bu-input-normal'"
              />
            </div>

            <div class="bu-row">
              <span class="bu-label">Rolle</span>
              <div class="bu-input-wrap">
                <Multiselect
                  class="ms ms-up"
                  v-model="newBenutzer.role"
                  :options="roles"
                  :searchable="false"
                  :show-labels="false"
                  :allow-empty="false"
                />
              </div>
            </div>

          </fieldset>
        </div>

      </article>

    </div>
  </div>
</template>

<style scoped>
:deep(.multiselect__input),
:deep(.multiselect__single),
:deep(.multiselect__placeholder) {
  color: rgb(24 24 27) !important;
  background: transparent !important;
}
</style>
