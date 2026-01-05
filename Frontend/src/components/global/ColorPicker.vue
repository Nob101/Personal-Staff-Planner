<!--ColorPicker.vue-->
<!--Zum wählen von Farben für Filialen, etc.-->

<script setup>
    import { computed } from 'vue'

    const props = defineProps({
        modelValue: {
            type: String,
            default: '#3b82f6'
        }
    })

    const emit = defineEmits(['update:modelValue'])

    const presetColors = [
        '#1f2937',
        '#3b82f6',
        '#22c55e',
        '#f97316',
        '#ef4444',
        '#a855f7'
    ]

    function updateColor(color) {
    emit('update:modelValue', color)
    }

    const isValidHex = computed(() =>
    /^#([0-9A-Fa-f]{6})$/.test(props.modelValue)
    )
</script>

<template>
  <div class="color-picker">
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

    <!-- Custom -->
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
  </div>
</template>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.presets {
  display: flex;
  gap: 8px;
}

.preset {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 1px solid #999;
  cursor: pointer;
}

.preset.active {
  outline: 2px solid #000;
}

.custom {
  display: flex;
  gap: 8px;
  align-items: center;
}

.custom input[type="text"] {
  width: 100px;
  padding: 2px 6px;
  border: 1px solid #999;
  border-radius: 4px;
}

.custom input.invalid {
  border-color: red;
}
</style>

