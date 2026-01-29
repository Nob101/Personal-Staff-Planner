<!-- ModalFilialenCreate.vue -->

<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import { ref, defineProps, watch } from 'vue'
import ColorPicker from '@/components/global/ColorPicker.vue'


// Emits
const emit = defineEmits(['close', 'filialeCreate'])

// Props
const props = defineProps({
  mitarbeiter: { type: Object, required: false },
  filialen: { type: Object, required: true },
  show: { type: Boolean, required: true }                   // wird von Parent gesteuert
})

// Reaktive Formularfelder
const filialname = ref('')
const email = ref('')
const telefon = ref('')
const strasse = ref('')
const ort = ref('')
const plz = ref('')
const land = ref('')
const farbe = ref('#ffffff') // Startfarbe Weiß
const nameFehler = ref(false)

// entfernt Reset Fehler Meldung bei Schließen des Modals
watch(() => props.show, (newVal) => {
  if (!newVal) {
    nameFehler.value = false
  }
})


// Submit
function handleSubmit() {
    if (!filialname.value.trim()) {
    nameFehler.value = true
    return
  }
  nameFehler.value = false

  emit('filialeCreate', {
    filialname: filialname.value,
    email: email.value || '',
    telefon: telefon.value || '',
    strasse: strasse.value || '',
    ort: ort.value || '',
    plz: plz.value || '',
    land: land.value || '',
    farbe: farbe.value
  })

  // Formular zurücksetzen
  filialname.value = ''
  email.value = ''
  telefon.value = ''
  strasse.value = ''
  ort.value = ''
  plz.value = ''
  land.value = ''
  farbe.value = '#ffffff'

  emit('close')
}
</script>

<template>
  <BaseModal :show="show" @close="emit('close')" width="450px">
    <!-- Header -->
    <template #header>
      <h1 class="text-2xl font-semibold">Neue Filiale</h1>
    </template>

    <!-- Body -->
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">

        <!-- Name -->
        <div>
          <label>Filialenname:</label>
          <input
            type="text"
            v-model="filialname"
            required
            class="w-full border rounded px-2 py-1"
          />
          <p v-if="nameFehler" class="text-red-600 mt-1 text-sm">Filialenname ist erforderlich</p>
        </div>

        <!-- Email -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Email:</label>
            <input type="email" v-model="email" class="w-full border rounded px-2 py-1"/>
          </div>
        </div>

        <!-- Telefon -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Telefon:</label>
            <input type="tel" v-model="telefon" class="w-full border rounded px-2 py-1"/>
          </div>
        </div>

        <!-- Adresse -->
        <fieldset class="border rounded p-3">
          <legend>Adresse</legend>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label>Straße:</label>
              <input type="text" v-model="strasse" class="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label>Ort:</label>
              <input type="text" v-model="ort" class="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label>Postleitzahl:</label>
              <input type="text" v-model="plz" class="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label>Land:</label>
              <input type="text" v-model="land" class="w-full border rounded px-2 py-1"/>
            </div>
          </div>
        </fieldset>

        <!-- Farbe -->
        <div>
          <ColorPicker v-model="farbe" />
        </div>

      </form>
    </template>

    <!-- Footer -->
    <template #footer>
      <button type="button" class="bg-blue-300" @click="handleSubmit">
        Erstellen
      </button>
      <button type="button" class="bg-gray-400" @click="emit('close')">
        Abbrechen
      </button>
    </template>
  </BaseModal>
</template>

