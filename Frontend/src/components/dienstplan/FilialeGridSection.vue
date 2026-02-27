<script setup>
import { computed, nextTick } from "vue";

// Icons
import export_icon from "@/assets/icons/export_icon.svg";
import generieren_icon from "@/assets/icons/generieren_icon.svg";
import leeren_icon from "@/assets/icons/leeren_icon.svg";

// Helper - Jetzt korrekt auf PDF umgestellt
import { downloadDienstplanPdf } from "@/helpers/downloadDienstplanPdf.js";

const props = defineProps({
  view: { type: Object, required: true },
  filiale: { type: Object, required: true },
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },

  // Composables / Functions
  mitarbeiterByFiliale: { type: Function, required: true },
  fullName: { type: Function, required: true },
  stundenByMnr: { type: Function, required: true },
  dow: { type: Function, required: true },
  day: { type: Function, required: true },
  dienstOf: { type: Function, required: true },
  cellStyleByDienst: { type: Function, required: true },
  cellText: { type: Function, required: true },

  // Editing
  editingKey: { type: [String, null], default: null },
  modelValue: { type: String, default: "F" },
  options: { type: Array, default: () => ["A", "E", "F", "K", "U"] },
  openDropdown: { type: Function, required: true },
  saveDropdown: { type: Function, required: true },

  loading: { type: Boolean, default: false },
  hasView: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "generateFiliale", "removeFiliale"]);

// PDF Export Logik mit deiner ID-Anforderung
async function onExportClick() {
  await nextTick();
  const elementId = `export-area-filiale-${props.filiale.fnr}`;
  const dateiname = `Dienstplan_${props.filiale.filialname}_${props.monat}_${props.jahr}`;
  await downloadDienstplanPdf(elementId, dateiname);
}

const maCount = computed(() => props.mitarbeiterByFiliale(props.filiale.fnr).length);

const localTyp = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<template>
  <div :id="`export-area-filiale-${filiale.fnr}`" class="mx-auto w-full max-w-[1400px] px-4 mb-8">
    <section class="rounded-3xl bg-white/70 shadow-[0_16px_40px_rgba(0,0,0,0.2)] backdrop-blur overflow-hidden">
      
      <div class="bg-linear-to-b from-zinc-200 to-zinc-300 px-4 py-2 flex items-center justify-between gap-3">
        <div class="flex items-center gap-2">
          <span class="h-3 w-3 rounded-full ring-2 ring-white" :style="{ backgroundColor: filiale.farbe || '#999' }" />
          <div>
            <div class="font-sans text-xl font-extrabold text-zinc-900">{{ filiale.filialname }}</div>
            <div class="text-[11px] text-zinc-600">{{ maCount }} Mitarbeiter</div>
          </div>
        </div>

        <div class="flex items-center gap-1 rounded-xl bg-white/60 ring-1 ring-black/10 p-1 no-export">
          <button @click="emit('generateFiliale', { fnr: filiale.fnr, jahr, monat })"
            class="h-8 w-8 flex items-center justify-center rounded-xl bg-linear-to-b from-blue-400 to-blue-600 hover:from-blue-500 transition active:scale-95 shadow-sm" title="Generieren">
            <img :src="generieren_icon" class="h-4 w-4 brightness-0 invert" />
          </button>

          <button @click="emit('removeFiliale', { fnr: filiale.fnr, jahr, monat })" :disabled="loading || !hasView"
            class="h-8 w-8 flex items-center justify-center rounded-xl bg-linear-to-b from-red-400 to-red-600 hover:from-red-500 transition active:scale-95 shadow-sm">
            <img :src="leeren_icon" class="h-3 w-3 brightness-0 invert" />
          </button>

          <button @click="onExportClick"
            class="h-8 w-8 flex items-center justify-center rounded-xl bg-linear-to-b from-emerald-400 to-emerald-600 hover:from-emerald-500 transition active:scale-95 shadow-sm">
            <img :src="export_icon" class="h-3 w-3 brightness-0 invert" />
          </button>
        </div>
      </div>

      <div class="px-4 pt-2 pb-3 bg-linear-to-b from-zinc-300 to-zinc-400">
        <div class="overflow-x-auto rounded-2xl bg-white/80 ring-1 ring-black/5 shadow-inner">
          <div class="grid gap-px p-2" :style="{ gridTemplateColumns: `minmax(200px, 1fr) repeat(${view.tage.length}, 32px)` }">
            
            <div class="h-10 flex items-center px-3 rounded-lg bg-zinc-100/50 text-sm font-bold text-zinc-800">
              Mitarbeiter
            </div>

            <div v-for="datum in view.tage" :key="datum" 
              class="h-10 rounded-lg flex flex-col items-center justify-center text-[10px] bg-zinc-100/30">
              <div class="text-zinc-500">{{ dow(datum) }}</div>
              <div class="font-bold text-zinc-900">{{ day(datum) }}</div>
            </div>

            <template v-for="m in mitarbeiterByFiliale(filiale.fnr)" :key="m.mnr">
              <div class="h-9 flex items-center justify-between px-3 rounded-lg bg-white shadow-sm ring-1 ring-black/5 text-sm">
                <span class="truncate font-semibold text-zinc-700">{{ fullName(m) }}</span>
                <span class="text-[10px] font-bold" :class="stundenByMnr(m.mnr)?.differenz >= 0 ? 'text-emerald-600' : 'text-red-500'">
                  {{ stundenByMnr(m.mnr)?.differenz ?? '' }}
                </span>
              </div>

              <div v-for="datum in view.tage" :key="`${m.mnr}|${datum}`"
                class="h-9 rounded-lg ring-1 ring-black/5 flex items-center justify-center text-xs font-bold cursor-pointer relative transition hover:scale-[1.02] hover:z-10"
                :style="cellStyleByDienst(dienstOf(m.mnr, datum))"
                @click.stop="openDropdown(m.mnr, datum)">
                
                <span v-if="editingKey !== `${m.mnr}|${datum}`">
                  {{ cellText(dienstOf(m.mnr, datum)?.schicht_typ) }}
                </span>

                <select v-else v-model="localTyp" @change.stop="saveDropdown" @click.stop
                  class="absolute inset-0 w-full h-full rounded-lg bg-zinc-800 text-white text-center outline-none z-20">
                  <option v-for="o in options" :key="o" :value="o">{{ o }}</option>
                </select>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>