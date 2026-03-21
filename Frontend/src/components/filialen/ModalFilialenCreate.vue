<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import { ref, defineProps, watch } from 'vue'
import ColorPicker from '@/components/global/ColorPicker.vue'

import speichern_icon from '@/assets/icons/speichern_icon.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon.svg'

const emit = defineEmits(['close', 'filialeCreate'])

const props = defineProps({
  mitarbeiter: { type: Object, required: false },
  filialen: { type: Object, required: true },
  show: { type: Boolean, required: true }
})

const algorithmOptions = [
  { label: 'AA-EE-FF', value: 1 },
  { label: 'AAAA-FF-EEEE-FF', value: 2 }
]

// Reaktive Formularfelder
const filialname = ref('')
const email = ref('')
const telefon = ref('')
const strasse = ref('')
const ort = ref('')
const plz = ref('')
const land = ref('')
const farbe = ref('#12f3ef')
const algorithmid = ref(null)
const anmerkungen = ref('')

// Validierungs-States
const nameFehler = ref(false)
const algorithmFehler = ref(false)

// Reset der Fehlermeldungen beim Schließen des Modals
watch(() => props.show, (newVal) => {
  if (!newVal) {
    nameFehler.value = false
    algorithmFehler.value = false
  }
})

function handleSubmit() {
  nameFehler.value = false
  algorithmFehler.value = false

  let hatFehler = false

  if (!filialname.value.trim()) {
    nameFehler.value = true
    hatFehler = true
  }

  if (!algorithmid.value) {
    algorithmFehler.value = true
    hatFehler = true
  }

  if (hatFehler) return

  emit('filialeCreate', {
    filialname: filialname.value,
    email: email.value || '',
    telefon: telefon.value || '',
    strasse: strasse.value || '',
    ort: ort.value || '',
    plz: plz.value || '',
    land: land.value || '',
    farbe: farbe.value,
    algorithmid: algorithmid.value ? algorithmid.value.value : null,
    anmerkungen: anmerkungen.value || ''
  })

  resetFormFields()
  emit('close')
}

function resetFormFields() {
  filialname.value = ''
  email.value = ''
  telefon.value = ''
  strasse.value = ''
  ort.value = ''
  plz.value = ''
  land.value = ''
  farbe.value = '#ffffff'
  algorithmid.value = null
  anmerkungen.value = ''
  nameFehler.value = false
  algorithmFehler.value = false
  anmerkungen.value = ''
}
</script>

<template>
  <BaseModal :show="show" @close="emit('close')" width="760px">
    <template #body>
      <article class="fi-form-shell mt-0">
        <!-- HEADER -->
        <div class="fi-card-head">
          <div class="flex items-center justify-between gap-3 px-4 py-2">
            <div class="min-w-0">
              <div class="text-xl font-extrabold text-zinc-900 truncate">
                Neue Filiale anlegen
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
                title="Erstellen"
              >
                <img :src="speichern_icon" class="h-4 w-4 opacity-90" alt="Erstellen" />
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
                    <!-- Filialname -->
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