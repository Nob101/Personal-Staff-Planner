<!-- ModalMitarbeiterEdit.vue -->
<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import { ref, defineProps, watch, computed } from 'vue'
import speichern_icon from '@/assets/icons/speichern_icon.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon.svg'

// Emits, um das Modal zu schließen / bearbeiten
const emit = defineEmits(['close', 'mitarbeiterEdit'])

// Props: Mitarbeiter-Objekt
const props = defineProps({
  mitarbeiter: { type: Object, required: true },
  filialen: { type: Array, required: true },
  show: { type: Boolean, required: true } // vom Parent gesteuert
})

// Lokale Kopie der Daten (nicht direkt vom Props!)
// wird verwendet damit die tatsächlichen Mitarbeiterdaten erst beim speichern überschrieben werden!
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
const springer = ref(false)
const hauptfiliale = ref(null)
const nebenfilialen = ref([])
const anmerkungen = ref('')
const vornameFehler = ref(false)
const nachnameFehler = ref(false)
const hauptfilialeFehler = ref(false)

// Watch füllt die lokalen Refs mit den Prop-Daten
watch(
  () => props.mitarbeiter,
  (edited) => {
    if (!edited) return // Nichts machen, wenn kein Mitarbeiter ausgewählt

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
    springer.value = edited.springer ?? false
    hauptfiliale.value = edited.hauptfiliale
      ? props.filialen.find(f => f.fnr === edited.hauptfiliale.id)
      : null

    nebenfilialen.value = edited.nebenfilialen?.length
      ? props.filialen.filter(f => edited.nebenfilialen.some(nf => nf.id === f.fnr))
      : []

    anmerkungen.value = edited.anmerkungen || ''
  },
  { immediate: true }
)

// Nebenfilialen automatisch anpassen, Hauptfiliale aus Filter entfernen
watch(hauptfiliale, (newVal) => {
  nebenfilialen.value = nebenfilialen.value.filter(
    f => f.fnr !== newVal?.fnr
  )
})

// Filter für Nebenfilialen (Hauptfiliale ausschließen) und beim aussuchen alphabetisch sortiert anzeigen
const nebenfilialenOptionen = computed(() =>
  props.filialen
    .filter(f => !hauptfiliale.value || f.fnr !== hauptfiliale.value.fnr)
    .sort((a, b) => a.filialname.localeCompare(b.filialname))
)

// Ausgewählte Nebenfilialen alphabetisch anzeigen
const sortedNebenfilialen = computed({
  get: () => [...nebenfilialen.value].sort((a, b) => a.filialname.localeCompare(b.filialname)),
  set: val => nebenfilialen.value = val
})

// entfernt Reset Fehler Meldung bei Schließen des Modals
watch(() => props.show, (val) => {
  if (!val) {
    vornameFehler.value = false
    nachnameFehler.value = false
    hauptfilialeFehler.value = false
  }
})

// Submit-Funktion
function handleSubmit() {
  vornameFehler.value = false
  nachnameFehler.value = false
  hauptfilialeFehler.value = false

  // Validierung
  if (!vorname.value.trim()) vornameFehler.value = true
  if (!nachname.value.trim()) nachnameFehler.value = true
  if (!hauptfiliale.value) hauptfilialeFehler.value = true

  // Wenn ein Fehler existiert, abbrechen
  if (vornameFehler.value || nachnameFehler.value || hauptfilialeFehler.value) return

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
    springer: springer.value,
    hauptfiliale: hauptfiliale.value?.fnr || null,
    nebenfilialen: nebenfilialen.value.length ? nebenfilialen.value.map(f => f.fnr) : null,
    anmerkungen: anmerkungen.value || ''
  })

  emit('close')
}
</script>

<template>
  <BaseModal v-if="mitarbeiter" :show="show" @close="emit('close')" width="760px">
    <template #body>
      <!-- Card wie Mitarbeiter-Detail (gleich wie Create) -->
      <article
        class="ma-card ma-card-detail"
      >
        <!-- HEADER -->
        <div class="ma-card-head">
          <div class="ma-card-head-inner">
            <div class="min-w-0">
              <div class="ma-title">
                {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }} bearbeiten
              </div>
              <div class="ma-subtitle">
                Pflichtfelder: Vorname, Nachname, Hauptfiliale
              </div>
            </div>

            <!-- ACTIONS wie Create -->
            <div class="ma-action-wrap">
              <button
                type="button"
                @click="handleSubmit"
                class="ma-action-btn ma-action-btn--sm ma-action-btn--emerald"
                title="Speichern"
              >
                <img :src="speichern_icon" class="ma-action-icon" alt="Speichern" />
              </button>

              <button
                type="button"
                @click="emit('close')"
                class="ma-action-btn ma-action-btn--sm ma-action-btn--red"
                title="Abbrechen"
              >
                <img :src="abbrechen_icon" class="ma-action-icon" alt="Abbrechen" />
              </button>
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div class="px-4 pt-3 pb-4 rounded-b-3xl bg-linear-to-b from-zinc-400 to-zinc-600">
          <div class="ma-card-body-inner">
            <div class="ma-card-panel">
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <div class="grid grid-cols-[1fr_1px_1fr] gap-6 text-sm text-zinc-900">
                  <!-- LINKS -->
                  <section class="ma-form-section">
                    <!-- Name -->
                    <fieldset class="ma-fieldset">
                      <legend class="ma-legend">Name</legend>

                      <div class="ma-form-body">
                        <div class="ma-form-row">
                          <span class="ma-form-label">Vorname</span>
                          <input v-model="vorname" type="text" class="ma-form-input" />
                        </div>
                        <p v-if="vornameFehler" class="ma-form-error">Vorname ist erforderlich</p>

                        <div class="ma-form-row">
                          <span class="ma-form-label">Nachname</span>
                          <input v-model="nachname" type="text" class="ma-form-input" />
                        </div>
                        <p v-if="nachnameFehler" class="ma-form-error">Nachname ist erforderlich</p>
                      </div>
                    </fieldset>

                    <!-- Email -->
                    <fieldset class="ma-fieldset">
                      <legend class="ma-legend">Email</legend>

                      <div class="ma-form-body">
                        <div class="ma-form-row">
                          <span class="ma-form-label">Email 1</span>
                          <input type="email" v-model="email1" class="ma-form-input" />
                        </div>

                        <div class="ma-form-row">
                          <span class="ma-form-label">Email 2</span>
                          <input type="email" v-model="email2" class="ma-form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Telefon -->
                    <fieldset class="ma-fieldset">
                      <legend class="ma-legend">Telefon</legend>

                      <div class="ma-form-body">
                        <div class="ma-form-row">
                          <span class="ma-form-label">Telefon 1</span>
                          <input type="tel" v-model="telefon1" class="ma-form-input" />
                        </div>

                        <div class="ma-form-row">
                          <span class="ma-form-label">Telefon 2</span>
                          <input type="tel" v-model="telefon2" class="ma-form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Filialen -->
                    <fieldset class="ma-fieldset">
                      <legend class="ma-legend">Filialen</legend>

                      <div class="mt-2 space-y-4">
                        <!-- Hauptfiliale -->
                        <div class="space-y-1">
                          <div class="ma-form-row">
                            <div class="ma-form-inputwrap">
                              <Multiselect
                                class="ms ms-up"
                                v-model="hauptfiliale"
                                :options="props.filialen.sort((a,b)=>a.filialname.localeCompare(b.filialname))"
                                label="filialname"
                                track-by="fnr"
                                placeholder="Hauptfiliale wählen"
                                :searchable="false"
                                :clearable="false"
                                selectLabel=""
                                deselectLabel=""
                                selectedLabel=""
                              >
                                <template #option="{ option }">
                                  <div class="flex items-center gap-2">
                                    <span
                                      class="h-3.5 w-3.5 rounded-full ring-1 ring-black/20"
                                      :style="{ backgroundColor: option.farbe || '#ccc' }"
                                    />
                                    <span class="truncate">{{ option.filialname }}</span>
                                  </div>
                                </template>
                              </Multiselect>
                            </div>
                          </div>

                          <p v-if="hauptfilialeFehler" class="ma-form-error">
                            Hauptfiliale ist erforderlich
                          </p>
                        </div>

                        <!-- Nebenfilialen -->
                        <div class="space-y-1">
                          <div class="ma-form-row">
                            <div class="ma-form-inputwrap">
                              <Multiselect
                                class="ms ms-up"
                                v-model="sortedNebenfilialen"
                                :options="nebenfilialenOptionen"
                                label="filialname"
                                track-by="fnr"
                                placeholder="Nebenfiliale(n) wählen"
                                :searchable="false"
                                :multiple="true"
                                :close-on-select="false"
                                selectLabel=""
                                deselectLabel=""
                                selectedLabel=""
                              >
                                <!-- AUSGEWÄHLTE TAGS: nur Kreise + hover-title -->
                                <template #tag="{ option, remove }">
                                  <span
                                    class="inline-flex items-center justify-center
                                           h-5 w-5 rounded-full
                                           ring-1 ring-black/20
                                           cursor-pointer"
                                    :style="{ backgroundColor: option.farbe || '#ccc' }"
                                    :title="option.filialname"
                                    @mousedown.prevent
                                    @click.stop="remove(option)"
                                  />
                                </template>

                                <!-- OPTION im Dropdown: Kreis + Name -->
                                <template #option="{ option }">
                                  <div class="flex items-center gap-2">
                                    <span
                                      class="h-3.5 w-3.5 rounded-full ring-1 ring-black/20"
                                      :style="{ backgroundColor: option.farbe || '#ccc' }"
                                    />
                                    <span class="truncate">{{ option.filialname }}</span>
                                  </div>
                                </template>
                              </Multiselect>
                            </div>
                          </div>
                        </div>
                      </div>
                    </fieldset>
                  </section>

                  <!-- Linie -->
                  <div class="ma-divider"></div>

                  <!-- RECHTS -->
                  <section class="ma-form-section">
                    <!-- Adresse -->
                    <fieldset class="ma-fieldset">
                      <legend class="ma-legend">Adresse</legend>

                      <div class="ma-form-body">
                        <div class="ma-form-row">
                          <span class="ma-form-label">Straße</span>
                          <input type="text" v-model="strasse" class="ma-form-input" />
                        </div>

                        <div class="ma-form-row">
                          <span class="ma-form-label">Ort</span>
                          <input type="text" v-model="ort" class="ma-form-input" />
                        </div>

                        <div class="ma-form-row">
                          <span class="ma-form-label">Postleitzahl</span>
                          <input type="text" v-model="postleitzahl" class="ma-form-input" />
                        </div>

                        <div class="ma-form-row">
                          <span class="ma-form-label">Land</span>
                          <input type="text" v-model="land" class="ma-form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Arbeit -->
                    <fieldset class="ma-fieldset">
                      <legend class="ma-legend">Arbeit</legend>

                      <div class="ma-form-body">
                        <div class="ma-form-row">
                          <span class="ma-form-label">Arbeitsstunden</span>
                          <input type="number" v-model="arbeitsstunden" class="ma-form-input" />
                        </div>

                        <div class="flex justify-between items-center gap-3">
                          <span class="ma-form-label">Springer</span>

                          <div class="flex gap-6 text-sm text-zinc-900">
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
                    <fieldset class="ma-fieldset">
                      <legend class="ma-legend">Anmerkungen</legend>

                      <textarea
                        rows="4"
                        v-model="anmerkungen"
                        class="ma-form-textarea"
                      />
                    </fieldset>
                  </section>
                </div>
              </form>
            </div>
          </div>
        </div>
      </article>
    </template>

    <template #footer></template>
  </BaseModal>
</template>