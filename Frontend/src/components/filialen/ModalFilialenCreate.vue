<!-- ModalFilialenCreate.vue -->

<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import { ref, defineProps } from 'vue'


// Emits
const emit = defineEmits(['close', 'filialeCreate'])

// Props
const props = defineProps({
  mitarbeiter: { type: Object, required: false },
  filialen: { type: Array, required: true },
  show: { type: Boolean, required: true }                   // wird von Parent gesteuert
})

// Reaktive Formularfelder
const filialenname = ref('')
const email1 = ref('')
const email2 = ref('')
const telefon1 = ref('')
const telefon2 = ref('')
const strasse = ref('')
const ort = ref('')
const postleitzahl = ref('')
const land = ref('')
const color = ref('')

// Submit
function handleSubmit() {
  emit('filialeCreate', {
    name: filialenname.value,
    email1: email1.value || '',
    email2: email2.value || '',
    telefon1: telefon1.value || '',
    telefon2: telefon2.value || '',
    strasse: strasse.value || '',
    ort: ort.value || '',
    postleitzahl: postleitzahl.value || '',
    land: land.value || '',
    color: color.value
  })

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
            v-model="filialenname"
            required
            class="w-full border rounded px-2 py-1"
          />
        </div>

        <!-- Email -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Email 1:</label>
            <input type="email" v-model="email1" class="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label>Email 2:</label>
            <input type="email" v-model="email2" class="w-full border rounded px-2 py-1"/>
          </div>
        </div>

        <!-- Telefon -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label>Telefon 1:</label>
            <input type="tel" v-model="telefon1" class="w-full border rounded px-2 py-1"/>
          </div>
          <div>
            <label>Telefon 2:</label>
            <input type="tel" v-model="telefon2" class="w-full border rounded px-2 py-1"/>
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
              <input type="text" v-model="postleitzahl" class="w-full border rounded px-2 py-1"/>
            </div>
            <div>
              <label>Land:</label>
              <input type="text" v-model="land" class="w-full border rounded px-2 py-1"/>
            </div>
          </div>
        </fieldset>

        <!-- Farbe -->
        <div>
          <label>Filialenfarbe:</label>
          <input
            type="color"
            v-model="color"
            class="w-20 h-10 p-0 border rounded"
          />
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