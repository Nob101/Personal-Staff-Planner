<!-- MitarbeiterCard.vue -->
<script setup>
import { defineProps, defineEmits, computed, ref, watch } from "vue";
import Multiselect from "vue-multiselect";

import bearbeiten_icon from "@/assets/icons/bearbeiten_icon_solid.svg";
import loeschen_icon from "@/assets/icons/loeschen_icon_solid.svg";

const props = defineProps({
  mitarbeiter: { type: Object, required: true },
  filialen: { type: Array, required: true },
});

const emit = defineEmits([
  "save",   // -> edited payload
  "delete", // -> mitarbeiter
]);

const isEditing = ref(false);

// lokale Kopie fürs Bearbeiten
const form = ref({
  id: null,
  vorname: "",
  nachname: "",
  geburtsdatum: "",
  email1: "",
  email2: "",
  telefon1: "",
  telefon2: "",
  strasse: "",
  ort: "",
  postleitzahl: "",
  land: "",
  arbeitsstunden: "",
  springer: false,
  hauptfiliale: null,   // Objekt
  nebenfilialen: [],    // Array von Objekten
  anmerkungen: "",
});

function loadFromProps(m) {
  form.value = {
    id: m?.id ?? m?.mnr ?? null,
    vorname: m?.vorname ?? "",
    nachname: m?.nachname ?? "",
    geburtsdatum: m?.geburtsdatum ?? "",
    email1: m?.email1 ?? "",
    email2: m?.email2 ?? "",
    telefon1: m?.telefon1 ?? "",
    telefon2: m?.telefon2 ?? "",
    strasse: m?.strasse ?? "",
    ort: m?.ort ?? "",
    postleitzahl: m?.postleitzahl ?? "",
    land: m?.land ?? "",
    arbeitsstunden: m?.arbeitsstunden ?? m?.wochenstunden ?? m?.arbeitnehmertyp ?? "",
    springer: m?.springer === true || m?.springer === "Ja",
    // neue Struktur bei dir: hauptfiliale/nebenfilialen sind Objekte
    hauptfiliale: m?.hauptfiliale ?? null,
    nebenfilialen: Array.isArray(m?.nebenfilialen) ? m.nebenfilialen : [],
    anmerkungen: m?.anmerkungen ?? "",
  };
}

watch(
  () => props.mitarbeiter,
  (m) => {
    loadFromProps(m);
    // wenn ein anderer Mitarbeiter ausgewählt wird: Edit-Modus zurücksetzen
    isEditing.value = false;
  },
  { immediate: true }
);

const nebenfilialenOptionen = computed(() => {
  // Hauptfiliale nicht als Nebenfiliale erlauben
  const hfId = form.value.hauptfiliale?.id ?? form.value.hauptfiliale?.fnr ?? null;
  return props.filialen.filter((f) => (f.id ?? f.fnr) !== hfId);
});

const hauptfilialeName = computed(() => props.mitarbeiter?.hauptfiliale?.name ?? "-");
const nebenfilialenNamen = computed(() =>
  props.mitarbeiter?.nebenfilialen?.length
    ? props.mitarbeiter.nebenfilialen.map((f) => f?.name ?? f?.filialname ?? "").filter(Boolean).join(", ")
    : "-"
);

function startEdit() {
  loadFromProps(props.mitarbeiter);
  isEditing.value = true;
}

function cancelEdit() {
  loadFromProps(props.mitarbeiter);
  isEditing.value = false;
}

function saveEdit() {
  const hfId = form.value.hauptfiliale?.id ?? form.value.hauptfiliale?.fnr ?? null;
  const nfIds = form.value.nebenfilialen?.length
    ? form.value.nebenfilialen.map((f) => f?.id ?? f?.fnr).filter(Boolean)
    : null;

  emit("save", {
    id: form.value.id,
    vorname: form.value.vorname,
    nachname: form.value.nachname,
    geburtsdatum: form.value.geburtsdatum || null,
    email1: form.value.email1 || "",
    email2: form.value.email2 || "",
    telefon1: form.value.telefon1 || "",
    telefon2: form.value.telefon2 || "",
    strasse: form.value.strasse || "",
    ort: form.value.ort || "",
    postleitzahl: form.value.postleitzahl || "",
    land: form.value.land || "",
    arbeitsstunden: form.value.arbeitsstunden === "" ? null : Number(form.value.arbeitsstunden),
    springer: form.value.springer === true ? "Ja" : form.value.springer === false ? "Nein" : "Nicht bekannt",
    hauptfiliale: hfId,
    nebenfilialen: nfIds,
    anmerkungen: form.value.anmerkungen || "",
  });

  isEditing.value = false;
}

function handleDelete() {
  emit("delete", props.mitarbeiter);
}
</script>

<template>
  <article
    class="font-sans relative rounded-3xl border border-white/10 bg-linear-to-b from-zinc-800/70 to-zinc-900/80 p-10 shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
  >
    <!-- Actions oben rechts -->
    <div class="absolute right-6 top-6 flex gap-3">
      <!-- Bearbeiten / Speichern / Abbrechen -->
      <template v-if="!isEditing">
        <button
          @click="startEdit"
          class="flex items-center justify-center rounded-xl border border-white/15 bg-blue-500/35 px-2 py-2 hover:bg-blue-500/15"
          type="button"
          title="Bearbeiten"
        >
          <img :src="bearbeiten_icon" class="h-5 w-5" alt="Bearbeiten" />
        </button>
      </template>

      <template v-else>
        <button
          @click="saveEdit"
          class="rounded-xl border border-white/15 bg-green-500/35 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-green-500/20"
          type="button"
        >
          Speichern
        </button>
        <button
          @click="cancelEdit"
          class="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/5"
          type="button"
        >
          Abbrechen
        </button>
      </template>

      <!-- Löschen bleibt immer -->
      <button
        v-if="!isEditing"
        @click="handleDelete"
        class="flex items-center justify-center rounded-xl border border-red-400/30 bg-red-500/35 px-2 py-2 hover:bg-red-500/25"
        type="button"
        title="Löschen"
      >
        <img :src="loeschen_icon" class="h-5 w-5" alt="Löschen" />
      </button>
    </div>

    <!-- Titel + Status -->
    <div class="flex items-center gap-4">
      <template v-if="!isEditing">
        <h1 class="text-4xl font-extrabold tracking-tight text-white">
          {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}
        </h1>
      </template>

      <template v-else>
        <div class="grid grid-cols-2 gap-4 w-full max-w-2xl">
          <input
            v-model="form.vorname"
            class="rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-white outline-none"
            placeholder="Vorname"
          />
          <input
            v-model="form.nachname"
            class="rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-white outline-none"
            placeholder="Nachname"
          />
        </div>
      </template>

      <span
        class="h-3.5 w-3.5 rounded-full"
        :class="(isEditing ? form.springer : mitarbeiter.springer) ? 'bg-green-400' : 'bg-white/30'"
        :title="(isEditing ? form.springer : mitarbeiter.springer) ? 'Springer' : 'Kein Springer'"
      />
    </div>

    <!-- LINKS | LINIE | RECHTS -->
    <div class="mt-10 grid grid-cols-[0.92fr_1px_1.08fr] gap-12 text-lg text-white/90">
      <!-- LINKS: Kontakt -->
      <section class="space-y-6">
        <div class="space-y-1">
          
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Email</div>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Email 1</span>
              <template v-if="!isEditing">
                <span class="text-white">{{ mitarbeiter.email1 || "-" }}</span>
              </template>
              <template v-else>
                <input v-model="form.email1" class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none" />
              </template>
            </div>

            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Email 2</span>
              <template v-if="!isEditing">
                <span class="text-white">{{ mitarbeiter.email2 || "-" }}</span>
              </template>
              <template v-else>
                <input v-model="form.email2" class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none" />
              </template>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Telefon</div>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Telefon 1</span>
              <template v-if="!isEditing">
                <span class="text-white">{{ mitarbeiter.telefon1 || "-" }}</span>
              </template>
              <template v-else>
                <input v-model="form.telefon1" class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none" />
              </template>
            </div>

            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Telefon 2</span>
              <template v-if="!isEditing">
                <span class="text-white">{{ mitarbeiter.telefon2 || "-" }}</span>
              </template>
              <template v-else>
                <input v-model="form.telefon2" class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none" />
              </template>
            </div>
          </div>
        </div>
      </section>

      <!-- VERTIKALE LINIE -->
      <div class="bg-white/15"></div>

      <!-- RECHTS: Adresse + Arbeit + Filialen -->
      <section class="space-y-6">
        <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Adresse</div>
          <div class="space-y-2">
            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Straße</span>
              <template v-if="!isEditing">
                <span class="text-white text-right">{{ mitarbeiter.strasse || "-" }}</span>
              </template>
              <template v-else>
                <input v-model="form.strasse" class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right" />
              </template>
            </div>

            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Postleitzahl</span>
              <template v-if="!isEditing">
                <span class="text-white text-right">{{ mitarbeiter.postleitzahl || "-" }}</span>
              </template>
              <template v-else>
                <input v-model="form.postleitzahl" class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right" />
              </template>
            </div>

            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Ort</span>
              <template v-if="!isEditing">
                <span class="text-white text-right">{{ mitarbeiter.ort || "-" }}</span>
              </template>
              <template v-else>
                <input v-model="form.ort" class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right" />
              </template>
            </div>

            <div class="flex justify-between gap-4">
              <span class="font-semibold text-white">Land</span>
              <template v-if="!isEditing">
                <span class="text-white text-right">{{ mitarbeiter.land || "-" }}</span>
              </template>
              <template v-else>
                <input v-model="form.land" class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right" />
              </template>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6">
          <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
            <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Arbeit</div>
            <div class="space-y-2">
              <div class="flex justify-between gap-4">
                <span class="font-semibold text-white">Stunden</span>
                <template v-if="!isEditing">
                  <span class="text-white text-right">{{ mitarbeiter.arbeitsstunden ?? "-" }}</span>
                </template>
                <template v-else>
                  <input type="number" v-model="form.arbeitsstunden" class="w-24 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right" />
                </template>
              </div>

              <div class="flex justify-between gap-4">
                <span class="font-semibold text-white">Springer</span>
                <template v-if="!isEditing">
                  <span class="text-white text-right">
                    {{ mitarbeiter.springer === true ? "Ja" : mitarbeiter.springer === false ? "Nein" : "Nicht bekannt" }}
                  </span>
                </template>
                <template v-else>
                  <label class="flex items-center gap-2 text-white/90">
                    <input type="checkbox" v-model="form.springer" />
                    Ja
                  </label>
                </template>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
            <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Filialen</div>
            <div class="space-y-3">
              <div class="flex justify-between gap-4">
                <span class="font-semibold text-white">Hauptfiliale</span>
                <template v-if="!isEditing">
                  <span class="text-white text-right">{{ hauptfilialeName }}</span>
                </template>
              </div>

              <template v-if="isEditing">
                <Multiselect
                  v-model="form.hauptfiliale"
                  :options="filialen"
                  label="name"
                  track-by="id"
                  placeholder="Hauptfiliale wählen"
                  :clearable="false"
                />
              </template>

              <div class="flex justify-between gap-4">
                <span class="font-semibold text-white">Nebenfilialen</span>
                <template v-if="!isEditing">
                  <span class="text-white text-right">{{ nebenfilialenNamen }}</span>
                </template>
              </div>

              <template v-if="isEditing">
                <Multiselect
                  v-model="form.nebenfilialen"
                  :options="nebenfilialenOptionen"
                  label="name"
                  track-by="id"
                  placeholder="Nebenfilialen wählen"
                  :multiple="true"
                  :close-on-select="false"
                />
              </template>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-white/10 bg-black/25 p-5">
          <div class="mb-3 text-sm font-semibold uppercase tracking-wide text-white/70">Anmerkungen</div>

          <template v-if="!isEditing">
            <textarea
              class="h-28 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-white/90 outline-none"
              :value="mitarbeiter.anmerkungen || ''"
              readonly
            />
          </template>

          <template v-else>
            <textarea
              class="h-28 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-white/90 outline-none"
              v-model="form.anmerkungen"
            />
          </template>
        </div>
      </section>
    </div>
  </article>
</template>
