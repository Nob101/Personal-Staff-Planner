<template>
  <!-- Modal wird nur gerendert, wenn open=true -->
  <div v-if="open" class="fixed inset-0 z-50">
    <!-- Dunkler Hintergrund (Overlay). Klick darauf schließt das Modal -->
    <div class="absolute inset-0 bg-black/70" @click="$emit('close')"></div>

    <!-- Modal-Box: zentriert (left/top 50% + translate), fix breite, Dark-Design -->
    <div
      class="absolute left-1/2 top-1/2 w-[780px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2
             rounded-xl border border-white/10 bg-[#141414] text-white shadow-2xl"
    >
      <!-- Header-Bereich des Modals -->
      <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div class="font-semibold">
          <!-- Titel + Dienst-ID (optional chaining, falls dienst null ist) -->
          Manuelle Eintragung – Dienst #{{ dienst?.id }}

          <!-- Zusatzinfos: Datum + Filiale -->
          <span class="text-white/60 font-normal ml-2">
            {{ dienst?.datum }} | Filiale {{ dienst?.fnr }}
          </span>
        </div>

        <!-- Schließen-Button rechts oben -->
        <button
          class="px-2 py-1 rounded bg-white/10 hover:bg-white/15"
          @click="$emit('close')"
        >
          Esc
        </button>
      </div>

      <!-- Content-Bereich -->
      <div class="p-4">
        <!-- Falls Daten (Mitarbeiter/Kandidaten) noch laden -->
        <div v-if="loading" class="text-white/70">Lade Mitarbeiter…</div>

        <!-- Falls ein Fehler übergeben wurde -->
        <div v-else-if="error" class="text-red-300">{{ error }}</div>

        <!-- Normalzustand: Formular -->
        <div v-else class="space-y-4">

          <!-- 2 Spalten ab md, sonst 1 Spalte -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">

            <!-- Dropdown: Status/Schicht-Typ -->
            <div>
              <label class="block text-xs text-white/70 mb-1">Status</label>

              <!-- v-model="localTyp" bindet die Auswahl an localTyp -->
              <select
                v-model="localTyp"
                class="w-full px-2 py-2 rounded-xl border border-white/15 bg-black/30 text-white outline-none"
              >
                <!-- feste Statuswerte -->
                <option value="A">A – Anfangsdienst</option>
                <option value="E">E – Enddienst</option>
                <option value="F">F – Frei</option>
                <option value="K">K – Krank</option>
                <option value="U">U – Urlaub</option>
              </select>
            </div>

            <!-- Dropdown: Mitarbeiter -->
            <div>
              <label class="block text-xs text-white/70 mb-1">Mitarbeiter</label>

              <!-- v-model.number -> castet die value zu Number (wichtig, wenn IDs numeric sind) -->
              <select
                v-model.number="localMnr"
                class="w-full px-2 py-2 rounded-xl border border-white/15 bg-black/30 text-white outline-none"
              >
                <!-- null als "nichts gewählt" -->
                <option :value="null">— wählen —</option>

                <!-- Kandidaten-Liste durchlaufen -->
                <option v-for="m in kandidaten" :key="m.mnr" :value="m.mnr">
                  {{ m.nachname }} {{ m.vorname }} ({{ m.mnr }})
                  <span v-if="m.springer"> · Springer</span>
                </option>
              </select>

              <!-- Mini-Erklärung, wie kandidaten zustande kommen -->
              <div class="text-xs text-white/50 mt-1">
                Kandidaten = Springer ODER (Nebenfiliale passt) und am Datum nicht A/E eingeteilt.
              </div>
            </div>
          </div>

          <!-- Footer: Actions -->
          <div class="flex items-center justify-end gap-2 pt-2">
            <!-- Abbrechen: schließt Modal ohne Save -->
            <button
              class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15"
              @click="$emit('close')"
            >
              Abbrechen
            </button>

            <!-- Speichern: disabled wenn saving oder Formular unvollständig -->
            <button
              class="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-60"
              :disabled="saving || !canSave"
              @click="onSave"
            >
              Speichern
            </button>
          </div>

          <!-- Validierungs-Hinweis -->
          <div v-if="!canSave" class="text-xs text-red-300">
            Bitte Status und Mitarbeiter wählen.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";

/**
 * Props kommen vom Parent.
 * - open: steuert, ob Modal sichtbar ist
 * - dienst: der Dienst, der bearbeitet wird
 * - kandidaten: Liste möglicher Mitarbeiter für diesen Dienst
 * - loading/saving/error: UI-Zustände, damit Parent den Flow kontrolliert
 */
const props = defineProps({
  open: { type: Boolean, default: false },
  dienst: { type: Object, default: null }, // { id, datum, fnr, mnr, schicht_typ, ... }
  kandidaten: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  saving: { type: Boolean, default: false },
  error: { type: String, default: "" },
});

/**
 * Events die diese Komponente nach außen feuern darf:
 * - close: Modal schließen
 * - save: Speichern-Action mit Payload
 */
const emit = defineEmits(["close", "save"]);

/**
 * Lokale Form-States:
 * kopieren die Werte aus props.dienst in lokale refs,
 * damit man im Modal ändern kann ohne direkt props zu mutieren.
 */
const localTyp = ref("F");     // default: Frei
const localMnr = ref(null);    // default: kein Mitarbeiter

/**
 * Sobald sich props.dienst ändert (z.B. anderes Modal geöffnet),
 * wird das Formular neu gesetzt.
 * immediate:true -> läuft auch beim ersten Rendern.
 */
watch(
  () => props.dienst,
  (d) => {
    if (!d) return;
    // existierende Daten übernehmen oder fallback
    localTyp.value = d.schicht_typ || "F";
    localMnr.value = d.mnr ?? null;
  },
  { immediate: true }
);

/**
 * canSave = einfache Validierung:
 * Status muss gesetzt sein UND Mitarbeiter gewählt.
 * Wird genutzt für disable Button + Fehlermeldung.
 */
const canSave = computed(() => {
  return !!localTyp.value && localMnr.value != null;
});

/**
 * onSave feuert Event an Parent.
 * Parent macht dann z.B. API Call
 */
function onSave() {
  emit("save", {
    dienstId: props.dienst.id,
    schicht_typ: localTyp.value,
    mnr: localMnr.value,
  });
}
</script>
