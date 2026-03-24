<script setup>
// Vue
import { computed } from "vue";

// Modal für Ersatz-Mitarbeiter-Auswahl
import ModalErsatz from "@/components/dienstplan/ModalErsatz.vue";

// Grid-Sektion pro Filiale (Dienstplan-Tabelle)
import FilialeGridSection from "@/components/dienstplan/FilialeGridSection.vue";

// Composable: liefert alle berechneten Grid-Daten & Helper
import { useDienstplanGridData } from "@/composables/dienstplan/useDienstplanGridData.js";

// Composable: Inline-Edit von Diensten inkl. Ersatz-Workflow
import { useInlineShiftEdit } from "@/composables/dienstplan/useInlineShiftEdit.js";

const props = defineProps({
  view: { type: Object, default: null },
  filialen: { type: Array, default: null },
  onShift: { type: Function, default: null },
  onGetErsatz: { type: Function, default: null },
  onShiftMitErsatz: { type: Function, default: null },
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true },
  loading: { type: Boolean, default: false },
  hasView: { type: Boolean, default: false },
});

const emit = defineEmits(["generateFiliale", "removeFiliale"]);

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
  ersatzCtxFilialname,
  onPickErsatz,
  onIgnoreErsatz,
} = useInlineShiftEdit({
  view: viewRef,
  dienstOf,
  onShift: (payload) => props.onShift?.(payload),
  onGetErsatz: (id) => props.onGetErsatz?.(id),
  onShiftMitErsatz: (payload) => props.onShiftMitErsatz?.(payload),
});

function generateNurFiliale(payload) {
  emit("generateFiliale", payload);
}

function removeNurFiliale(payload) {
  emit("removeFiliale", payload);
}
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
    :filialname="ersatzCtxFilialname"
    @close="ersatzOpen = false"
    @pick="onPickErsatz"
    @ignore="onIgnoreErsatz"
  />

  <div v-if="view" class="space-y-4 mt-6">
    <FilialeGridSection
      v-for="f in (filialen ?? view.filialen)"
      :key="f.fnr"
      :view="view"
      :filiale="f"
      :jahr="jahr"
      :monat="monat"
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
      :loading="loading"
      :hasView="hasView"
      @generateFiliale="generateNurFiliale"
      @removeFiliale="removeNurFiliale"
    />
  </div>
</template>