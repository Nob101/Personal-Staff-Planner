<!-- BestätigungsModal.vue -->
<!-- Allgemeines BestätigungsModal für z.b. löschen von einem Mitarbeiter. Der angezeigte Text wird im dementsprechenden Modalaufruf im View übergeben-->
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
    <div v-if="show" class="fixed inset-0 z-9999 flex items-center justify-center bg-black/70" @click.self="handleCancel">
      <div class="relative w-full max-w-md rounded-3xl border border-white/10
               bg-linear-to-b from-zinc-800 to-zinc-900
               p-8 shadow-[0_20px_60px_rgba(0,0,0,0.65)]
               font-sans text-white">
        <p class="mb-6 text-center text-xl">{{ message }}</p>
        <div class="flex justify-center gap-6">
          <button class="w-25 rounded-xl border border-red-400/30 bg-red-500/40
                   px-6 py-3 font-semibold hover:bg-red-500/25 transition" @click="handleConfirm">Ja</button>
          <button class="w-25 rounded-xl border border-white/20 bg-white/10
                   px-6 py-3 font-semibold hover:bg-white/20 transition" @click="handleCancel">Nein</button>
        </div>
      </div>
    </div>
  </teleport>
</template>