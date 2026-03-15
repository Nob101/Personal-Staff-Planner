<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from "vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  kandidaten: { type: Array, default: () => [] },
  altDienstId: { type: Number, default: null },
  altNewTyp: { type: String, default: "" },
  datum: { type: String, default: "" },
  fnr: { type: Number, default: null },
});

const emit = defineEmits(["close", "pick", "ignore"]);

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
  <div v-if="open" class="dp-modal-root">
    <div class="dp-modal-overlay" @click="emit('close')"></div>

    <div
      ref="modalEl"
      class="absolute w-[520px] max-w-[94vw] rounded-2xl border border-white/10 bg-linear-to-b from-zinc-500 to-zinc-800 text-white shadow-2xl"
      :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
    >
      <div
        class="px-3 py-2 border-b border-white/10 flex items-center justify-between cursor-pointer select-none"
        @mousedown="startDrag"
      >
        <div class="font-semibold text-sm">
          Ersatz auswählen
          <span class="text-white/60 font-normal ml-2">
            {{ datum }}
          </span>
        </div>

        <button
          class="px-2 py-1 text-xs rounded-lg bg-linear-to-b from-red-500 to-red-900 hover:from-red-900 hover:to-red-500"
          @mousedown.stop
          @click.stop="emit('close')"
        >
          Schließen
        </button>
      </div>

      <div class="p-3">
        <div class="text-xs text-white/70 mb-2">
          Alt-Dienst wird auf
          <span class="font-bold text-white">{{ altNewTyp }}</span>
          gesetzt. Ersatz übernimmt automatisch den alten Typ.
        </div>

        <div v-if="loading" class="text-white/70 text-sm">
          Lade Kandidaten…
        </div>

        <div v-else-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>

        <div v-else>
          <div v-if="!kandidaten.length" class="text-white/60 text-sm">
            Keine Kandidaten gefunden (muss F haben + Haupt-/Nebenfiliale passen).
          </div>

          <div v-else class="max-h-[45vh] overflow-auto rounded-xl border border-white/10">
            <table class="w-full text-xs">
              <thead class="sticky top-0 bg-zinc-500 border-b border-white/10">
                <tr class="text-white">
                  <th class="text-left px-2 py-2">Mitarbeiter</th>
                  <th class="text-left px-2 py-2">Status</th>
                  <th class="px-2 py-2"></th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="k in kandidaten"
                  :key="k.dienstId"
                  class="border-b border-white/5 hover:bg-white/5"
                >
                  <td class="px-2 py-2">
                    {{ k.vorname }} {{ k.nachname }}
                    <span v-if="k.springer" class="text-amber-400 font-bold ml-1">*</span>
                  </td>
                  <td class="px-2 py-2 text-white/70">
                    {{ k.schicht_typ }} (Filiale {{ k.dienstFilialname }})
                  </td>
                  <td class="px-2 py-2 text-right">
                    <button
                      class="px-2.5 py-1 text-xs rounded-lg bg-linear-to-b from-blue-500 to-blue-900 hover:from-blue-900 hover:to-blue-500"
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

        <div class="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div class="flex items-center gap-2 ml-auto">
            <button
              class="px-3 py-1.5 text-sm rounded-xl bg-linear-to-b from-zinc-500 to-zinc-700 hover:from-zinc-700 hover:to-zinc-500"
              @click="emit('close')"
            >
              Abbrechen
            </button>

            <button
              class="px-3 py-1.5 text-sm rounded-xl bg-linear-to-b from-amber-700 to-amber-900 hover:from-amber-900 hover:to-amber-700"
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