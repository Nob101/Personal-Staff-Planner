<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

import MonthPicker from "@/components/dienstplan/MonthPicker.vue";
import Multiselect from "vue-multiselect";

import generieren_icon from "@/assets/icons/generieren_icon.svg";
import leeren_icon from "@/assets/icons/leeren_icon.svg";
import export_icon from "@/assets/icons/export_icon.svg";

import { downloadDienstplanPdf } from "@/helpers/downloadDienstplanPdf";

const props = defineProps({
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  hasView: { type: Boolean, default: false },
  filialen: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
});

const emit = defineEmits(["load", "generate", "remove", "update:modelValue"]);

async function exportAlleFilialen() {
  if (props.loading || !props.hasView) return;

  emit("load", props.jahr, props.monat);
  await new Promise((r) => setTimeout(r, 600));

  const exportListe = props.modelValue?.length ? props.modelValue : props.filialen;

  for (let i = 0; i < exportListe.length; i++) {
    const f = exportListe[i];
    const elementId = `export-area-filiale-${f.fnr}`;
    const dateiname = `Dienstplan_${f.filialname}_${props.monat}_${props.jahr}`;

    try {
      await downloadDienstplanPdf(elementId, dateiname);

      if (i < exportListe.length - 1) {
        await new Promise((r) => setTimeout(r, 800));
      }
    } catch (err) {
      console.error("Zuviele PDFs auf einmal", err);
    }
  }
}

const headerHidden = ref(false);
let lastY = 0;
let ticking = false;

function onScroll() {
  const y = window.scrollY || 0;

  if (!ticking) {
    window.requestAnimationFrame(() => {
      const delta = y - lastY;

      if (Math.abs(delta) > 6) {
        if (delta > 0 && y > 80) headerHidden.value = true;
        else headerHidden.value = false;

        lastY = y;
      }

      ticking = false;
    });
    ticking = true;
  }
}

onMounted(() => {
  lastY = window.scrollY || 0;
  window.addEventListener("scroll", onScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<template>
  <div
    :class="[
      'dp-header',
      headerHidden ? 'dp-header--hidden' : 'dp-header--shown'
    ]"
  >
    <div class="dp-header-inner">

      <div class="flex items-center gap-5 h-10">
        <MonthPicker
          :jahr="jahr"
          :monat="monat"
          :loading="loading"
          @load="(j, m) => emit('load', j, m)"
        />

        <div class="text-sm">
          <span v-if="loading" class="text-white/70">⌛ Lädt...</span>
          <span v-else-if="error" class="text-red-600">{{ error }}</span>
        </div>
      </div>

      <div class="min-w-60">
        <Multiselect
          class="ms ms-down"
          :model-value="modelValue"
          @update:model-value="val => emit('update:modelValue', val || [])"
          :options="filialen"
          :multiple="true"
          :searchable="false"
          :close-on-select="false"
          :clear-on-select="false"
          label="filialname"
          track-by="fnr"
          :placeholder="(modelValue && modelValue.length > 0) ? '' : 'Filialen auswählen'"
          select-label=""
          selected-label=""
          deselect-label=""
          :allow-empty="true"
        >
          <template #tag="{ option, remove }">
            <span
              class="inline-flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-black/20"
              :style="{ backgroundColor: option.farbe || '#ccc' }"
              :title="option.filialname"
              @mousedown.prevent
              @click.stop="remove(option)"
            />
          </template>

          <template #option="{ option }">
            <div class="flex items-center gap-2">
              <span
                class="h-3.5 w-3.5 rounded-full ring-1 ring-black/20"
                :style="{ backgroundColor: option.farbe || '#ccc' }"
              />
              <span class="truncate">{{ option.filialname }}</span>
            </div>
          </template>
        </Multiselect>
      </div>

      <div class="w-64 flex justify-end">
        <div class="flex items-center gap-1 rounded-xl p-1">

          <button
            class="dp-action-btn dp-action-btn--blue"
            :disabled="loading"
            title="Alle Dienstpläne generieren"
            @click="emit('generate')"
            type="button"
          >
            <img :src="generieren_icon" class="h-4 w-4 opacity-90" alt="Generieren" />
          </button>

          <button
            class="dp-action-btn dp-action-btn--red"
            :disabled="loading || !hasView"
            title="Alle Dienstpläne leeren"
            @click="emit('remove')"
            type="button"
          >
            <img :src="leeren_icon" class="h-3 w-3 opacity-90" alt="Leeren" />
          </button>

          <button
            class="dp-action-btn dp-action-btn--emerald"
            :disabled="loading || !hasView"
            title="Alle Dienstpläne als PDF exportieren"
            @click="exportAlleFilialen"
            type="button"
          >
            <img :src="export_icon" class="h-3 w-3 opacity-90" alt="Exportieren" />
          </button>

        </div>
      </div>

    </div>
  </div>
</template>