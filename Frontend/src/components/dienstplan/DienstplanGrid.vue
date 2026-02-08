<script setup>
import { computed } from "vue";
import ModalErsatz from "@/components/dienstplan/ModalErsatz.vue";

import FilialeGridSection from "@/components/dienstplan/FilialeGridSection.vue";
import { useDienstplanGridData } from "@/composables/dienstplan/useDienstplanGridData.js";
import { useInlineShiftEdit } from "@/componsables/dienstplan/useInlineShiftEdit.js";

const props = defineProps({
  view: { type: Object, default: null },
  onShift: { type: Function, default: null },
  onGetErsatz: { type: Function, default: null },
  onShiftMitErsatz: { type: Function, default: null },
});

const viewRef = computed(() => props.view);

const {
  dienstOf,
  cellStyleByDienst,
  cellText,
  stundenByMnr,
  mitarbeiterByFiliale,
  fullName,
  dow,
  day,
} = useDienstplanGridData(viewRef);

const {
  editingKey,
  localTyp,
  options,
  openDropdown,
  saveDropdown,

  ersatzOpen,
  ersatzLoading,
  ersatzError,
  ersatzKandidaten,
  ersatzCtx,
  onPickErsatz,
  onIgnoreErsatz,
} = useInlineShiftEdit({
  view: viewRef,
  dienstOf,
  onShift: (payload) => props.onShift?.(payload),
  onGetErsatz: (id) => props.onGetErsatz?.(id),
  onShiftMitErsatz: (payload) => props.onShiftMitErsatz?.(payload),
});
</script>

<template>
  <ModalErsatz
    :open="ersatzOpen"
    :loading="ersatzLoading"
    :error="ersatzError"
    :kandidaten="ersatzKandidaten"
    :altDienstId="ersatzCtx.altId"
    :altNewTyp="ersatzCtx.altNewTyp"
    :datum="ersatzCtx.datum"
    :fnr="ersatzCtx.fnr"
    @close="ersatzOpen = false"
    @pick="onPickErsatz"
    @ignore="onIgnoreErsatz"
  />

  <div v-if="view" class="space-y-4">
    <FilialeGridSection
      v-for="f in view.filialen"
      :key="f.fnr"
      :view="view"
      :filiale="f"
      :mitarbeiterByFiliale="mitarbeiterByFiliale"
      :fullName="fullName"
      :stundenByMnr="stundenByMnr"
      :dow="dow"
      :day="day"
      :dienstOf="dienstOf"
      :cellStyleByDienst="cellStyleByDienst"
      :cellText="cellText"
      :editingKey="editingKey"
      v-model="localTyp"
      :options="options"
      :openDropdown="openDropdown"
      :saveDropdown="saveDropdown"
    />
  </div>
</template>
