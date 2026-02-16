<!-- FilialeGridSection.vue (rendert eine Filial-Sektion des Dienstplans)-->

<script setup>
// Vue
import { computed } from "vue";

import exportIcon from "@/assets/icons/export.svg";

import { downloadDienstplanCsv } from "@/helpers/downloadDienstplanCsv.js";


/**
 * Props:
 * Diese Komponente ist rein darstellend und rendert den Dienstplan
 * für genau eine Filiale als Grid.
 *
 * Alle Daten und Aktionen kommen von oben (Parent / Composables).
 */
const props = defineProps({
  // Grunddaten
  view: { type: Object, required: true },     // gesamte Dienstplan-View (Tage, etc.)
  filiale: { type: Object, required: true },  // aktuelle Filiale
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },

  // Daten- & Helper-Funktionen (kommen aus Composables)
  mitarbeiterByFiliale: { type: Function, required: true }, // MA-Liste je Filiale
  fullName: { type: Function, required: true },             // Name-Formatter
  stundenByMnr: { type: Function, required: true },         // Stundeninfo je MA
  dow: { type: Function, required: true },                  // Wochentag
  day: { type: Function, required: true },                  // Kalendertag
  dienstOf: { type: Function, required: true },             // Dienst je MA/Tag
  cellStyleByDienst: { type: Function, required: true },    // Zell-Styling
  cellText: { type: Function, required: true },             // Zell-Text

  // Inline-Editing
  editingKey: { type: [String, null], default: null },      // aktuell editierte Zelle
  modelValue: { type: String, default: "F" },               // v-model (Dienst-Typ)
  options: { type: Array, default: () => ["A", "E", "F", "K", "U"] },
  openDropdown: { type: Function, required: true },         // Edit starten
  saveDropdown: { type: Function, required: true },         // Edit speichern
});

/**
 * v-model Weitergabe an Parent
 */
const emit = defineEmits(["update:modelValue"]);

/**
 * Anzahl der Mitarbeiter in dieser Filiale
 * (wird im Header angezeigt)
 */
const maCount = computed(() =>
  props.mitarbeiterByFiliale(props.filiale.fnr).length
);

// Layout-Parameter
const dayCellW = 28;   // entspricht repeat(..., 28px)
const nameColMax = 320; // entspricht minmax(220px, 320px)

// Grid soll mindestens so breit sein wie: Name-Spalte + Tagesspalten
const gridMinWidth = computed(() => {
  const days = props.view?.tage?.length ?? 0;
  return nameColMax + days * dayCellW;
});


async function onExportClick() {
  await downloadDienstplanCsv({
    jahr: props.jahr,
    monat: props.monat,
    fnr: props.filiale.fnr, // immer nur diese Filiale
  });
}

/**
 * Lokales v-model für das Select-Feld.
 * Änderungen werden direkt an den Parent weitergereicht.
 */
const localTyp = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<template>
  <!--
    Wrapper für eine Filial-Sektion.
    Enthält Header + Grid.
  -->
  <div
    class="rounded-2xl
           border border-black/10 dark:border-white/10
           bg-white dark:bg-linear-to-b dark:from-zinc-700/70 dark:to-zinc-900/80
           p-4"
  >

    <!-- HEADER: Filialname + Farbe -->
    <div class="mb-2 flex items-center justify-between">
      <div class="flex items-center gap-2 font-bold text-xl text-white">
        <span>{{ filiale.filialname }}</span>
        <span
          class="inline-block h-3 w-3 rounded-full border border-white/20"
          :style="{ backgroundColor: filiale.farbe || '#999' }"
        ></span>
      </div>

      <!-- Export Button rechts -->
      <button
        type="button"
        class="flex items-center gap-2
              px-3 py-2 rounded-xl
              bg-zinc-400 hover:bg-zinc-200
              border border-white/10
              text-black text-sm font-semibold"
        @click="onExportClick"
        title="Dienstplan als CSV exportieren"
      >
        <img
          :src="exportIcon"
          alt=""
          class="h-4 w-4 opacity-90"
        />
      </button>
    </div>

    <!-- GRID -->
    <div class="overflow-x-auto rounded-2xl border border-white/10 bg-black/50">
      <div
        class="grid gap-1 p-2"
        :style="{
          minWidth: gridMinWidth + 'px',
          gridTemplateColumns: `minmax(220px, 420px) repeat(${view.tage.length}, 28px)`,
        }"
      >


        <!-- Grid-Header: Mitarbeiter -->
        <div class="h-10 flex items-center px-2 font-bold text-lg bg-white/5 rounded">
          Mitarbeiter:
        </div>

        <!-- Grid-Header: Tage -->
        <div
          v-for="datum in view.tage"
          :key="datum"
          class="h-10 text-[10px] leading-tight
                 flex flex-col items-center justify-center
                 bg-white/5 rounded"
        >
          <div class="text-white/60">{{ dow(datum) }}</div>
          <div class="font-semibold text-white">{{ day(datum) }}</div>
        </div>

        <!-- Grid-Rows -->
        <template v-for="m in mitarbeiterByFiliale(filiale.fnr)" :key="m.mnr">

          <!-- Mitarbeiter-Zelle -->
          <div
            class="h-7 flex items-center gap-2 px-2 bg-white/5 rounded text-sm
                   whitespace-nowrap overflow-hidden max-w-[420px]"
          >
            <span class="font-semibold overflow-hidden text-ellipsis">
              {{ fullName(m) }}
            </span>

            <span class="flex-1"></span>

            <!-- Stunden-Differenz -->
            <span
              class="text-xs font-bold shrink-0"
              :class="{
                'text-emerald-500': (stundenByMnr(m.mnr)?.differenz ?? 0) >= 0,
                'text-red-500': (stundenByMnr(m.mnr)?.differenz ?? 0) < 0,
              }"
            >
              {{ stundenByMnr(m.mnr)?.differenz ?? "" }}
            </span>
          </div>

          <!-- Dienst-Zellen -->
          <div
            v-for="datum in view.tage"
            :key="`${m.mnr}|${datum}`"
            class="h-7 rounded border border-white/10
                   flex items-center justify-center
                   text-xs font-bold select-none
                   hover:brightness-110 cursor-pointer
                   relative"
            :style="cellStyleByDienst(dienstOf(m.mnr, datum))"
            @click.stop="openDropdown(m.mnr, datum)"
          >
            <!-- Anzeige-Modus -->
            <span v-if="editingKey !== `${m.mnr}|${datum}`">
              {{ cellText(dienstOf(m.mnr, datum)?.schicht_typ) }}
            </span>

            <!-- Edit-Modus -->
            <select
              v-else
              v-model="localTyp"
              class="absolute inset-0 w-full h-full
                     text-center bg-black/60 text-white
                     outline-none rounded"
              @change.stop="saveDropdown"
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
</template>
