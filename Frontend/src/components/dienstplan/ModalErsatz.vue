<template>
  <div v-if="open" class="fixed inset-0 z-50">
    <div class="absolute inset-0 bg-black/70" @click="$emit('close')"></div>

    <div
      class="absolute left-1/2 top-1/2 w-[780px] max-w-[95vw] -translate-x-1/2 -translate-y-1/2
             rounded-xl border border-white/10 bg-[#141414] text-white shadow-2xl"
    >
      <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div class="font-semibold">
          Ersatz auswählen – Dienst #{{ altDienstId }}
          <span class="text-white/60 font-normal ml-2">{{ datum }} | Filiale {{ fnr }}</span>
        </div>

        <button class="px-2 py-1 rounded bg-white/10 hover:bg-white/15" @click="$emit('close')">
          Schließen
        </button>
      </div>

      <div class="p-4">
        <div class="text-sm text-white/70 mb-2">
          Alt-Dienst wird auf <span class="font-bold text-white">{{ altNewTyp }}</span> gesetzt.
          Ersatz übernimmt automatisch den alten Typ.
        </div>

        <div v-if="loading" class="text-white/70">Lade Kandidaten…</div>
        <div v-else-if="error" class="text-red-300">{{ error }}</div>

        <div v-else>
          <div v-if="!kandidaten.length" class="text-white/60">
            Keine Kandidaten gefunden (muss F haben + Haupt-/Nebenfiliale passen).
          </div>

          <div v-else class="max-h-[55vh] overflow-auto rounded border border-white/10">
            <table class="w-full text-sm">
              <thead class="sticky top-0 bg-[#1b1b1b] border-b border-white/10">
                <tr class="text-white/70">
                  <th class="text-left p-2">Mitarbeiter</th>
                  <th class="text-left p-2">MNR</th>
                  <th class="text-left p-2">DienstId</th>
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
                  <td class="p-2">{{ k.vorname }} {{ k.nachname }}</td>
                  <td class="p-2">{{ k.mnr }}</td>
                  <td class="p-2">{{ k.dienstId }}</td>
                  <td class="p-2 text-white/70">Frei (F)</td>
                  <td class="p-2 text-right">
                    <button
                      class="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500"
                      @click="$emit('pick', k)"
                    >
                      wählen
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mt-3 text-xs text-white/50">
            Hinweis: Wenn du Nebenfilialen noch nicht gepflegt hast, kommen dort keine Kandidaten – außer Hauptfiliale passt.
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
          <div class="text-xs text-white/60">
            Du kannst auch bewusst unterbesetzen und trotzdem speichern.
          </div>

          <div class="flex items-center gap-2">
            <button
              class="px-3 py-2 rounded bg-white/10 hover:bg-white/15"
              @click="$emit('close')"
            >
              Abbrechen
            </button>

            <button
              class="px-3 py-2 rounded bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/20 text-amber-100"
              @click="$emit('ignore')"
            >
              Ignorieren & speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  open: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  error: { type: String, default: "" },
  kandidaten: { type: Array, default: () => [] },
  altDienstId: { type: Number, default: null },
  altNewTyp: { type: String, default: "" },
  datum: { type: String, default: "" },
  fnr: { type: Number, default: null },
});

defineEmits(["close", "pick", "ignore"]);
</script>
