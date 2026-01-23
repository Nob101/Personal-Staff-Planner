<!-- BestätigungsModal.vue -->
<!-- Allgemeines BestätigungsModal für z.b. löschen von einem Mitarbeiters oder Filiale. Der angezeigte Text wird im dementsprechenden Modalaufruf im View übergeben-->
<script setup>
import { defineProps, defineEmits } from 'vue'

const emit = defineEmits(['confirm', 'close'])
const props = defineProps({
  show: { type: Boolean, required: true },
  message: { type: String, default: 'Bist du sicher?' }
})

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  emit('close')
}
</script>

<template>
  <teleport to="body">
    <div v-if="show" class="modal-overlay flex justify-center items-center" @click.self="handleCancel">
      <div class="modal-container p-6 bg-white rounded shadow-md w-96 text-center">
        <p class="mb-4">{{ message }}</p>
        <div class="flex justify-center gap-4">
          <button class="bg-red-400" @click="handleConfirm">Ja</button>
          <button class="bg-gray-300" @click="handleCancel">Abbrechen</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
}
</style>