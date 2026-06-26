<script setup>
import { ref } from "vue";
import VersionModal from "@/components/global/VersionModal.vue";

const showVersion = ref(false);
</script>

<template>
  <footer
    class="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between
           px-6 py-2 text-xs text-zinc-500 bg-white/70 backdrop-blur
           border-t border-zinc-200"
  >
    <span>© 2026 Personal Staff Planner</span>

    <button
      class="font-semibold hover:text-emerald-700 transition"
      @click="showVersion = true"
    >
      Version 2.0
    </button>

    <VersionModal
      :open="showVersion"
      @close="showVersion = false"
    />
  </footer>
</template>