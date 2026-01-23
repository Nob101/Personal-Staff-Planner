<!-- ModalFilialenEdit.vue -->

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import BaseModal from '@/components/global/BaseModal.vue'

const emit = defineEmits(['close', 'filialeEdit'])

const props = defineProps({
  filiale: { type: Object, required: true },
  show: { type: Boolean, required: true }
})

// Lokale Kopien der Felder
const name = ref('')
const strasse = ref('')
const ort = ref('')
const postleitzahl = ref('')
const land = ref('')
const telefon1 = ref('')
const telefon2 = ref('')
const email1 = ref('')
const email2 = ref('')
const color = ref('')
const anmerkungen = ref('')

// Props → lokale Refs kopieren
watch(
  () => props.filiale,
  (edited) => {
    if (!edited) return
    name.value = edited.name || ''
    strasse.value = edited.strasse || ''
    ort.value = edited.ort || ''
    postleitzahl.value = edited.postleitzahl || ''
    land.value = edited.land || ''
    telefon1.value = edited.telefon1 || ''
    telefon2.value = edited.telefon2 || ''
    email1.value = edited.email1 || ''
    email2.value = edited.email2 || ''
    color.value = edited.color || '#cccccc'
    anmerkungen.value = edited.anmerkungen || ''
  },
  { immediate: true }
)

// Submit
function handleSubmit() {
  emit('filialeEdit', {
    id: props.filiale.id,
    name: name.value,
    strasse: strasse.value || '',
    ort: ort.value || '',
    postleitzahl: postleitzahl.value || '',
    land: land.value || '',
    telefon1: telefon1.value || '',
    telefon2: telefon2.value || '',
    email1: email1.value || '',
    email2: email2.value || '',
    color: color.value || '',
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
        Filiale bearbeiten: {{ filiale.name }}
      </h2>
    </template>

    <!-- Body -->
    <template #body>
      <form @submit.prevent="handleSubmit" class="space-y-4">

        <div>
          <label>Name:</label>
          <input v-model="name" required class="w-full border rounded px-2 py-1" />
        </div>

        <fieldset class="border rounded p-3">
          <legend>Adresse</legend>
          <div class="grid grid-cols-2 gap-4">
            <input placeholder="Straße" v-model="strasse" class="border rounded px-2 py-1" />
            <input placeholder="Ort" v-model="ort" class="border rounded px-2 py-1" />
            <input placeholder="Postleitzahl" v-model="postleitzahl" class="border rounded px-2 py-1" />
            <input placeholder="Land" v-model="land" class="border rounded px-2 py-1" />
          </div>
        </fieldset>

        <div class="grid grid-cols-2 gap-4">
          <input placeholder="Telefon 1" v-model="telefon1" class="border rounded px-2 py-1" />
          <input placeholder="Telefon 2" v-model="telefon2" class="border rounded px-2 py-1" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <input placeholder="Email 1" v-model="email1" class="border rounded px-2 py-1" />
          <input placeholder="Email 2" v-model="email2" class="border rounded px-2 py-1" />
        </div>

        <div>
          <label>Filialfarbe:</label>
          <input type="color" v-model="color" />
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