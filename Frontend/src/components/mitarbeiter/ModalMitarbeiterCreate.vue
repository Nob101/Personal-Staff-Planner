<!-- ModalMitarbeiterCreate.vue -->

<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import { ref, watch, defineProps, computed } from 'vue'
import speichern_icon from '@/assets/icons/speichern_icon_solid.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon_solid.svg'


// Emits
const emit = defineEmits(['close', 'mitarbeiterCreate'])

// Props
const props = defineProps({
  mitarbeiter: { type: Object, required: true },
  filialen: { type: Array, required: true },
  show: { type: Boolean, required: true }                   // wird von Parent gesteuert
})

// Reaktive Formularfelder
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

function resetForm() {
  vorname.value = ''
  nachname.value = ''
  email1.value = ''
  email2.value = ''
  telefon1.value = ''
  telefon2.value = ''
  strasse.value = ''
  ort.value = ''
  postleitzahl.value = ''
  land.value = ''
  arbeitsstunden.value = ''
  springer.value = undefined
  hauptfiliale.value = null
  nebenfilialen.value = []
  anmerkungen.value = ''
}

watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) resetForm()
  }
)

// Nebenfilialen automatisch anpassen
watch(hauptfiliale, (newVal) => {
  if (!newVal) return

  nebenfilialen.value = nebenfilialen.value.filter(
    f => f.id !== newVal.id
  )
})

// Filter für Nebenfilialen
const nebenfilialenOptionen = computed(() =>
  props.filialen.filter(
    f => !hauptfiliale.value || f.id !== hauptfiliale.value.id
  )
)

// Submit
function handleSubmit() {
  emit('mitarbeiterCreate', {
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
    hauptfiliale: hauptfiliale.value || null,
    nebenfilialen: nebenfilialen.value.length ? nebenfilialen.value : null,
    anmerkungen: anmerkungen.value || ''
  })
  resetForm()
  emit('close')
}
</script>

<template>
  <BaseModal :show="show" @close="emit('close')" width="500px">
    <!-- Header Slot -->
    <template #header>
      <div class="font-sans">

      </div>
    </template>

    <!-- Body Slot -->
    <template #body>
      <!--Buttons-->
      <div
        class="relative font-sans rounded-3xl border border-white/10 bg-linear-to-b from-zinc-800/70 to-zinc-900/80 p-8 pt-11 shadow-[0_18px_45px_rgba(0,0,0,0.55)]"
      >
      <div class="mb-6">
        <h2 class="text-2xl font-extrabold tracking-tight text-white">Neuen Mitarbeiter anlegen</h2>
      </div>
        <!-- ACTIONS oben rechts -->
        <div class="absolute right-8 top-8 flex gap-3">
          <button
            type="button"
            @click="handleSubmit"
            class="flex items-center justify-center rounded-xl
                   border border-green-400/30 bg-green-500/35
                   px-3 py-3 hover:bg-green-500 transition"
            title="Erstellen"
          >
            <img :src="speichern_icon" class="h-5 w-5" alt="Erstellen" />
          </button>

          <button
            type="button"
            @click="resetForm(); emit('close')"
            class="flex items-center justify-center rounded-xl
                   border border-red-400/30 bg-red-500/35
                   px-3 py-3 hover:bg-red-500 transition"
            title="Abbrechen"
          >
            <img :src="abbrechen_icon" class="h-5 w-5" alt="Abbrechen" />
          </button>
        </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Vorname / Nachname -->
        <div class="grid grid-cols-2 gap-6">
          <!-- linke Spalte -->
          <input
            v-model="vorname"
            type="text"
            placeholder="Vorname"
            class="w-104 rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none"
          />

          <!-- rechte Spalte -->
          <div class="flex justify-end">
            <input
              v-model="nachname"
              type="text"
              placeholder="Nachname"
              class="w-104 rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-white outline-none"
            />
          </div>
        </div>

        <!-- LINKS | LINIE | RECHTS (wie Edit) -->
          <div class="mt-2 grid grid-cols-[1fr_1px_1fr] gap-10 text-base text-white/90">
            <!-- LINKS -->
            <section class="space-y-6">
              <!-- Email -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Email
                </legend>

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Email 1</label>
                    <input
                      type="email"
                      v-model="email1"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none text-right"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Email 2</label>
                    <input
                      type="email"
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

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Telefon 1:</label>
                    <input
                      type="tel"
                      v-model="telefon1"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Telefon 2:</label>
                    <input
                      type="tel"
                      v-model="telefon2"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- Hauptfiliale / Nebenfilialen -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Filialen
                </legend>

                <div class="space-y-6">
                  <!-- Hauptfiliale -->
                  <div class="space-y-1">
                    <label class="text-sm font-semibold text-white/80">
                      Hauptfiliale
                    </label>
                    <Multiselect
                      v-model="hauptfiliale"
                      :options="props.filialen"
                      label="filialname"
                      track-by="id"
                      placeholder="Hauptfiliale wählen"
                      :clearable="false"
                    />
                  </div>

                  <!-- Nebenfilialen -->
                  <div class="space-y-1">
                    <label class="text-sm font-semibold text-white/80">
                      Nebenfilialen
                    </label>
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

            <!-- Linie -->
            <div class="bg-white/15"></div>

            <!-- RECHTS -->
            <section class="space-y-6">
              <!-- Adresse -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Adresse
                </legend>

                <div class="space-y-3">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Straße:</label>
                    <input
                      type="text"
                      v-model="strasse"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Ort:</label>
                    <input
                      type="text"
                      v-model="ort"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Postleitzahl:</label>
                    <input
                      type="text"
                      v-model="postleitzahl"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Land:</label>
                    <input
                      type="text"
                      v-model="land"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>
                </div>
              </fieldset>

              <!-- Arbeitsstunden / Springer -->
              <fieldset class="rounded-2xl border border-white/10 bg-black/25 p-5">
                <legend class="mb-3 text-xl font-semibold uppercase tracking-wide text-white/70">
                  Arbeit
                </legend>

                <div class="space-y-3 items-start">
                  <div class="flex justify-between gap-4 items-center">
                    <label class="text-sm font-semibold text-white/80">Arbeitsstunden:</label>
                    <input
                      type="number"
                      v-model="arbeitsstunden"
                      class="w-64 rounded-lg border border-white/10 bg-black/25 px-3 py-1 text-white outline-none ring-1 ring-transparent focus:ring-white/20"
                    />
                  </div>

                  <div class="flex justify-between items-center gap-4">
                    <label class="text-sm font-semibold text-white/80">
                      Springer:
                    </label>

                    <div class="flex gap-5 text-white/90">
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

                <div class="mt-3">
                  <textarea
                    rows="4"
                    v-model="anmerkungen"
                    class="w-full resize-none rounded-xl border border-white/10 bg-black/30 p-3 text-white/90 outline-none ring-1 ring-transparent focus:ring-white/20"
                  />
                </div>
              </fieldset>
            </section>
          </div>
        </form>
      </div>
    </template>
  </BaseModal>
</template>