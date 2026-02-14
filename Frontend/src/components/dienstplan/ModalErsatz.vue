<!-- ModalErsatz.vue (Modal für Ersatz bei Dienstkonflikten)-->

<script setup>
/**
 * Props:
 * Dieses Modal zeigt mögliche Ersatz-Mitarbeiter an,
 * wenn ein Dienst nicht direkt gespeichert werden kann.
 */
defineProps({
  open: { type: Boolean, default: false },        // Modal sichtbar
  loading: { type: Boolean, default: false },     // Kandidaten werden geladen
  error: { type: String, default: "" },           // Fehler beim Laden
  kandidaten: { type: Array, default: () => [] }, // Ersatz-Kandidaten
  altDienstId: { type: Number, default: null },   // ursprünglicher Dienst
  altNewTyp: { type: String, default: "" },       // neuer Typ für Alt-Dienst
  datum: { type: String, default: "" },           // Datum des Dienstes
  fnr: { type: Number, default: null },           // Filialnummer
});

/**
 * Events:
 * - close: Modal schließen
 * - pick: Ersatz auswählen
 * - ignore: Ersatz ignorieren & trotzdem speichern
 */
defineEmits(["close", "pick", "ignore"]);

</script>

<template>
  <!--
    Overlay:
    Wird nur angezeigt, wenn `open === true`.
    Klick auf den dunklen Hintergrund schließt das Modal.
  -->
  <div v-if="open" class="fixed inset-0 z-50">
    <div
      class="absolute inset-0 bg-black/60"
      @click="$emit('close')"
    ></div>

    <!-- Modal-Container -->
    <div
      class="absolute left-1/2 top-1/2 w-[780px] max-w-[95vw]
             -translate-x-1/2 -translate-y-1/2
             rounded-2xl border border-white/10
             bg-zinc-900 text-white shadow-2xl"
    >
      <!-- HEADER -->
      <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div class="font-semibold">
          Ersatz auswählen
          <span class="text-white/60 font-normal ml-2">
            {{ datum }}
          </span>
        </div>

        <button
          class="px-2 py-1 rounded-xl bg-red-500/40 hover:bg-red-500/80"
          @click="$emit('close')"
        >
          Schließen
        </button>
      </div>

      <!-- CONTENT -->
      <div class="p-4">
        <!-- Info-Text zum Ersatz-Workflow -->
        <div class="text-sm text-white/70 mb-2">
          Alt-Dienst wird auf
          <span class="font-bold text-white">{{ altNewTyp }}</span>
          gesetzt.
          Ersatz übernimmt automatisch den alten Typ.
        </div>

        <!-- Lade- / Fehlerstatus -->
        <div v-if="loading" class="text-white/70">
          Lade Kandidaten…
        </div>

        <div v-else-if="error" class="text-red-500">
          {{ error }}
        </div>

        <!-- Kandidatenliste -->
        <div v-else>
          <!-- Keine Kandidaten -->
          <div v-if="!kandidaten.length" class="text-white/60">
            Keine Kandidaten gefunden
            (muss F haben + Haupt-/Nebenfiliale passen).
          </div>

          <!-- Kandidaten Tabelle -->
          <div
            v-else
            class="max-h-[55vh] overflow-auto rounded border border-white/10"
          >
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-zinc-500 border-b border-white/10">
                <tr class="text-white">
                  <th class="text-left p-2">Mitarbeiter</th>
                  <th class="text-left p-2">Status</th>
                  <th class="p-2"></th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="k in kandidaten"
                  :key="k.dienstId"
                  class="border-b border-white/5 hover:bg-white/5"
                >
                  <td class="p-2">
                    {{ k.vorname }} {{ k.nachname }}
                  </td>
                  <td class="p-2 text-white/70">Frei (F)</td>
                  <td class="p-2 text-right">
                    <button
                      class="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-400"
                      @click="$emit('pick', k)"
                    >
                      wählen
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- FOOTER ACTIONS -->
        <div
          class="mt-4 flex items-center justify-between gap-3
                 border-t border-white/10 pt-4"
        >

          <div class="flex items-center gap-2 ml-auto">
            <button
              class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/30"
              @click="$emit('close')"
            >
              Abbrechen
            </button>

            <button
              class="px-3 py-2 rounded-xl
                     bg-amber-500/25 hover:bg-amber-500/60
                     border border-amber-400/20 text-amber-100"
              @click="$emit('ignore')"
            >
              Ignorieren &amp; speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

