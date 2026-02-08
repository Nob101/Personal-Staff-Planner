<script setup>
import FilialenList from '@/components/filialen/FilialenList.vue'
import FilialenCard from '@/components/filialen/FilialenCard.vue'
import { ref } from 'vue'

// Dummy-Daten
const mitarbeiter = ref([
  {
    id: 1,
    vorname: 'Max',
    nachname: 'Mustermann',
    email1: 'max.mustermann@example.com',
    telefon1: '0123456789',
    strasse: 'Musterstraße 1',
    ort: 'Musterstadt',
    postleitzahl: '2345',
    land: 'Österreich',
    arbeitsstunden: 40,
    springer: true,
    hauptfiliale: 1,
    nebenfilialen: [2],
    anmerkungen: 'Sehr motiviert'
  },
  {
    id: 2,
    vorname: 'Lisa',
    nachname: 'Müller',
    email1: 'lisa.mueller@example.com',
    telefon1: '0987654321',
    strasse: 'Beispielweg 5',
    ort: 'Beispielstadt',
    postleitzahl: '4321',
    land: 'Österreich',
    arbeitsstunden: 30,
    springer: false,
    hauptfiliale: 2,
    nebenfilialen: [1, 3],
    anmerkungen: 'Teilzeit'
  }
])

const filialen = ref([
  { id: 1, name: 'Filiale A', color: '#' },
  { id: 2, name: 'Filiale B', color: '#' },
  { id: 3, name: 'Filiale C', color: '#' }
])

// wie selectedMitarbeiter
const selectedFiliale = ref(null)

function handleSelect(f) {
  selectedFiliale.value = f
}

function closeDetails() {
  selectedFiliale.value = null
}

// Platzhalter (später wie bei dir: Modal Edit/Delete etc.)
function handleEdit() {}
function handleDelete() {}
</script>

<template>

  <div class="mx-auto w-full max-w-[1400px] px-6 py-6 font-sans">
    <!-- DETAIL OVERLAY -->
    <div
      v-if="selectedFiliale"
      class="fixed inset-0 z-9999 flex items-start justify-center p-6
             bg-black/50 backdrop-blur-sm overflow-auto"
      @click.self="closeDetails"
    >
      <div class="w-full max-w-6xl" @click.stop>
        <button
          type="button"
          class="mb-4 font-sans text-white/80 hover:text-white
                 transition-colors focus:outline-none focus:ring-0"
          @click="closeDetails"
        >
          ❮ Zurück zur Übersicht
        </button>

        <FilialenCard
          :filialen="selectedFiliale"
          :mitarbeiter="mitarbeiter"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- Filialen Liste -->
    <FilialenList
      v-else
      :filialen="filialen"
      :mitarbeiter="mitarbeiter"
      @select="handleSelect"
      @edit="handleEdit"
      @delete="handleDelete"
      @create="showModalFilialeCreate = true"
    />
  </div>
</template>
