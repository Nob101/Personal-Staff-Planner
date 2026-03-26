<!-- ModalFilialenEdit.vue -->
<!-- 
============================================================================
// Aufgaben dieser Datei:
// - Modal zum Ändern der Daten einer Filiale
// ============================================================================
-->

<script setup>
import { ref, defineProps, watch } from 'vue'
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import ColorPicker from '@/components/global/ColorPicker.vue'

// (notwendig fürs Design): Icon-Buttons statt Textbuttons
import speichern_icon from '@/assets/icons/speichern_icon.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon.svg'

const emit = defineEmits(['close', 'filialeEdit'])

const props = defineProps({
  filiale: { type: Object, required: true },
  show: { type: Boolean, required: true }
})

// Algorithmus Optionen
const algorithmOptions = [
  { label: 'AA-EE-FF', value: 1 },
  { label: 'AAAA-FF-EEEE-FF', value: 2 }
]

// Lokale Kopien der Felder
const filialname = ref('')
const strasse = ref('')
const ort = ref('')
const plz = ref('')
const land = ref('')
const telefon = ref('')
const email = ref('')
const farbe = ref('')
const anmerkungen = ref('')
const algorithmid = ref(null)

// Validierungs-States
const nameFehler = ref(false)
const algorithmFehler = ref(false)

// Props → lokale Refs kopieren
watch(
  () => props.filiale,
  (edited) => {
    if (!edited) return
    filialname.value = edited.filialname || ''
    strasse.value = edited.strasse || ''
    ort.value = edited.ort || ''
    plz.value = edited.plz || ''
    land.value = edited.land || ''
    telefon.value = edited.telefon || ''
    email.value = edited.email || ''
    farbe.value = edited.farbe || '#ffffff' // Fallback auf Weiß, wenn nicht gesetzt
    anmerkungen.value = edited.anmerkungen || ''
    algorithmid.value =
      algorithmOptions.find(opt => opt.value === edited.algorithmid) || null
  },
  { immediate: true }
)

// entfernt Reset Fehler Meldung bei Schließen des Modals
watch(() => props.show, (newVal) => {
  if (!newVal) {
    nameFehler.value = false
    algorithmFehler.value = false
  }
})

// Submit
function handleSubmit() {
  // Zurücksetzen der Fehler-States für neue Prüfung
  nameFehler.value = false
  algorithmFehler.value = false

  let hatFehler = false

  // Filialname Pflichtfeld-Prüfung
  if (!filialname.value.trim()) {
    nameFehler.value = true
    hatFehler = true
  }

  // Algorithmus Pflichtfeld-Prüfung
  if (!algorithmid.value) {
    algorithmFehler.value = true
    hatFehler = true
  }

  // Wenn Fehler vorhanden sind, hier abbrechen (beide Meldungen bleiben stehen)
  if (hatFehler) return

  emit('filialeEdit', {
    fnr: props.filiale.fnr,
    filialname: filialname.value,
    strasse: strasse.value || '',
    ort: ort.value || '',
    plz: plz.value || '',
    land: land.value.trim() !== '' ? land.value : 'Österreich',
    telefon: telefon.value || '',
    email: email.value || '',
    farbe: farbe.value || '',
    anmerkungen: anmerkungen.value || '',
    algorithmid: algorithmid.value ? algorithmid.value.value : null
  })
  emit('close')
}
</script>

<template>
  <BaseModal v-if="filiale" :show="show" @close="emit('close')" width="760px">
    <template #body>
      <!-- Card wie ModalMitarbeiterEdit + ModalFilialenCreate -->
      <article class="fi-form-shell">
        <!-- HEADER -->
        <div class="fi-card-head">
          <div class="flex items-center justify-between gap-3 px-4 py-2">
            <div class="min-w-0">
              <div class="text-xl font-extrabold text-zinc-900 truncate">
                Filiale bearbeiten: {{ filiale.filialname }}
              </div>
              <div class="text-[11px] text-zinc-600">
                Pflichtfelder: Filialname, Algorithmus
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="fi-card-actions">
              <button
                type="button"
                @click="handleSubmit"
                class="fi-action-btn fi-action-btn--emerald"
                title="Speichern"
              >
                <img :src="speichern_icon" class="h-4 w-4 opacity-90" alt="Speichern" />
              </button>

              <button
                type="button"
                @click="emit('close')"
                class="fi-action-btn fi-action-btn--red"
                title="Abbrechen"
              >
                <img :src="abbrechen_icon" class="h-4 w-4 opacity-90" alt="Abbrechen" />
              </button>
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div class="px-4 pt-3 pb-4 rounded-b-3xl bg-linear-to-b from-zinc-400 to-zinc-600">
          <div class="fi-form-panel">
            <div class="p-4">
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- LINKS | LINIE | RECHTS -->
                <div class="fi-form-grid">
                  <!-- LINKS -->
                  <section class="space-y-4 min-w-0">
                    <!-- Filiale -->
                    <fieldset class="fi-form-fieldset">
                      <legend class="fi-form-legend">Filiale</legend>

                      <div class="fi-form-body">
                        <div class="fi-form-row">
                          <span class="fi-form-label">Name</span>
                          <input v-model="filialname" type="text" class="fi-form-input" />
                        </div>

                        <p v-if="nameFehler" class="fi-form-error">
                          Filialenname ist erforderlich
                        </p>
                      </div>
                    </fieldset>

                    <!-- Kontakt -->
                    <fieldset class="fi-form-fieldset">
                      <legend class="fi-form-legend">Kontakt</legend>

                      <div class="fi-form-body">
                        <div class="fi-form-row">
                          <span class="fi-form-label">Email</span>
                          <input type="email" v-model="email" class="fi-form-input" />
                        </div>

                        <div class="fi-form-row">
                          <span class="fi-form-label">Telefon</span>
                          <input type="tel" v-model="telefon" class="fi-form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Farbe -->
                    <fieldset class="fi-form-fieldset">
                      <legend class="fi-form-legend">Filialenfarbe</legend>
                      <div class="mt-2">
                        <ColorPicker v-model="farbe" />
                      </div>
                    </fieldset>
                  </section>

                  <!-- Linie -->
                  <div class="fi-divider"></div>

                  <!-- RECHTS -->
                  <section class="space-y-4 min-w-0">
                    <!-- Adresse -->
                    <fieldset class="fi-form-fieldset">
                      <legend class="fi-form-legend">Adresse</legend>

                      <div class="fi-form-body">
                        <div class="fi-form-row">
                          <span class="fi-form-label">Straße</span>
                          <input type="text" v-model="strasse" class="fi-form-input" />
                        </div>

                        <div class="fi-form-row">
                          <span class="fi-form-label">Ort</span>
                          <input type="text" v-model="ort" class="fi-form-input" />
                        </div>

                        <div class="fi-form-row">
                          <span class="fi-form-label">PLZ</span>
                          <input type="text" v-model="plz" class="fi-form-input" />
                        </div>

                        <div class="fi-form-row">
                          <span class="fi-form-label">Land</span>
                          <input type="text" v-model="land" class="fi-form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Algorithmus -->
                    <fieldset class="fi-form-fieldset">
                      <legend class="fi-form-legend">Algorithmus</legend>

                      <div class="fi-form-body">
                        <div class="fi-form-row">
                          <span class="fi-form-label">Typ</span>
                          <div class="fi-form-inputwrap">
                            <Multiselect
                              class="ms"
                              v-model="algorithmid"
                              :options="algorithmOptions"
                              :multiple="false"
                              :searchable="false"
                              :clearable="false"
                              placeholder="Algorithmus wählen"
                              selectLabel=""
                              deselectLabel=""
                              selectedLabel=""
                              label="label"
                              track-by="value"
                            />
                          </div>
                        </div>

                        <p v-if="algorithmFehler" class="fi-form-error">
                          Algorithmus ist erforderlich
                        </p>
                      </div>
                    </fieldset>

                    <!-- Anmerkungen -->
                    <fieldset class="fi-form-fieldset">
                      <legend class="fi-form-legend">Anmerkungen</legend>

                      <textarea
                        rows="4"
                        v-model="anmerkungen"
                        class="fi-form-textarea"
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
