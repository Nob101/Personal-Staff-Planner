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
  emit('edit')
}

function handleDelete() {
  emit('delete')
}
</script>

<template>
  <div class="mitarbeiter-card">
    <h2>{{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}</h2>
    <p>Geburtsdatum: {{ mitarbeiter.geburtsdatum }}</p>
    <p>Email: {{ mitarbeiter.email }}</p>
    <p>Telefon 1: {{ mitarbeiter.telefon1 }}</p>
    <p>Telefon 2: {{ mitarbeiter.telefon2 }}</p>
    <p>Adresse: {{ mitarbeiter.strasse }}, {{ mitarbeiter.postleitzahl }} {{ mitarbeiter.ort }}</p>
    <p>Hauptfiliale: {{ mitarbeiter.hauptfilialeId }}</p>
    <p>Nebenfilialen: {{ mitarbeiter.nebenfilialenIds.join(', ') }}</p>
    <p>Springer: {{ mitarbeiter.springer ? 'Ja' : 'Nein' }}</p>
    <p>Counter: {{ mitarbeiter.counter }}</p>
    <p>Anmerkungen: <textarea rows="4" :value="mitarbeiter.anmerkungen ?? ''" readonly></textarea></p>
    
    <button @click="handleEdit">Bearbeiten</button>
    <button @click="handleDelete">Löschen</button>
  </div>
</template>

<style scoped>
.mitarbeiter-card {
    border: 1px solid #ccc;
    padding: 16px;
    border-radius: 8px;
}
</style>