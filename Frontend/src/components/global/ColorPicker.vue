<!--ColorPicker.vue-->
<!--Zum wählen von Farben für Filialen, etc.-->

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '#ffffff'
  }
})

const emit = defineEmits(['update:modelValue'])

const presetColors = [
  '#facc15', // Gelb
  '#f97316', // Orange
  '#f43f5e', // Pink
  '#ef4444', // Rot
  '#22c55e', // Grün
  '#3b82f6', // Blau
  '#a855f7', // Lila
  '#64748b', // Grau-Blau
  '#1f2937'  // Dunkelgrau
]

function updateColor(color) {
  emit('update:modelValue', color)
}

const isValidHex = computed(() =>
  /^#([0-9A-Fa-f]{6})$/.test(props.modelValue)
)
</script>

<template>
  <fieldset class="color-picker-box">
    

    <!-- Presets -->
    <div class="presets">
      <button
        v-for="color in presetColors"
        :key="color"
        class="preset"
        :class="{ active: color === modelValue }"
        :style="{ backgroundColor: color }"
        @click="updateColor(color)"
        type="button"
      ></button>
    </div>

    <!-- Custom Color Picker -->
    <div class="custom">
      <input
        type="color"
        :value="modelValue"
        @input="updateColor($event.target.value)"
      />
      <input
        type="text"
        :value="modelValue"
        @input="updateColor($event.target.value)"
        placeholder="#RRGGBB"
        :class="{ invalid: !isValidHex }"
      />
    </div>
  </fieldset>
</template>
