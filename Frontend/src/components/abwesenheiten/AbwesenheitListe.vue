<script setup>
defineProps({
  filterJahr: Number,
  filterMonat: Number,
  filterFiliale: String,
  filialenAusAbwesenheiten: Array,
  abwesenheitenNachFiliale: Object,
});

defineEmits([
  "update:filterJahr",
  "update:filterMonat",
  "update:filterFiliale",
  "ladeAbwesenheiten",
  "loescheAbwesenheit",
]);

function formatDatum(datum) {
  return new Date(datum).toLocaleDateString("de-AT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
</script>

<template>
  <section class="abwesenheiten-card">
    <h2>Geplante Abwesenheiten</h2>

    <div class="filter-row">
      <label>
        Jahr
        <select
          :value="filterJahr"
          @change="
            $emit('update:filterJahr', Number($event.target.value));
            $emit('ladeAbwesenheiten');
          "
        >
          <option :value="2026">2026</option>
          <option :value="2027">2027</option>
          <option :value="2028">2028</option>
        </select>
      </label>

      <label>
        Monat
        <select
          :value="filterMonat"
          @change="
            $emit('update:filterMonat', Number($event.target.value));
            $emit('ladeAbwesenheiten');
          "
        >
          <option :value="1">Jänner</option>
          <option :value="2">Februar</option>
          <option :value="3">März</option>
          <option :value="4">April</option>
          <option :value="5">Mai</option>
          <option :value="6">Juni</option>
          <option :value="7">Juli</option>
          <option :value="8">August</option>
          <option :value="9">September</option>
          <option :value="10">Oktober</option>
          <option :value="11">November</option>
          <option :value="12">Dezember</option>
        </select>
      </label>

      <label>
        Filiale
        <select
          :value="filterFiliale"
          @change="$emit('update:filterFiliale', $event.target.value)"
        >
          <option value="alle">Alle</option>

          <option
            v-for="filiale in filialenAusAbwesenheiten"
            :key="filiale"
            :value="filiale"
          >
            {{ filiale }}
          </option>
        </select>
      </label>
    </div>

    <div
      v-for="(eintraege, filiale) in abwesenheitenNachFiliale"
      :key="filiale"
      class="filialgruppe"
    >
      <h3>{{ filiale }}</h3>

      <table class="abwesenheiten-table">
        <thead>
          <tr>
            <th>Mitarbeiter</th>
            <th>Von</th>
            <th>Bis</th>
            <th>Typ</th>
            <th>Anmerkung</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="a in eintraege" :key="a.id">
            <td>{{ a.vorname }} {{ a.nachname }}</td>
            <td>{{ formatDatum(a.von) }}</td>
            <td>{{ formatDatum(a.bis) }}</td>
            <td>{{ a.typ }}</td>
            <td>{{ a.anmerkung || "-" }}</td>
            <td>
              <button
                class="delete-btn"
                @click="$emit('loescheAbwesenheit', a.id)"
              >
                Löschen
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

