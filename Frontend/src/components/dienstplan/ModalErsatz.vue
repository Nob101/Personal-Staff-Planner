<!-- ModalErsatz.vue (Modal für Ersatz bei Dienstkonflikten) -->
<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";

/**
 * Props:
 * Dieses Modal zeigt mögliche Ersatz-Mitarbeiter an,
 * wenn ein Dienst nicht direkt gespeichert werden kann.
 */
const props = defineProps({
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
const emit = defineEmits(["close", "pick", "ignore"]);

// ======================
// DRAG / MOVE LOGIC
// ======================
const modalEl = ref(null);
const pos = ref({ x: 0, y: 0 });
const dragging = ref(false);
const dragStart = ref({ mx: 0, my: 0, x: 0, y: 0 });

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function centerModal() {
  const el = modalEl.value;
  if (!el) return;
  const r = el.getBoundingClientRect();
  pos.value = {
    x: Math.round((window.innerWidth - r.width) / 2),
    y: Math.round((window.innerHeight - r.height) / 2),
  };
}

function startDrag(e) {
  // nur linke Maustaste
  if (e.button !== 0) return;

  dragging.value = true;
  dragStart.value = {
    mx: e.clientX,
    my: e.clientY,
    x: pos.value.x,
    y: pos.value.y,
  };

  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", stopDrag);
}

function onDragMove(e) {
  if (!dragging.value) return;
  const el = modalEl.value;
  if (!el) return;

  const r = el.getBoundingClientRect();
  const margin = 12;

  const nx = dragStart.value.x + (e.clientX - dragStart.value.mx);
  const ny = dragStart.value.y + (e.clientY - dragStart.value.my);

  pos.value = {
    x: clamp(nx, margin, window.innerWidth - r.width - margin),
    y: clamp(ny, margin, window.innerHeight - r.height - margin),
  };
}

function stopDrag() {
  dragging.value = false;
  window.removeEventListener("mousemove", onDragMove);
  window.removeEventListener("mouseup", stopDrag);
}

onBeforeUnmount(() => stopDrag());

watch(
  () => props.open,
  async (v) => {
    if (!v) return;
    await nextTick();
    centerModal();
  }
);
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <!-- Overlay -->
    <div class="absolute inset-0 bg-black/60" @click="emit('close')"></div>

    <!-- Modal-Container (verschiebbar) -->
    <div
      ref="modalEl"
      class="absolute w-[780px] max-w-[95vw] rounded-2xl border border-white/10 bg-zinc-900 text-white shadow-2xl"
      :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    >
      <!-- HEADER (drag handle) -->
      <div
        class="px-4 py-3 border-b border-white/10 flex items-center justify-between cursor-move select-none"
        @mousedown="startDrag"
      >
        <div class="font-semibold">
          Ersatz auswählen
          <span class="text-white/60 font-normal ml-2">
            {{ datum }}
          </span>
        </div>

        <!-- Wichtig: stop, damit Drag nicht startet, wenn man Button klickt -->
        <button
          class="px-2 py-1 rounded-xl bg-red-500/40 hover:bg-red-500/80"
          @mousedown.stop
          @click.stop="emit('close')"
        >
          Schließen
        </button>
      </div>

      <!-- CONTENT -->
      <div class="p-4">
        <div class="text-sm text-white/70 mb-2">
          Alt-Dienst wird auf
          <span class="font-bold text-white">{{ altNewTyp }}</span>
          gesetzt. Ersatz übernimmt automatisch den alten Typ.
        </div>

        <div v-if="loading" class="text-white/70">
          Lade Kandidaten…
        </div>

        <div v-else-if="error" class="text-red-500">
          {{ error }}
        </div>

        <div v-else>
          <div v-if="!kandidaten.length" class="text-white/60">
            Keine Kandidaten gefunden (muss F haben + Haupt-/Nebenfiliale passen).
          </div>

          <div v-else class="max-h-[55vh] overflow-auto rounded border border-white/10">
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
                      @click="emit('pick', k)"
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
        <div class="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div class="flex items-center gap-2 ml-auto">
            <button
              class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/30"
              @click="emit('close')"
            >
              Abbrechen
            </button>

            <button
              class="px-3 py-2 rounded-xl bg-amber-500/25 hover:bg-amber-500/60 border border-amber-400/20 text-amber-100"
              @click="emit('ignore')"
            >
              Ignorieren &amp; speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>