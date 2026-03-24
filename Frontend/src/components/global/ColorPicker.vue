<!--ColorPicker.vue-->
<!--Zum wählen von Farben für Filialen, etc.-->

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: String,
    default: '#12f3ef'
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
]

function updateColor(color) {
  emit('update:modelValue', color)
}

const isValidHex = computed(() =>
  /^#([0-9A-Fa-f]{6})$/.test(props.modelValue)
)
</script>

<template>
  <fieldset class="grid gap-3">
    <!-- Presets -->
    <div class="flex flex-wrap gap-2.5">
      <button
        v-for="color in presetColors"
        :key="color"
        type="button"
        :style="{ backgroundColor: color }"
        @click="updateColor(color)"
        class="h-7 w-7 cursor-pointer rounded-full border-2 border-white/20 shadow-[0_6px_18px_rgba(0,0,0,0.35)] outline-none transition-transform hover:scale-105"
        :class="{
          'border-white/85 shadow-[0_0_0_3px_rgba(255,255,255,0.15),0_6px_18px_rgba(0,0,0,0.35)]': color === props.modelValue
        }"
      ></button>
    </div>

    <!-- Custom Color Picker -->
    <div class="flex items-center gap-2.5">
      <input
        type="color"
        :value="props.modelValue"
        @input="updateColor($event.target.value)"
        class="h-[34px] w-11 cursor-pointer border-none bg-transparent p-0"
      />

      <input
        type="text"
        :value="props.modelValue"
        @input="updateColor($event.target.value)"
        placeholder="#RRGGBB"
        class="w-[120px] rounded-[10px] border bg-black/25 px-2.5 py-2 text-white outline-none"
        :class="isValidHex ? 'border-white/15' : 'border-red-400/90'"
      />
    </div>
  </fieldset>
</template>