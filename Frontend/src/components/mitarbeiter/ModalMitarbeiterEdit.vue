<!-- ModalMitarbeiterEdit.vue-->

<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import speichern_icon from '@/assets/icons/speichern_icon_solid.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon_solid.svg'
import { ref, defineProps, watch, computed } from 'vue'


// Emits, um das Modal zu schließen / bearbeiten
const emit = defineEmits(['close', 'mitarbeiterEdit'])

// Reaktive Formularfelder, initialisiert mit den Werten des übergebenen Mitarbeiters
// Props: Mitarbeiter-Objekt
const props = defineProps({
  mitarbeiter: { type: Object, required: true },
  filialen: { type: Array, required: true },
  show: { type: Boolean, required: true } // vom Parent gesteuert
})

// Lokale Kopie der Daten (nicht direkt vom Props!)
//wird verwendet damit die tatsächlichen Mitarbeiterdaten erst beim speichern überschrieben werden!
const vorname = ref('')
const nachname = ref('')
const email1 = ref('')
const email2 = ref('')
const telefon1 = ref('')
const telefon2 = ref('')
const strasse = ref('')
const ort = ref('')
const postleitzahl = ref('')
const land = ref('')
const arbeitsstunden = ref('')
const springer = ref(undefined)
const hauptfiliale = ref(null)
const nebenfilialen = ref([])
const anmerkungen = ref('')


// Watch füllt die lokalen Refs mit den Prop-Daten
// Vue beobachtet das mitarbeiter-Prop reaktiv mit () => props.mitarbeiter
// (editedMitarbeiter) ist der neue Wert des Props, wird getriggert wenn sich das Prop ändert
// immediate: true sorgt dafür, dass die Watch-Funktion sofort beim Komponenten-Mount ausgelöst wird
watch(
  () => props.mitarbeiter,
  (edited) => {
    if (edited) {
      vorname.value = edited.vorname || ''
      nachname.value = edited.nachname || ''
      email1.value = edited.email1 || ''
      email2.value = edited.email2 || ''
      telefon1.value = edited.telefon1 || ''
      telefon2.value = edited.telefon2 || ''
      strasse.value = edited.strasse || ''
      ort.value = edited.ort || ''
      postleitzahl.value = edited.postleitzahl || ''
      land.value = edited.land || ''
      arbeitsstunden.value = edited.arbeitsstunden ?? ''
      springer.value = 
        edited.springer === 'Ja' ? true :
        edited.springer === 'Nein' ? false : undefined
      hauptfiliale.value = props.filialen.find(f => f.id === edited.hauptfiliale) || null
      nebenfilialen.value = edited.nebenfilialen?.length ? props.filialen.filter(f => edited.nebenfilialen.includes(f.id)): []
      anmerkungen.value = edited.anmerkungen || ''
    }
  },
  { immediate: true }
)

// Nebenfilialen automatisch anpassen, Hauptfiliale aus Filter entfernen
watch(hauptfiliale, (newVal) => {
  nebenfilialen.value = nebenfilialen.value.filter(
    f => f.id !== newVal?.id
  )
})

// Computed für Nebenfilialen-Optionen (Hauptfiliale auslassen) -> filtert diese raus damit die Hauptfiliale nicht auch als Nebenfiliale genommen werden kann
const nebenfilialenOptionen = computed(() =>
  props.filialen.filter(f => f.id !== hauptfiliale.value?.id)
)
// Submit-Funktion
function handleSubmit() {
  emit('mitarbeiterEdit', {
    id: props.mitarbeiter.id,
    vorname: vorname.value,
    nachname: nachname.value,
    email1: email1.value || '',
    email2: email2.value || '',
    telefon1: telefon1.value || '',
    telefon2: telefon2.value || '',
    strasse: strasse.value || '',
    ort: ort.value || '',
    postleitzahl: postleitzahl.value || '',
    land: land.value || '',
    arbeitsstunden: arbeitsstunden.value ? Number(arbeitsstunden.value) : null,
    springer: springer.value === true ? 'Ja' : springer.value === false ? 'Nein' : 'Nicht bekannt',
    hauptfiliale: hauptfiliale.value?.id || null,
    nebenfilialen: nebenfilialen.value.length ? nebenfilialen.value.map(f => f.id) : null,
    anmerkungen: anmerkungen.value || ''
  })
  emit('close')
}

</script>

<template>
  <BaseModal :show="show" @close="emit('close')" width="980px">
    <!-- Header Slot -->
    <template #header>
      
      </template>

    <!-- Body Slot -->
    <template #body>
      <!-- Card Look (EINE Box) -->
      <div
        class="relative font-sans rounded-3xl border border-white/10 bg-linear-to-b from-zinc-800/70 to-zinc-900/80 p-8 pt-11 shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
      >
      <div class="mb-6">
        <div class="font-sans">
          <h2 class="text-2xl font-extrabold tracking-tight text-white">
            {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }} bearbeiten:
          </h2>
        </div>
      </div>
      <div class="mb-6"></div>
        <!-- ACTIONS oben rechts (in derselben Box) -->
        <div class="absolute right-8 top-8 flex gap-3">
          <!-- Speichern -->
          <button
            type="button"
            @click="handleSubmit"
            class="flex items-center justify-center rounded-xl
                  border border-green-400/30 bg-green-500/35
                  px-3 py-3 hover:bg-green-500/25 transition"
            title="Speichern"
          >
            <img :src="speichern_icon" class="h-5 w-5" alt="Speichern" />
          </button>

          <!-- Abbrechen -->
          <button
            type="button"
            @click="emit('close')"
            class="flex items-center justify-center rounded-xl
                  border border-red-400/30 bg-red-500/35
                  px-3 py-3 hover:bg-red-500/25 transition"
            title="Abbrechen"
          >
            <img :src="abbrechen_icon" class="h-5 w-5" alt="Abbrechen" />
          </button>
        </div>

        

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Vorname/Nachname -->
          <div class="grid grid-cols-2 gap-6">
            <!-- linke Spalte -->
            <input
              v-model="vorname"
              class="w-104 rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none"
              placeholder="Vorname"
            />

            <!-- rechte Spalte -->
             <div class="flex justify-end">
            <input
              v-model="nachname"
              class="w-104 rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none"
              placeholder="Nachname"
            />
          </div>
        </div>

          <!-- LINKS | LINIE | RECHTS -->
          <div class="mt-2 grid grid-cols-[1fr_1px_1fr] gap-10 text-base text-white/90">
            <!-- LINKS -->
            <section class="space-y-6">
              <!-- Email -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Email
                </legend>
                <div class="space-y-2">
                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Email 1</span>
                    <input
                      v-model="email1"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Email 2</span>
                    <input
                      v-model="email2"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- Telefon -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Telefon
                </legend>
                <div class="space-y-2">
                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Telefon 1</span>
                    <input
                      v-model="telefon1"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Telefon 2</span>
                    <input
                      v-model="telefon2"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- Filialen -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Filialen
                </legend>
                <div class="space-y-4">
                  <div>
                    <div class="mb-1 font-semibold text-white">Hauptfiliale</div>
                    <Multiselect
                      v-model="hauptfiliale"
                      :options="filialen"
                      label="filialname"
                      track-by="id"
                      placeholder="Hauptfiliale wählen"
                      :clearable="false"
                    />
                  </div>

                  <div>
                    <div class="mb-1 font-semibold text-white">Nebenfilialen</div>
                    <Multiselect
                      v-model="nebenfilialen"
                      :options="nebenfilialenOptionen"
                      label="filialname"
                      track-by="id"
                      placeholder="Nebenfilialen wählen"
                      :multiple="true"
                      :close-on-select="false"
                    />
                  </div>
                </div>
              </fieldset>
            </section>

            <!-- Linie (mittig) -->
            <div class="bg-white/15"></div>

            <!-- RECHTS -->
            <section class="space-y-6">
              <!-- Adresse -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Adresse
                </legend>
                <div class="space-y-2">
                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Straße</span>
                    <input
                      v-model="strasse"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Postleitzahl</span>
                    <input
                      v-model="postleitzahl"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Ort</span>
                    <input
                      v-model="ort"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Land</span>
                    <input
                      v-model="land"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- Arbeit -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Arbeit
                </legend>
                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Stunden</span>
                    <input
                      type="number"
                      v-model="arbeitsstunden"
                      class="w-24 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>

                  <div class="flex justify-between gap-4 items-center">
                    <span class="font-semibold text-white">Springer</span>
                    <div class="flex gap-4 text-white/90">
                      <label class="flex items-center gap-2">
                        <input type="radio" v-model="springer" :value="true" />
                        Ja
                      </label>
                      <label class="flex items-center gap-2">
                        <input type="radio" v-model="springer" :value="false" />
                        Nein
                      </label>
                    </div>
                  </div>
                </div>
              </fieldset>

              <!-- Anmerkungen -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Anmerkungen
                </legend>
                <textarea
                  v-model="anmerkungen"
                  class="h-28 w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-white/90 outline-none"
                />
              </fieldset>
            </section>
          </div>
        </form>
      </div>
    </template>
  </BaseModal>
</template>