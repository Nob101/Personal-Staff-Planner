<!-- ModalFilialenEdit.vue -->

<script setup>
import { ref, defineProps, watch } from 'vue'
import BaseModal from '@/components/global/BaseModal.vue'
import ColorPicker from '@/components/global/ColorPicker.vue'

const emit = defineEmits(['close', 'filialeEdit'])

const props = defineProps({
  filiale: { type: Object, required: true },
  show: { type: Boolean, required: true }
})

// Lokale Kopien der Felder
const filialname = ref('')
const strasse = ref('')
const ort = ref('')
const plz = ref('')
const land = ref('')
const telefon = ref('')
const email = ref('')
const farbe = ref('')
const anmerkungen = ref('')
const nameFehler = ref(false)

// Props → lokale Refs kopieren
watch(
  () => props.filiale,
  (edited) => {
    if (!edited) return
    filialname.value = edited.filialname || ''
    strasse.value = edited.strasse || ''
    ort.value = edited.ort || ''
    plz.value = edited.plz || ''
    land.value = edited.land || ''
    telefon.value = edited.telefon || ''
    email.value = edited.email || ''
    farbe.value = edited.farbe || '#ffffff' // Fallback auf Weiß, wenn nicht gesetzt
    anmerkungen.value = edited.anmerkungen || ''
  },
  { immediate: true }
)

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

  emit('filialeEdit', {
    fnr: props.filiale.fnr,
    filialname: filialname.value,
    strasse: strasse.value || '',
    ort: ort.value || '',
    plz: plz.value || '',
    land: land.value || '',
    telefon: telefon.value || '',
    email: email.value || '',
    farbe: farbe.value || '',
    anmerkungen: anmerkungen.value || ''
  })
  emit('close')
}
</script>

<template>
  <BaseModal v-if="filiale" :show="show" @close="emit('close')" width="500px">
    <!-- Header -->
    <template #header>
      <h2 class="text-2xl font-semibold">
        Filiale bearbeiten: {{ filiale.filialname }}
      </h2>
    </template>

    <!-- Body -->
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">

        <div>
          <label>Filialenname:</label>
          <input placeholder="Name der Filiale" v-model="filialname" required class="w-full border rounded px-2 py-1" />
          <p v-if="nameFehler" class="text-red-600 mt-1 text-sm">Filialenname ist erforderlich</p>
        </div>

        <div>
          <label>Telefon:</label>
          <input placeholder="Telefon" v-model="telefon" class="w-full border rounded px-2 py-1" />
        </div>

        <div>
          <label>Email:</label>
          <input placeholder="Email" v-model="email" class="w-full border rounded px-2 py-1" />
        </div>

        <fieldset class="border rounded p-3">
          <legend>Adresse</legend>
          <div class="grid grid-cols-2 gap-4">
            <input placeholder="Straße" v-model="strasse" class="border rounded px-2 py-1" />
            <input placeholder="Ort" v-model="ort" class="border rounded px-2 py-1" />
            <input placeholder="Postleitzahl" v-model="plz" class="border rounded px-2 py-1" />
            <input placeholder="Land" v-model="land" class="border rounded px-2 py-1" />
          </div>
        </fieldset>

        <div>
          <ColorPicker v-model="farbe" />
        </div>

        <div>
          <label>Anmerkungen:</label>
          <textarea rows="4" v-model="anmerkungen" class="w-full border rounded px-2 py-1"></textarea>
        </div>

      </form>
    </template>

    <!-- Footer -->
    <template #footer>
      <div class="flex justify-center gap-4 mt-4">
        <button class="bg-blue-300 px-4 py-2 rounded" @click="handleSubmit">
          Änderungen speichern
        </button>
        <button class="bg-gray-200 px-4 py-2 rounded" @click="emit('close')">
          Abbrechen
        </button>
      </div>
    </template>
  </BaseModal>
</template>