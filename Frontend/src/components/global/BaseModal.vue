<!-- BaseModal.vue -->
<script setup>
import { defineProps, onMounted, onUnmounted, ref } from "vue";

const emit = defineEmits(["close"]);

const props = defineProps({
  show: { type: Boolean, required: true },
  width: { type: String, default: "760px" }, 
  closeOnEsc: { type: Boolean, default: true },
});

const mouseDownOutside = ref(false);

function close() {
  emit("close");
}

function handleEsc(e) {
  if (e.key === "Escape") close();
}

function onMouseDown(e) {
  // wichtig: overlay hat jetzt die klasse "modal-overlay"
  mouseDownOutside.value = e.target.classList.contains("modal-overlay");
}

function onOverlayClick() {
  if (mouseDownOutside.value) close();
  mouseDownOutside.value = false;
}

onMounted(() => {
  if (props.closeOnEsc) window.addEventListener("keydown", handleEsc);
});

onUnmounted(() => {
  if (props.closeOnEsc) window.removeEventListener("keydown", handleEsc);
});
</script>
<template>
  <teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-9999 flex justify-center
         bg-black/50 backdrop-blur-sm"
      @mousedown="onMouseDown"
      @click="onOverlayClick"
    >
      <div class="relative w-full h-full flex justify-center px-3 sm:px-6 pt-4 pb-6">
        <div
          class="relative mt-12 max-h-[calc(100vh-3rem-3rem)] overflow-y-auto rounded-2xl"
        >
          <!-- Header Slot -->
          <div v-if="$slots.header" class="mb-4 flex items-center justify-center">
            <slot name="header"></slot>
          </div>

          <!-- Body Slot -->
          <div class="mb-4">
            <slot name="body"></slot>
          </div>

          <!-- Footer Slot -->
          <div v-if="$slots.footer" class="mt-4 flex items-center justify-center gap-4">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>