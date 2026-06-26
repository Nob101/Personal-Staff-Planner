<script setup>
import { computed, nextTick } from "vue";

import export_icon from "@/assets/icons/export_icon.svg";
import generieren_icon from "@/assets/icons/generieren_icon.svg";
import leeren_icon from "@/assets/icons/leeren_icon.svg";

import { downloadDienstplanPdf } from "@/helpers/downloadDienstplanPdf.js";

const props = defineProps({
  view: { type: Object, required: true },
  filiale: { type: Object, required: true },
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },

  mitarbeiterByFiliale: { type: Function, required: true },
  fullName: { type: Function, required: true },
  stundenByMnr: { type: Function, required: true },
  dow: { type: Function, required: true },
  day: { type: Function, required: true },
  dienstOf: { type: Function, required: true },
  cellStyleByDienst: { type: Function, required: true },
  cellText: { type: Function, required: true },
  getCoverageWarning: { type: Function, default: null },

  editingKey: { type: [String, null], default: null },
  modelValue: { type: String, default: "F" },
  options: { type: Array, default: () => ["A", "E", "F", "K", "U"] },
  openDropdown: { type: Function, required: true },
  saveDropdown: { type: Function, required: true },

  loading: { type: Boolean, default: false },
  hasView: { type: Boolean, default: false },
});

const emit = defineEmits([
  "update:modelValue",
  "generateFiliale",
  "removeFiliale",
]);

async function onExportClick() {
  await nextTick();
  const elementId = `export-area-filiale-${props.filiale.fnr}`;
  const dateiname = `Dienstplan_${props.filiale.filialname}_${props.monat}_${props.jahr}`;
  await downloadDienstplanPdf(elementId, dateiname);
}

const maCount = computed(
  () => props.mitarbeiterByFiliale(props.filiale.fnr).length,
);

function onGenerateClick() {
  emit("generateFiliale", {
    fnr: props.filiale.fnr,
    jahr: props.jahr,
    monat: props.monat,
  });
}

function onRemoveClick() {
  emit("removeFiliale", {
    fnr: props.filiale.fnr,
    jahr: props.jahr,
    monat: props.monat,
  });
}

const localTyp = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});

function isSunday(datum) {
  return new Date(datum).getDay() === 0;
}
</script>

<template>
  <div
    :id="`export-area-filiale-${filiale.fnr}`"
    class="mx-auto w-full max-w-[1400px] px-6"
  >
    <section class="dp-card">
      <div class="dp-card-head">
        <div class="flex items-center justify-between gap-3 px-4 py-2">
          <div class="min-w-0 flex items-center gap-2">
            <span
              class="h-2 w-2 rounded-full ring-2 ring-white/70"
              :style="{ backgroundColor: filiale.farbe || '#999' }"
            />
            <div class="min-w-0">
              <div class="font-sans text-xl font-extrabold text-zinc-900">
                {{ filiale.filialname }}
              </div>
              <div class="text-[11px] text-zinc-600">
                {{ maCount }} Mitarbeiter
              </div>
            </div>
          </div>

          <div
            class="flex items-center gap-1 rounded-xl bg-white/60 ring-1 ring-black/10 p-1"
          >
            <button
              class="dp-section-btn dp-section-btn--blue"
              :disabled="loading"
              @click="onGenerateClick"
            >
              <span class="flex h-4 w-4 items-center justify-center">
                <img
                  :src="generieren_icon"
                  alt="Generieren"
                  class="block h-4 w-4"
                />
              </span>
            </button>

            <button
              class="dp-section-btn dp-section-btn--red"
              :disabled="loading || !hasView"
              @click="onRemoveClick"
            >
              <img :src="leeren_icon" class="h-3 w-3" alt="Leeren" />
            </button>

            <button
              class="dp-section-btn dp-section-btn--emerald"
              @click="onExportClick"
            >
              <img :src="export_icon" class="h-3 w-3" alt="Exportieren" />
            </button>
          </div>
        </div>
      </div>

      <div class="dp-card-body">
        <div
          class="overflow-x-auto rounded-2xl bg-white/55 ring-1 ring-black/10"
        >
          <div
            class="grid gap-px p-2"
            :style="{
              gridTemplateColumns: `minmax(0, 1fr) repeat(${view.tage.length}, 30px)`,
            }"
          >
            <div
              class="h-8 flex font-sans items-center px-2 rounded-lg bg-linear-to-b from-zinc-100 to-zinc-400 text-sm font-bold"
            >
              Mitarbeiter
            </div>

            <div
              v-for="datum in view.tage"
              :key="datum"
              class="h-8 rounded-lg flex flex-col items-center justify-center text-[9px]"
              :class="[
                isSunday(datum)
                  ? 'bg-linear-to-b from-zinc-100 to-zinc-500'
                  : 'bg-linear-to-b from-zinc-100 to-zinc-400',
                getCoverageWarning?.(filiale.fnr, datum)
                  ? 'ring-2 ring-red-600 bg-red-200 text-red-900'
                  : '',
              ]"
              :title="
                getCoverageWarning?.(filiale.fnr, datum)
                  ? `Fehlt: ${getCoverageWarning(filiale.fnr, datum).missing.join(', ')}`
                  : ''
              "
            >
              <div class="font-semibold text-zinc-600">{{ dow(datum) }}</div>
              <div class="font-bold text-zinc-900">{{ day(datum) }}</div>
            </div>

            <template
              v-for="m in mitarbeiterByFiliale(filiale.fnr)"
              :key="m.mnr"
            >
              <div
                class="h-8 flex items-center gap-2 px-2 rounded-lg bg-white text-sm ring-1 ring-black/10"
              >
                <span class="truncate font-semibold">
                  {{ fullName(m) }}
                </span>

                <span class="flex-1"></span>

                <span
                  class="inline-flex items-center justify-center min-w-11 h-6 px-2 rounded-full bg-zinc-200 text-[11px] font-extrabold tabular-nums"
                  :class="{
                    'text-emerald-700':
                      (stundenByMnr(m.mnr)?.differenz ?? 0) >= 0,
                    'text-red-600': (stundenByMnr(m.mnr)?.differenz ?? 0) < 0,
                  }"
                >
                  {{ stundenByMnr(m.mnr)?.differenz ?? "" }}
                </span>
              </div>

              <div
                v-for="datum in view.tage"
                :key="`${m.mnr}|${datum}`"
                class="dp-grid-cell"
                :style="cellStyleByDienst(dienstOf(m.mnr, datum))"
                @click.stop="openDropdown(m.mnr, datum)"
              >
                <span v-if="editingKey !== `${m.mnr}|${datum}`">
                  {{ cellText(dienstOf(m.mnr, datum)?.schicht_typ) }}
                </span>

                <select
                  v-else
                  v-model="localTyp"
                  class="dp-grid-select"
                  @change.stop="saveDropdown"
                  @click.stop
                >
                  <option v-for="o in options" :key="o" :value="o">
                    {{ o }}
                  </option>
                </select>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
