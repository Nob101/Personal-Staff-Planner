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
        :class="{ active: color ===props.modelValue }"
        :style="{ backgroundColor: color }"
        @click="updateColor(color)"
        type="button"
      ></button>
    </div>

    <!-- Custom Color Picker -->
    <div class="custom">
      <input
        type="color"
        :value="props.modelValue"
        @input="updateColor($event.target.value)"
      />
      <input
        type="text"
        :value="props.modelValue"
        @input="updateColor($event.target.value)"
        placeholder="#RRGGBB"
        :class="{ invalid: !isValidHex }"
      />
    </div>
  </fieldset>
</template>


<style scoped>
.color-picker-box {
  display: grid;
  gap: 12px;

}

/* Preset-Reihe */
.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* Einzelne Farbbuttons */
.preset {
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  border: 2px solid rgba(255,255,255,0.18);
  box-shadow: 0 6px 18px rgba(0,0,0,0.35);
  cursor: pointer;
  outline: none;
}

.preset:hover {
  transform: scale(1.05);
}

/* aktive Farbe markieren */
.preset.active {
  border-color: rgba(255,255,255,0.85);
  box-shadow: 0 0 0 3px rgba(255,255,255,0.15), 0 6px 18px rgba(0,0,0,0.35);
}

/* Custom Inputs */
.custom {
  display: flex;
  align-items: center;
  gap: 10px;
}

.custom input[type="color"] {
  width: 44px;
  height: 34px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.custom input[type="text"] {
  width: 120px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.14);
  background: rgba(0,0,0,0.25);
  color: white;
  padding: 8px 10px;
  outline: none;
}

.custom input[type="text"].invalid {
  border-color: rgba(248,113,113,0.9); /* rot */
}
</style>