<script setup>
defineProps({
  open: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 p-6"
      @click.self="emit('close')"
    >
      <div
        class="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-zinc-950 text-zinc-100 shadow-2xl ring-1 ring-white/10"
      >
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <div>
            <h2 class="text-2xl font-extrabold">
              Personal Staff Planner
            </h2>
            <p class="mt-1 text-sm text-zinc-400">
              Version 2.0 • Juni 2026
            </p>
          </div>

          <button
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-lg font-bold text-white hover:bg-red-700"
            @click="emit('close')"
          >
            ×
          </button>
        </div>

        <div class="max-h-[65vh] overflow-y-auto px-6 py-6 text-sm leading-7">
          <h3 class="mb-5 text-xl font-bold text-emerald-400">
            Neue Funktionen & Verbesserungen
          </h3>

          <ul class="space-y-3">
            <li>✓ Abwesenheitsverwaltung für Urlaub und Krankenstand hinzugefügt.</li>
            <li>✓ Abwesenheiten werden bei der Dienstplanerstellung automatisch berücksichtigt.</li>
            <li>✓ Springerlogik mit filialübergreifender Einsatzplanung erweitert.</li>
            <li>✓ Ruhezeiten und maximale Dienstblöcke werden automatisch berücksichtigt.</li>
            <li>✓ Verbesserte Stundenverteilung für Springer.</li>
            <li>✓ Teilzeitmodelle 20h, 25h, 30h, 35h und 40h werden unterstützt.</li>
            <li>✓ Stundenberechnung für Urlaub und Krankenstand abhängig vom Beschäftigungsausmaß.</li>
            <li>✓ Abdeckungsprüfung integriert – fehlende A- oder E-Dienste werden hervorgehoben.</li>
            <li>✓ Einzelne Filialen können unabhängig generiert und gelöscht werden.</li>
            <li>✓ Filialübergreifende Springer bleiben bei einer Neugenerierung anderer Filialen erhalten.</li>
            <li>✓ Stundenkonten werden beim Löschen einzelner Filialen automatisch korrigiert.</li>
            <li>✓ Nach dem Löschen werden benötigte Freidienste automatisch ergänzt.</li>
            <li>✓ Diverse Fehlerbehebungen und Optimierungen der Dienstplanlogik.</li>
          </ul>

          <div class="mt-8 border-t border-white/10 pt-5 text-center text-xs text-zinc-500">
            Personal Staff Planner • Release 2.0
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>