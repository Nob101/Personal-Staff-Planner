<!-- BestätigungsModal.vue -->
<script setup>
import { defineProps, defineEmits } from 'vue'

const emit = defineEmits(['confirm', 'close'])

defineProps({
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
      class="fixed inset-0 z-[9999] flex items-center justify-center
             bg-black/60 backdrop-blur-sm font-sans"
      @click.self="handleCancel"
    >
      <div
        class="w-full max-w-md rounded-2xl
               border border-white/10
               bg-linear-to-b from-zinc-800/80 to-zinc-900/90
               p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
      >
        <!-- Text -->
        <p class="mb-6 text-center text-lg text-white/90">
          {{ message }}
        </p>

        <!-- Buttons -->
        <div class="flex justify-center gap-4">
          <button
            @click="handleConfirm"
            class="rounded-xl border border-red-400/30
                   bg-red-500/35 px-5 py-2
                   text-sm font-semibold text-white/90
                   hover:bg-red-500/25 transition"
          >
            Ja, löschen
          </button>

          <button
            @click="handleCancel"
            class="rounded-xl border border-white/15
                   bg-white/10 px-5 py-2
                   text-sm font-semibold text-white/90
                   hover:bg-white/5 transition"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>
