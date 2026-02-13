<script setup>
import { computed } from "vue";

const props = defineProps({
  view: { type: Object, required: true },
  filiale: { type: Object, required: true },
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },

  // data helpers
  mitarbeiterByFiliale: { type: Function, required: true },
  fullName: { type: Function, required: true },
  stundenByMnr: { type: Function, required: true },
  dow: { type: Function, required: true },
  day: { type: Function, required: true },
  dienstOf: { type: Function, required: true },
  cellStyleByDienst: { type: Function, required: true },
  cellText: { type: Function, required: true },

  // editing
  editingKey: { type: [String, null], default: null },
  modelValue: { type: String, default: "F" }, // v-model
  options: { type: Array, default: () => ["A", "E", "F", "K", "U"] },
  openDropdown: { type: Function, required: true },
  saveDropdown: { type: Function, required: true },
});

const emit = defineEmits(["update:modelValue"]);

const maCount = computed(() => props.mitarbeiterByFiliale(props.filiale.fnr).length);

const localTyp = computed({
  get: () => props.modelValue,
  set: (v) => emit("update:modelValue", v),
});
</script>

<template>
  <div class="rounded-2xl
         border border-black/10 dark:border-white/10
         bg-white dark:bg-linear-to-b dark:from-zinc-700/70 dark:to-zinc-900/80
         p-4">
    <!-- HEADER -->
    <div class="mb-2 flex items-center justify-between">
      <div class="flex items-center gap-2 font-bold text-xl text-white">
        <span>{{ filiale.filialname }}</span>
        <span
          class="inline-block h-3 w-3 rounded-full border border-white/20"
          :style="{ backgroundColor: filiale.farbe || '#999' }"
        ></span>
      </div>
    </div>

    <div class="mb-3 text-xs text-white/60">
      Mitarbeiter: {{ maCount }},
      Tage: {{ view.tage.length }}
    </div>

    <div class="overflow-x-auto rounded-2xl border border-white/10 bg-black/50">
      <div
        class="grid gap-1 p-2 min-w-[900px]"
        :style="{
          gridTemplateColumns: `minmax(220px, 320px) repeat(${view.tage.length}, 28px)`,
        }"
      >
        <!-- Header -->
        <div class="h-10 flex items-center px-2 font-bold text-lg bg-white/5 rounded">
          Mitarbeiter:
        </div>

        <div
          v-for="datum in view.tage"
          :key="datum"
          class="h-10 text-[10px] leading-tight flex flex-col items-center justify-center bg-white/5 rounded"
        >
          <div class="text-white/60">{{ dow(datum) }}</div>
          <div class="font-semibold text-white">{{ day(datum) }}</div>
        </div>

        <!-- Rows -->
        <template v-for="m in mitarbeiterByFiliale(filiale.fnr)" :key="m.mnr">
          <!-- Mitarbeiter Spalte -->
          <div
            class="h-7 flex items-center gap-2 px-2 bg-white/5 rounded text-sm
                   whitespace-nowrap overflow-hidden max-w-[360px]"
          >
            <span class="font-semibold overflow-hidden text-ellipsis">
              {{ fullName(m) }}
            </span>

            <span class="flex-1"></span>

            <span
              class="text-xs font-bold shrink-0"
              :class="{
                'text-emerald-400': (stundenByMnr(m.mnr)?.differenz ?? 0) >= 0,
                'text-red-400': (stundenByMnr(m.mnr)?.differenz ?? 0) < 0,
              }"
            >
              {{ stundenByMnr(m.mnr)?.differenz ?? "" }}
            </span>
          </div>

          <!-- Zellen -->
          <div
            v-for="datum in view.tage"
            :key="`${m.mnr}|${datum}`"
            class="h-7 rounded border border-white/10 flex items-center justify-center
                   text-xs font-bold select-none hover:brightness-110 cursor-pointer relative"
            :style="cellStyleByDienst(dienstOf(m.mnr, datum))"
            @click.stop="openDropdown(m.mnr, datum)"
          >
            <span v-if="editingKey !== `${m.mnr}|${datum}`">
              {{ cellText(dienstOf(m.mnr, datum)?.schicht_typ) }}
            </span>

            <select
              v-else
              v-model="localTyp"
              class="absolute inset-0 w-full h-full text-center bg-black/60 text-white outline-none rounded"
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
