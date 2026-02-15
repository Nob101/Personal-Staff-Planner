<!-- DienstplanGrid.vue (übergeordnete Komponente)-->

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

/**
 * Props kommen vom Parent (z.B. DienstplanView).
 * Callbacks sind optional, da diese Komponente nur weiterleitet
 * und keine Business-Logik enthält.
 */
const props = defineProps({
  view: { type: Object, default: null },           // komplette Dienstplan-View
  filialen: { type: Array, default: null },        // optionale Filial-Override-Liste
  onShift: { type: Function, default: null },      // Dienst ändern
  onGetErsatz: { type: Function, default: null },  // Ersatz-Kandidaten laden
  onShiftMitErsatz: { type: Function, default: null }, // Dienst + Ersatz speichern
  jahr: { type: Number, required: true },
  monat: { type: Number, required: true }
});

/**
 * WHY:
 * view wird als computed weitergereicht, damit Reaktivität erhalten bleibt,
 * falls der Parent die View austauscht (z.B. Monatswechsel).
 */
const viewRef = computed(() => props.view);

/**
 * Grid-Daten & Helper-Funktionen für die Darstellung.
 * Kommt zentral aus dem Composable, damit diese Komponente schlank bleibt.
 */
const {
  dienstOf,               // liefert den Dienst für eine bestimmte Zelle
  cellStyleByDienst,      // bestimmt Styling je nach Dienst-Typ
  cellText,               // Text/Inhalt der Zelle
  stundenByMnr,           // Stunden-Summe pro Mitarbeiter
  mitarbeiterByFiliale,   // Mitarbeiter gruppiert nach Filiale
  fullName,               // Helper für vollständigen Namen
  dow,                    // Wochentag
  day,                    // Kalendertag
} = useDienstplanGridData(viewRef);

/**
 * Inline-Bearbeitung eines Dienstes:
 * - Dropdown öffnen
 * - Typ ändern
 * - Speichern
 * - ggf. Ersatzprozess starten
 *
 * Aktionen werden bewusst an den Parent weitergereicht.
 */
const {
  editingKey,     // aktuell editierte Zelle
  localTyp,       // lokaler Dienst-Typ (v-model)
  options,        // Dropdown-Optionen
  openDropdown,   // öffnet das Dropdown
  saveDropdown,   // speichert die Auswahl

  // Ersatz-Workflow
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
</script>

<template>
  <!--
    Ersatz-Modal:
    Öffnet sich, wenn ein Dienst nicht direkt gespeichert werden kann
    und ein Ersatz-Mitarbeiter benötigt wird.
  -->
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

  <!--
    Grid wird nur gerendert, wenn eine View vorhanden ist,
    um Fehler beim initialen Laden zu vermeiden.
  -->
  <div v-if="view" class="space-y-4">

    <!--
      Pro Filiale eine eigene Grid-Sektion.
      Falls filialen-Prop gesetzt ist, wird diese verwendet,
      ansonsten die Filialen aus der View.
    -->
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
    />
  </div>
</template>
