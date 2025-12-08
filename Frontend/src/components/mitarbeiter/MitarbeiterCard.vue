<!-- MitarbeiterCard.vue -->
<!-- TODO:
        - Bearbeiten und Löschen Buttons mit klickbaren Icons ersetzen
        - Definieren was alles angezeigt werden soll und wie es am besten umgesetzt wird (z.B. Filialnamen statt IDs) + Backend Anbindung
        - CSS/Tailwind Formatierung definieren 
-->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps, defineEmits } from 'vue'

// Props: einzelner Mitarbeiter
const props = defineProps({
  mitarbeiter: {
    type: Object,
    required: true
  }
})

// Events: Bearbeiten und Löschen Klicks an Parent (MitarbeiterList.vue) weitergeben
const emit = defineEmits(['edit', 'delete'])

function handleEdit() {
  emit('edit', props.mitarbeiter)
}

function handleDelete() {
  emit('delete', props.mitarbeiter)
}
</script>

<template>
  <div class="mitarbeiter-card">
    <h2>{{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}</h2>

    <p>Geburtsdatum: {{ mitarbeiter.geburtsdatum ?? '-' }}</p>
    
    <p>Email 1: {{ mitarbeiter.email1 || '-' }}</p>
    <p>Email 2: {{ mitarbeiter.email2 || '-' }}</p>
    
    <p>Telefon 1: {{ mitarbeiter.telefon1 || '-' }}</p>
    <p>Telefon 2: {{ mitarbeiter.telefon2 || '-' }}</p>

    <!-- Adresse Box -->
    <div class="adresse-box">
      <h3>Adresse</h3>
      <p>Straße: {{ mitarbeiter.strasse || '-' }}</p>
      <p>Postleitzahl: {{ mitarbeiter.postleitzahl || '-' }}</p>
      <p>Ort: {{ mitarbeiter.ort || '-' }}</p>
      <p>Land: {{ mitarbeiter.land || '-' }}</p>
    </div>

    <p>Arbeitsstunden: {{ mitarbeiter.arbeitsstunden ?? '-' }}</p>
    <p>Springer: {{ mitarbeiter.springer || '-' }}</p>

    <p>Hauptfiliale: {{ mitarbeiter.hauptfiliale || '-' }}</p>
    <p>Nebenfilialen: 
      {{ mitarbeiter.nebenfilialen?.length ? mitarbeiter.nebenfilialen.join(', ') : '-' }}
    </p>

    <p>Anmerkungen: 
      <textarea rows="4" :value="mitarbeiter.anmerkungen || ''" readonly></textarea>
    </p>

    <div class="card-actions">
      <button @click="handleEdit">Bearbeiten</button>
      <button @click="handleDelete">Löschen</button>
    </div>
  </div>
</template>

<style scoped>
.mitarbeiter-card {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.adresse-box {
  border: 1px solid #eee;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: #f9f9f9;
  margin: 8px 0;
}

.adresse-box p {
  margin: 2px 0;
}

.card-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}
</style>