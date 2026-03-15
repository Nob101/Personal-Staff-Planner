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
import loeschen_icon from '@/assets/icons/loeschen_icon.png'
import bearbeiten_icon from '@/assets/icons/bearbeiten_icon.png'
import speichern_icon from '@/assets/icons/speichern_icon.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon.svg'

const props = defineProps({
  benutzer: { type: Object, required: true },
  allBenutzer: { type: Array, required: true }
})

const emit = defineEmits(['update', 'delete'])

const isEditing = ref(false)
const editData = ref({ id: null, username: '', password: '', role: '' })
const roles = ref(['user', 'admin'])

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

  if (!currentUsername) usernameFehler.value = true
  if (!currentPassword) passwordFehler.value = true

  if (currentUsername.toLowerCase() === 'admin') {
    adminNameFehler.value = true
  }

  const existiertBereits = props.allBenutzer.some(
    (b) => b.username.toLowerCase() === currentUsername.toLowerCase() && b.id !== props.benutzer.id
  )

  if (existiertBereits) usernameExistsFehler.value = true

  if (usernameFehler.value || passwordFehler.value || adminNameFehler.value || usernameExistsFehler.value) return

  emit('update', { ...editData.value })
  isEditing.value = false
}
</script>

<template>
  <article class="bu-card">

    <!-- HEADER -->
    <div class="bu-card-head">
      <div class="bu-card-head-inner">

        <div class="min-w-0">
          <div class="bu-card-title">
            {{ isEditing ? `${benutzer.username} bearbeiten` : benutzer.username }}
          </div>
        </div>

        <div class="bu-action-wrap">
          <template v-if="!isEditing">

            <button
              @click="startEdit"
              class="bu-action-btn bu-action-btn--blue"
            >
              <img :src="bearbeiten_icon" class="bu-action-icon" />
            </button>

            <button
              @click="$emit('delete', benutzer)"
              class="bu-action-btn bu-action-btn--red"
            >
              <img :src="loeschen_icon" class="bu-action-icon" />
            </button>

          </template>

          <template v-else>

            <button
              @click="handleSave"
              class="bu-action-btn bu-action-btn--emerald"
            >
              <img :src="speichern_icon" class="bu-action-icon" />
            </button>

            <button
              @click="isEditing = false"
              class="bu-action-btn bu-action-btn--red"
            >
              <img :src="abbrechen_icon" class="bu-action-icon" />
            </button>

          </template>
        </div>

      </div>
    </div>

    <!-- BODY -->
    <div class="bu-card-body">

      <!-- EDIT MODE -->
      <fieldset v-if="isEditing" class="bu-fieldset-stack">

        <div class="bu-row">
          <span class="bu-label">Name</span>
          <input
            v-model="editData.username"
            class="bu-input"
            :class="usernameFehler || adminNameFehler || usernameExistsFehler
              ? 'bu-input-error'
              : 'bu-input-normal'"
          />
        </div>

        <div class="bu-row">
          <span class="bu-label">Passwort</span>
          <input
            v-model="editData.password"
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
              v-model="editData.role"
              :options="roles"
              :searchable="false"
              :show-labels="false"
              :allow-empty="false"
            />
          </div>
        </div>

      </fieldset>

      <!-- NORMAL MODE -->
      <fieldset v-else class="bu-fieldset">
        <div class="bu-row">
          <span class="bu-label">Rolle</span>
          <span
            class="bu-role-badge"
            :class="benutzer.role === 'admin'
              ? 'bu-role-badge--admin'
              : 'bu-role-badge--user'"
          >
            {{ benutzer.role }}
          </span>
        </div>
      </fieldset>

    </div>

  </article>
</template>

<style scoped>
:deep(.multiselect__input),
:deep(.multiselect__single),
:deep(.multiselect__placeholder) {
  color: rgb(24 24 27) !important;
  background: transparent !important;
}
</style>