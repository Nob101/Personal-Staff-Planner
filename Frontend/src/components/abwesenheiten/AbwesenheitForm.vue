<script setup>
defineProps({
  suche: String,
  dropdownOffen: Boolean,
  gefilterteMitarbeiter: Array,
  von: String,
  bis: String,
  anmerkung: String,
});

defineEmits([
  "update:suche",
  "update:von",
  "update:bis",
  "update:anmerkung",
  "waehleMitarbeiter",
  "speichern",
  "openDropdown",
]);
</script>

<template>
  <section class="abwesenheiten-card abwesenheiten-form-card">
    <div class="form-row">
      <label>
        Mitarbeiter

        <div class="autocomplete">
          <input
            :value="suche"
            type="text"
            placeholder="Mitarbeiter suchen..."
            @focus="$emit('openDropdown')"
            @input="$emit('update:suche', $event.target.value)"
          />

          <div
            v-if="dropdownOffen && gefilterteMitarbeiter.length"
            class="autocomplete-list"
          >
            <button
              v-for="m in gefilterteMitarbeiter"
              :key="m.mnr"
              type="button"
              @click="$emit('waehleMitarbeiter', m)"
            >
              {{ m.vorname }} {{ m.nachname }}

              <span v-if="m.hauptfiliale?.name">
                ({{ m.hauptfiliale.name }})
              </span>
            </button>
          </div>
        </div>
      </label>

      <label>
        Typ
        <select disabled>
          <option value="U">Urlaub</option>
        </select>
      </label>

      <label>
        Von
        <input
          :value="von"
          type="date"
          @input="$emit('update:von', $event.target.value)"
        />
      </label>

      <label>
        Bis
        <input
          :value="bis"
          type="date"
          @input="$emit('update:bis', $event.target.value)"
        />
      </label>

      <label class="anmerkung-field">
        Anmerkung
        <input
          :value="anmerkung"
          type="text"
          placeholder="optional"
          @input="$emit('update:anmerkung', $event.target.value)"
        />
      </label>

      <button @click="$emit('speichern')">
        Speichern
      </button>
    </div>
  </section>
</template>
