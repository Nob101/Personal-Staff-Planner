<script setup>
    import Navbar_main from '@/components/global/Navbar_main.vue'
    import FilialenList from '@/components/filialen/FilialenList.vue';

    //TestCode
    import ColorPicker from '@/components/global/ColorPicker.vue'
    import { ref } from 'vue'
    const color = ref('#3b82f6')

//Dummy-Daten für Testzwecke. MÜSSEN MIT BACKEND REQUESTS ersetzt werden.
const mitarbeiter = ref([
  {
    id: 1,
    vorname: 'Max',
    nachname: 'Mustermann',
    geburtsdatum: '1990-01-15',
    email1: 'max.mustermann@example.com',
    email2: 'max2@example.com',
    telefon1: '0123456789',
    telefon2: '0123456788',
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
    geburtsdatum: '1992-06-20',
    email1: 'lisa.mueller@example.com',
    email2: 'lisa2@example.com',
    telefon1: '0987654321',
    telefon2: '0987654322',
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
  { id: 1, name: 'Filiale A', color: '#ccc' },
  { id: 2, name: 'Filiale B', color: '#ccc' },
  { id: 3, name: 'Filiale C', color: '#ccc' }
])



</script>


<template>
    <Navbar />
    <FilialenList :filialen="filialen" :mitarbeiter="mitarbeiter" />
    <!-- <ColorPicker v-model="color" />-->
</template>