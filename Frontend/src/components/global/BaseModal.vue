<!-- BaseModal.vue -->
<!-- Eine Vorlage für Modale mit Funktionen und Styling die bei allen Modalen verwendet werden sollen -->
<script setup>
import { defineProps, defineEmits, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['close'])

const props = defineProps({
  show: { type: Boolean, required: true },
  width: { type: String, default: '400px' },
  closeOnEsc: { type: Boolean, default: true }
})

function close() {
  emit('close')
}

// ESC-Taste nur registrieren, wenn closeOnEsc true (ESC-Taste zum Schließen vom Modal)
function handleEsc(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  if (props.closeOnEsc) window.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  if (props.closeOnEsc) window.removeEventListener('keydown', handleEsc)
})
</script>

<template>
  <teleport to="body">
    <div
      v-if="show"
      class="modal-overlay"
      @click.self="close"
      style="position:fixed; inset:0; z-index:99999;"
    >
      <div
        class="modal-container"
        :style="{ width: width, position: 'relative', zIndex: 100000 }"
      >
        <div v-if="$slots.header" class="modal-header flex justify-center items-center mb-4">
          <slot name="header"></slot>
        </div>

        <div class="modal-body mb-4">
          <slot name="body"></slot>
        </div>

        <div v-if="$slots.footer" class="modal-footer mt-4 flex justify-center gap-4">
          <slot name="footer"></slot>
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
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
}

.modal-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  position: relative;
  z-index: 210;
}
</style>