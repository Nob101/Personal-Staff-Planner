<!-- MitarbeiterCard.vue -->
<script setup>
import { defineProps, defineEmits, computed } from "vue";
import bearbeiten_icon from "@/assets/icons/bearbeiten_icon_solid.svg";
import loeschen_icon from "@/assets/icons/loeschen_icon_solid.svg";

const props = defineProps({
  mitarbeiter: { type: Object, required: true },
  filialen: { type: Array, required: true },
});

const emit = defineEmits(["edit", "delete"]);

const hauptfilialeName = computed(() => {
  const f = props.filialen.find((f) => f.id === props.mitarbeiter.hauptfiliale);
  return f ? f.name : "-";
});

const nebenfilialenNamen = computed(() => {
  if (!props.mitarbeiter.nebenfilialen?.length) return "-";
  return props.mitarbeiter.nebenfilialen
    .map((id) => props.filialen.find((f) => f.id === id)?.name || id)
    .join(", ");
});

function handleEdit() {
  emit("edit", props.mitarbeiter);
}
function handleDelete() {
  emit("delete", props.mitarbeiter);
}
</script>

<template>
  <article
    class="relative rounded-3xl border border-white/10 bg-linear-to-b from-zinc-800/70 to-zinc-900/80 p-10 shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
  >
    <!-- Actions oben rechts -->
    <div class="absolute right-6 top-6 flex gap-3">
      <button
        @click="handleEdit"
        class="flex items-center justify-center
              rounded-xl border border-white/15
              bg-blue-500/35 px-2 py-2
              text-sm font-sans text-white/90
              hover:bg-blue-500/15"
      >
        <img
          :src="bearbeiten_icon"
          class="h-5 w-5"
          alt="Bearbeiten"
        />
      </button>

      <button
        @click="handleDelete"
        class="flex items-center justify-center
              rounded-xl border border-red-400/30
              bg-red-500/35 px-2 py-2
              hover:bg-red-500/25"
      >
        <img
          :src="loeschen_icon"
          class="h-5 w-5"
          alt="Löschen"
        />
      </button>

    </div>

    <!-- Titel + Status -->
    <div class="flex items-center gap-4">
      <h1 class="text-4xl font-extrabold tracking-tight text-white">
        {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}
      </h1>

      <!-- Statuspunkt: z.B. Springer = grün, sonst grau -->
      <span
        class="h-3.5 w-3.5 rounded-full"
        :class="mitarbeiter.springer ? 'bg-green-400' : 'bg-white/30'"
        :title="mitarbeiter.springer ? 'Springer' : 'Kein Springer'"
      />
    </div>

    <!-- Inhalt -->
    <div class="mt-10 grid grid-cols-2 gap-12 text-lg text-white/90">
      <!-- LINKS: Kontakt -->
      <section class="space-y-6">
        <div class="space-y-1">
          <div class="text-white/60">Geburtsdatum</div>
          <div class="text-2xl font-semibold text-white">
            {{ mitarbeiter.geburtsdatum ?? "-" }}
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
            Email
          </div>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="text-white/60">Email 1</span>
              <span class="text-white">{{ mitarbeiter.email1 || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-white/60">Email 2</span>
              <span class="text-white">{{ mitarbeiter.email2 || "-" }}</span>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
            Telefon
          </div>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="text-white/60">Telefon 1</span>
              <span class="text-white">{{ mitarbeiter.telefon1 || "-" }}</span>
            </div>
            <div class="flex justify-between gap-4">
              <span class="text-white/60">Telefon 2</span>
              <span class="text-white">{{ mitarbeiter.telefon2 || "-" }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- RECHTS: Adresse + Arbeit + Filialen -->
      <section class="space-y-6 border-l border-white/15 pl-10">
        <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
            Adresse
          </div>
          <div class="space-y-2">
            <Row label="Straße" :value="mitarbeiter.strasse || '-'" />
            <Row label="Postleitzahl" :value="mitarbeiter.postleitzahl || '-'" />
            <Row label="Ort" :value="mitarbeiter.ort || '-'" />
            <Row label="Land" :value="mitarbeiter.land || '-'" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
            <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
              Arbeit
            </div>
            <div class="space-y-2">
              <Row label="Arbeitsstunden" :value="String(mitarbeiter.arbeitsstunden ?? '-')" />
              <Row
                label="Springer"
                :value="mitarbeiter.springer === true ? 'Ja' : mitarbeiter.springer === false ? 'Nein' : 'Nicht bekannt'"
              />
            </div>
          </div>

          <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
            <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
              Filialen
            </div>
            <div class="space-y-2">
              <Row label="Hauptfiliale" :value="hauptfilialeName" />
              <Row label="Nebenfilialen" :value="nebenfilialenNamen" />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">
            Anmerkungen
          </div>
          <textarea
            class="h-28 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-white/90 outline-none"
            :value="mitarbeiter.anmerkungen || ''"
            readonly
          />
        </div>
      </section>
    </div>
  </article>
</template>

<script>
export default {
  components: {
    Row: {
      props: { label: String, value: String },
      template: `
        <div class="flex justify-between gap-4">
          <span class="text-white/60">{{ label }}</span>
          <span class="text-white text-right">{{ value }}</span>
        </div>
      `,
    },
  },
};
</script>