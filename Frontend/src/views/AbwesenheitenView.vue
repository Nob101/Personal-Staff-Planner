<script setup>
import { computed, onMounted, ref } from "vue";
import { getMitarbeiter } from "@/services/mitarbeiterService";
import { useAbwesenheiten } from "@/composables/useAbwesenheiten";

import AbwesenheitForm from "@/components/abwesenheiten/AbwesenheitForm.vue";
import AbwesenheitListe from "@/components/abwesenheiten/AbwesenheitListe.vue";
import BestaetigungsModal from "@/components/global/BestätigungsModal.vue";

import "@/styles/abwesenheiten.css";

const mitarbeiter = ref([]);
const suche = ref("");
const dropdownOffen = ref(false);
const ausgewaehlterMitarbeiter = ref(null);

const von = ref("");
const bis = ref("");
const anmerkung = ref("");

const filterJahr = ref(new Date().getFullYear());
const filterMonat = ref(new Date().getMonth() + 1);
const filterFiliale = ref("alle");

const showDeleteModal = ref(false);
const abwesenheitZumLoeschen = ref(null);

const {
  abwesenheiten,
  successMessage,
  errorMessage,
  ladeAbwesenheiten,
  speichereAbwesenheit,
  entferneAbwesenheit,
} = useAbwesenheiten();

onMounted(async () => {
  const response = await getMitarbeiter();
  mitarbeiter.value = response.data;
  await ladeAktuelleAbwesenheiten();
});

async function ladeAktuelleAbwesenheiten() {
  await ladeAbwesenheiten(filterJahr.value, filterMonat.value);
}

const gefilterteMitarbeiter = computed(() => {
  const q = suche.value.trim().toLowerCase();
  if (!q || !dropdownOffen.value) return [];

  return mitarbeiter.value.filter((m) =>
    `${m.vorname} ${m.nachname} ${m.hauptfiliale?.name ?? ""}`
      .toLowerCase()
      .includes(q),
  );
});

const gefilterteAbwesenheiten = computed(() =>
  filterFiliale.value === "alle"
    ? abwesenheiten.value
    : abwesenheiten.value.filter(
        (a) => a.filiale_name === filterFiliale.value,
      ),
);

const filialenAusAbwesenheiten = computed(() => [
  ...new Set(abwesenheiten.value.map((a) => a.filiale_name).filter(Boolean)),
]);

const abwesenheitenNachFiliale = computed(() =>
  gefilterteAbwesenheiten.value.reduce((gruppen, a) => {
    const filiale = a.filiale_name || "Ohne Filiale";
    gruppen[filiale] ??= [];
    gruppen[filiale].push(a);
    return gruppen;
  }, {}),
);

function waehleMitarbeiter(m) {
  ausgewaehlterMitarbeiter.value = m;
  suche.value = `${m.vorname} ${m.nachname}`;
  dropdownOffen.value = false;
}

function zeigeFehler(text) {
  errorMessage.value = text;

  setTimeout(() => {
    errorMessage.value = "";
  }, 3000);
}

function resetForm() {
  ausgewaehlterMitarbeiter.value = null;
  suche.value = "";
  von.value = "";
  bis.value = "";
  anmerkung.value = "";
  dropdownOffen.value = false;
}

async function speichern() {
  if (!ausgewaehlterMitarbeiter.value) {
    return zeigeFehler("Bitte einen Mitarbeiter auswählen");
  }

  if (!von.value || !bis.value) {
    return zeigeFehler("Bitte Von- und Bis-Datum angeben");
  }

  if (new Date(bis.value) < new Date(von.value)) {
    return zeigeFehler("Bis-Datum darf nicht vor dem Von-Datum liegen");
  }

  const success = await speichereAbwesenheit(
    {
      mnr: ausgewaehlterMitarbeiter.value.mnr,
      von: von.value,
      bis: bis.value,
      typ: "U",
      anmerkung: anmerkung.value,
    },
    filterJahr.value,
    filterMonat.value,
  );

  if (success) resetForm();
}

function loescheAbwesenheit(id) {
  abwesenheitZumLoeschen.value = id;
  showDeleteModal.value = true;
}

async function bestaetigeLoeschen() {
  await entferneAbwesenheit(
    abwesenheitZumLoeschen.value,
    filterJahr.value,
    filterMonat.value,
  );

  showDeleteModal.value = false;
  abwesenheitZumLoeschen.value = null;
}
</script>

<template>
  <main class="abwesenheiten-page">
    <div v-if="successMessage" class="success-message">
      {{ successMessage }}
    </div>

    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <h1>Abwesenheiten</h1>

    <AbwesenheitForm
      v-model:suche="suche"
      v-model:von="von"
      v-model:bis="bis"
      v-model:anmerkung="anmerkung"
      :dropdownOffen="dropdownOffen"
      :gefilterteMitarbeiter="gefilterteMitarbeiter"
      @openDropdown="dropdownOffen = true"
      @waehleMitarbeiter="waehleMitarbeiter"
      @speichern="speichern"
    />

    <AbwesenheitListe
      v-model:filterJahr="filterJahr"
      v-model:filterMonat="filterMonat"
      v-model:filterFiliale="filterFiliale"
      :filialenAusAbwesenheiten="filialenAusAbwesenheiten"
      :abwesenheitenNachFiliale="abwesenheitenNachFiliale"
      @ladeAbwesenheiten="ladeAktuelleAbwesenheiten"
      @loescheAbwesenheit="loescheAbwesenheit"
    />

    <BestaetigungsModal
      :show="showDeleteModal"
      message="Möchtest du diese Abwesenheit wirklich löschen?"
      @confirm="bestaetigeLoeschen"
      @close="showDeleteModal = false"
    />
  </main>
</template>