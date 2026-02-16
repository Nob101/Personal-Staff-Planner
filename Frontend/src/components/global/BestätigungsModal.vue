<!-- BestätigungsModal.vue -->
<!-- Allgemeines BestätigungsModal für z.b. löschen von einem Mitarbeiters oder Filiale. Der angezeigte Text wird im dementsprechenden Modalaufruf im View übergeben-->
<script setup>
import { defineProps } from 'vue'

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
    <div
      v-if="show"
      class="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 px-4"
      @click.self="handleCancel"
    >
      <div
        class="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center shadow-2xl"
      >
        <p class="mb-5 text-base text-white/90">
          {{ message }}
        </p>

        <div class="flex justify-center gap-3">
          <button
            class="min-w-[120px] rounded-xl bg-red-500/40 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 transition"
            @click="handleConfirm"
            type="button"
          >
            Ja
          </button>

          <button
            class="min-w-[120px] rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
            @click="handleCancel"
            type="button"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>


