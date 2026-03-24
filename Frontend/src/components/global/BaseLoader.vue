<!-- BaseLoader.vue -->
<!-- Ein Ladespinner der angezeigt werden soll wenn Daten geladen werden -->
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
