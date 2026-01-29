<!-- MitarbeiterCard.vue -->

<script setup>
// Funktionalitäten und Komponenten importieren
import { defineProps, computed } from 'vue'


const props = defineProps({
  mitarbeiter: {
    type: Object,
    required: true
  },
  filialen: { type: Array, required: true }
})

// Events: Bearbeiten und Löschen Klicks an Parent (MitarbeiterList.vue) weitergeben, diese gibt es dann an MitarbeiterView.vue weiter.
const emit = defineEmits(['edit', 'delete'])

// Helper für Hauptfiliale-Name, damit der Name anstatt der ID angezeigt wird
const hauptfilialeName = computed(() => {
  const f = props.filialen.find(f => f.id === props.mitarbeiter.hauptfiliale)
  return f ? f.filialname : '-'
})

// Helper für Nebenfilialen-Namen, damit der Name anstatt der ID angezeigt wird
////map geht jedes Element des Arrays durch und gibt für jede ID den Filialnamen zurück, so dass am Ende ein neues Array mit Namen entsteht
const nebenfilialenNamen = computed(() => {
  if (!props.mitarbeiter.nebenfilialen?.length) return '-'
  return props.mitarbeiter.nebenfilialen
    .map(id => props.filialen.find(f => f.id === id)?.filialname || id)
    .join(', ')
})


function handleEdit() {
  emit('edit', props.mitarbeiter)
}

function handleDelete() {
  emit('delete', props.mitarbeiter)
}
</script>

<template>
  <div class="mitarbeiter-card">

    <!-- Edit/Delete Buttons oben rechts, Icons fehlen noch -->
    <div class="card-actions">
      <button @click="handleEdit" class="bg-blue-300">Bearbeiten</button>
      <button @click="handleDelete" class="bg-red-300">Löschen</button>
    </div>

    <!-- Mitarbeiter-Card Titel -->
    <h1 class="text-3xl font-semibold">{{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }}</h1>

    <!-- Inhalt Columns -->
    <div class="mitarbeiter-card-columns">

      <!-- Column 1: Name, Email, Telefon -->
      <div class="column">       
        <!-- Email Box -->
        <fieldset class="box">
          <legend>Email</legend>
          <p data-label="Email 1:">{{ mitarbeiter.email1 || '-' }}</p>
          <p data-label="Email 2:">{{ mitarbeiter.email2 || '-' }}</p>
        </fieldset>

        <!-- Telefon Box -->
        <fieldset class="box">
          <legend>Telefon</legend>
          <p data-label="Telefon 1:">{{ mitarbeiter.telefon1 || '-' }}</p>
          <p data-label="Telefon 2:">{{ mitarbeiter.telefon2 || '-' }}</p>
        </fieldset>          
      </div>
            
      <!-- Column 2: Adresse (Straße, Postleitzahl, Ort, Land)-->
      <div class="column">
        <!-- Adresse Box -->
          <fieldset class="box">
            <legend>Adresse</legend>
            <p data-label="Straße:">{{ mitarbeiter.strasse || '-' }}</p>
            <p data-label="Postleitzahl:">{{ mitarbeiter.postleitzahl || '-' }}</p>
            <p data-label="Ort:">{{ mitarbeiter.ort || '-' }}</p>
            <p data-label="Land:">{{ mitarbeiter.land || '-' }}</p>
          </fieldset>
      </div>
      <!-- Column 3: Arbeitsstunden, Springer, Filialen-->
      <div class="column">
        <fieldset class="box">
          <legend>Arbeit</legend>
          <p data-label="Arbeitsstunden:">{{ mitarbeiter.arbeitsstunden ?? '-' }}</p>
          <p data-label="Springer:">{{ mitarbeiter.springer ? 'Ja' : 'Nein' }}</p>
        </fieldset>
        <!-- Filialen Box -->
        <fieldset class="box">
          <legend>Filialen</legend>
          <p data-label="Hauptfiliale:">{{ hauptfilialeName }}</p>
          <p data-label="Nebenfiliale(n):">{{ nebenfilialenNamen }}</p>
        </fieldset>
      </div>
    </div>
    <!-- Anmerkungen -->
      <div class="anmerkungen">
        <h3 class="text-2xl font-semibold">Anmerkungen</h3>
        <textarea rows="4" :value="mitarbeiter.anmerkungen || ''" readonly></textarea>
      </div>
  </div>
</template>

<style scoped>
.mitarbeiter-card {
  position: relative;
  text-align: center;
  border: 1px solid #ccc;
  padding: 24px;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* Buttons oben rechts */
.card-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
}

.card-title {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 24px;
}

/* Drei gleich große Columns */
.mitarbeiter-card-columns {
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

.box h3 {
  margin-top: 0;
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