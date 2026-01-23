<!-- FilialenCard.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps, defineEmits, computed } from 'vue'

const props = defineProps({
  filialen: { type: Object, required: true},
  mitarbeiter: { type: Array, required: true }
})

// Events: Bearbeiten und Löschen Klicks an Parent (FilialenList.vue) weitergeben, diese gibt es dann an FilialenView.vue weiter.
const emit = defineEmits(['edit', 'delete'])

function handleEdit() {
  emit('edit', props.filialen)
}

function handleDelete() {
  emit('delete', props.filialen)
}

// Helper-Funktion: Hauptmitarbeiter dieser Filiale

const hauptMitarbeiter = computed(() =>
  props.mitarbeiter.filter(
    m => Number(m.hauptfiliale) === Number(props.filialen.id)
  )
)

// Helper-Funktion: Springer dieser Filiale
const springerMitarbeiter = computed(() =>
  props.mitarbeiter.filter(
    m => m.hauptfiliale === props.filialen.id && m.springer === true
  )
)
</script>

<template>
  <div class="filialen-card" :style="{ borderLeft: '6px solid ' + (filialen.color || '#ccc') }">

    <!-- Edit/Delete Buttons -->
    <div class="card-actions">
      <button @click="handleEdit" class="bg-blue-300">Bearbeiten</button>
      <button @click="handleDelete" class="bg-red-300">Löschen</button>
    </div>

    <!-- Titel -->
    <h1 class="text-3xl font-semibold">{{ filialen.name }}</h1>

    <!-- Columns -->
    <div class="filialen-card-columns">

      <!-- Column 1: Email, Telefon -->
      <div class="column">
        
        <fieldset class="box">
          <legend>Email</legend>
          <p data-label="Email 1:">{{ filialen.email1 || '-' }}</p>
          <p data-label="Email 2:">{{ filialen.email2 || '-' }}</p>
        </fieldset>

        <fieldset class="box">
          <legend>Telefon</legend>
          <p data-label="Telefon 1:">{{ filialen.telefon1 || '-' }}</p>
          <p data-label="Telefon 2:">{{ filialen.telefon2 || '-' }}</p>
        </fieldset>
      </div>

      <!-- Column 2: Adresse -->
      <div class="column">
        <fieldset class="box">
          <legend>Adresse</legend>
          <p data-label="Straße:">{{ filialen.strasse || '-' }}</p>
          <p data-label="Postleitzahl:">{{ filialen.postleitzahl || '-' }}</p>
          <p data-label="Ort:">{{ filialen.ort || '-' }}</p>
          <p data-label="Land:">{{ filialen.land || '-' }}</p>
        </fieldset>
      </div>

      <!-- Column 3: Farbe & Mitarbeiter -->
      <div class="column">
        <fieldset class="box">
          <legend>Filialenfarbe</legend>
          <div class="color-row">
            <span class="color-preview" :style="{ backgroundColor: filialen.color || '#ccc' }"></span>
            <span>{{ filialen.color || 'Keine Farbe gesetzt' }}</span>
          </div>
        </fieldset>

        <fieldset class="box">
          <legend>Mitarbeiter</legend>

          <p data-label="Hauptmitarbeiter:">
            <span v-if="hauptMitarbeiter.length">
              <template v-for="(m, index) in hauptMitarbeiter" :key="m.id">
                {{ m.vorname }} {{ m.nachname }}<span v-if="index < hauptMitarbeiter.length - 1">, </span>
              </template>
            </span>
            <span v-else>-</span>
          </p>

          <p data-label="Springer dieser Filiale:">
            <span v-if="springerMitarbeiter.length">
              <template v-for="(m, index) in springerMitarbeiter" :key="m.id">
                {{ m.vorname }} {{ m.nachname }}<span v-if="index < springerMitarbeiter.length - 1">, </span>
              </template>
            </span>
            <span v-else>-</span>
          </p>

        </fieldset>
      </div>

    </div>

    <!-- Anmerkungen -->
    <div class="anmerkungen">
      <h3 class="text-2xl font-semibold">Anmerkungen</h3>
      <textarea rows="4" :value="filialen.anmerkungen || ''" readonly></textarea>
    </div>

  </div>
</template>

<style scoped>
.filialen-card {
  position: relative;
  text-align: center;
  border: 1px solid #ccc;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.filialen-card-columns {
  display: grid;
  text-align: left;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}

.column p {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 8px;
  margin: 4px 0;
  align-items: center;
}

.column p::before {
  content: attr(data-label);
  font-weight: 500;
  text-align: left;
}

.box {
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f9f9f9;
  margin: 10px 0;
  padding: 10px 14px;
}

.box legend {
  padding: 0 6px;
  font-weight: 600;
}

.color-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-preview {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid #999;
}

.anmerkungen {
  margin-top: 20px;
  text-align: center;
}

.anmerkungen textarea {
  width: 80%;
  margin: 0 auto;
  display: block;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 8px;
  background-color: #fff;
}
</style>
