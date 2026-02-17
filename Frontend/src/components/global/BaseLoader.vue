<script setup>
defineProps({
  text: {
    type: String,
    default: 'Daten werden geladen'
  },
  size: {
    type: String,
    default: 'md' // sm | md | lg
  }
})
</script>

<template>
  <div class="base-loader">
    <span :class="['spinner', size]"></span>
    <span class="loader-text">{{ text }}</span>
  </div>
</template>

<style scoped>
.base-loader {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
  color: #555;
}

.spinner {
  border-radius: 50%;
  border: 3px solid #ddd;
  border-top-color: #3b82f6;
  animation: spin 0.8s linear infinite;
}

.spinner.sm {
  width: 16px;
  height: 16px;
}

.spinner.md {
  width: 24px;
  height: 24px;
}

.spinner.lg {
  width: 36px;
  height: 36px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>