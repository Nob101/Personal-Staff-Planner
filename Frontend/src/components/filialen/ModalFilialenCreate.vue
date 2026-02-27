<!-- ModalFilialenCreate.vue -->
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
const farbe = ref('#ffffff')
const algorithmid = ref(null)

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
    algorithmid: algorithmid.value ? algorithmid.value.value : null
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
  nameFehler.value = false
  algorithmFehler.value = false
}
</script>

<template>
  <BaseModal :show="show" @close="emit('close')" width="760px">
    <template #header></template>

    <template #body>
      <!-- Card wie Mitarbeiter-Detail -->
      <article
        class="mx-auto w-full max-w-[760px]
               font-sans relative mt-16 rounded-3xl
               bg-white/70 dark:bg-zinc-900/50
               shadow-[0_16px_40px_rgba(0,0,0,0.4)]
               backdrop-blur overflow-hidden"
      >
        <!-- HEADER -->
        <div class="bg-linear-to-b from-zinc-300 to-zinc-400">
          <div class="flex items-center justify-between gap-3 px-4 py-2">
            <div class="min-w-0">
              <div class="text-xl font-extrabold text-zinc-900 dark:text-white truncate">
                Neue Filiale anlegen
              </div>
              <div class="text-[11px] text-zinc-600 dark:text-white/70">
                Pflichtfelder: Filialname, Algorithmus
              </div>
            </div>

            <!-- ACTIONS wie Card -->
            <div
              class="flex items-center gap-1 rounded-xl
                     bg-white/60 dark:bg-white/10
                     ring-1 ring-black/10 dark:ring-white/10
                     p-1"
            >
              <button
                type="button"
                @click="handleSubmit"
                class="inline-flex h-8 w-8 items-center justify-center rounded-xl
                       bg-linear-to-b from-emerald-300 to-emerald-900
                       hover:from-emerald-900 hover:to-emerald-300
                       ring-1 ring-emerald-600/30 shadow-sm
                       transition active:scale-[0.97]"
                title="Erstellen"
              >
                <img :src="speichern_icon" class="h-4 w-4 opacity-90" alt="Erstellen" />
              </button>

              <button
                type="button"
                @click="emit('close')"
                class="inline-flex h-8 w-8 items-center justify-center rounded-xl
                       bg-linear-to-b from-red-300 to-red-900
                       hover:from-red-900 hover:to-red-300
                       ring-1 ring-red-600/30 shadow-sm
                       transition active:scale-[0.97]"
                title="Abbrechen"
              >
                <img :src="abbrechen_icon" class="h-4 w-4 opacity-90" alt="Abbrechen" />
              </button>
            </div>
          </div>
        </div>

        <!-- BODY -->
        <div class="px-4 pt-3 pb-4 rounded-b-3xl bg-linear-to-b from-zinc-400 to-zinc-600">
          <div class="rounded-2xl bg-zinc-300 dark:bg-white/10 ring-1 ring-black/10 dark:ring-white/10">
            <div class="p-4">
              <form @submit.prevent="handleSubmit" class="space-y-6">
                <!-- LINKS | LINIE | RECHTS -->
                <div class="grid grid-cols-[1fr_1px_1fr] gap-6 text-sm text-zinc-900 dark:text-white/90">
                  <!-- LINKS -->
                  <section class="space-y-4 min-w-0">
                    <!-- Filialname -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Filiale</legend>

                      <div class="form-body">
                        <div class="form-row">
                          <span class="form-label">Name</span>
                          <input v-model="filialname" type="text" class="form-input" />
                        </div>

                        <p v-if="nameFehler" class="form-error">
                          Filialenname ist erforderlich
                        </p>
                      </div>
                    </fieldset>

                    <!-- Kontakt -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Kontakt</legend>

                      <div class="form-body">
                        <div class="form-row">
                          <span class="form-label">Email</span>
                          <input type="email" v-model="email" class="form-input" />
                        </div>

                        <div class="form-row">
                          <span class="form-label">Telefon</span>
                          <input type="tel" v-model="telefon" class="form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Farbe -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Filialenfarbe</legend>
                      <div class="mt-2">
                        <ColorPicker v-model="farbe" />
                      </div>
                    </fieldset>
                  </section>

                  <!-- Linie -->
                  <div class="bg-black/10 dark:bg-white/15"></div>

                  <!-- RECHTS -->
                  <section class="space-y-4 min-w-0">
                    <!-- Adresse -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Adresse</legend>

                      <div class="form-body">
                        <div class="form-row">
                          <span class="form-label">Straße</span>
                          <input type="text" v-model="strasse" class="form-input" />
                        </div>

                        <div class="form-row">
                          <span class="form-label">Ort</span>
                          <input type="text" v-model="ort" class="form-input" />
                        </div>

                        <div class="form-row">
                          <span class="form-label">PLZ</span>
                          <input type="text" v-model="plz" class="form-input" />
                        </div>

                        <div class="form-row">
                          <span class="form-label">Land</span>
                          <input type="text" v-model="land" class="form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Algorithmus -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Algorithmus</legend>

                      <div class="form-body">
                        <div class="form-row">
                          <span class="form-label">Typ</span>
                          <div class="form-inputwrap">
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

                        <p v-if="algorithmFehler" class="form-error">
                          Algorithmus ist erforderlich
                        </p>
                      </div>
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

<style scoped>
/* gleiche Utility-Klassen wie in ModalMitarbeiterCreate */
.form-fieldset{
  border-radius: 1rem;
  background: rgba(255,255,255,1);
  padding: .75rem;
  box-shadow: 0 0 0 1px rgba(0,0,0,.10) inset;
}
:global(.dark) .form-fieldset{
  background: rgba(0,0,0,.25);
  box-shadow: 0 0 0 1px rgba(255,255,255,.10) inset;
}

.form-legend{
  font-size: .875rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .05em;
  color: rgb(82 82 91); /* zinc-600 */
  padding: 0 .25rem;
  margin-bottom: -0.75rem;
}
:global(.dark) .form-legend{
  color: rgba(255,255,255,.70);
}

.form-body{
  margin-top: .5rem;
  display: grid;
  gap: .5rem;
}

.form-row{
  display: flex;
  justify-content: space-between;
  gap: .75rem;
  align-items: center;
  min-width: 0;
}

.form-label{
  font-weight: 700;
  white-space: nowrap;
}

.form-inputwrap{
  flex: 1 1 auto;
  max-width: 220px;
  min-width: 0;
}

.form-input{
  height: 2.25rem; /* h-9 */
  flex: 1 1 auto;
  max-width: 220px;
  min-width: 0;

  border-radius: .75rem; /* rounded-xl */
  background: rgba(255,255,255,.70);
  padding: 0 .75rem;
  font-size: .875rem;
  color: rgb(24 24 27); /* zinc-900 */
  outline: none;
  box-shadow: 0 0 0 1px rgba(0,0,0,.10) inset;
  text-align: right;
}
:global(.dark) .form-input{
  background: rgba(0,0,0,.30);
  color: rgba(255,255,255,.90);
  box-shadow: 0 0 0 1px rgba(255,255,255,.15) inset;
}
.form-input:focus{
  box-shadow: 0 0 0 1px rgba(0,0,0,.20) inset;
}
:global(.dark) .form-input:focus{
  box-shadow: 0 0 0 1px rgba(255,255,255,.30) inset;
}

.form-error{
  font-size: .875rem;
  color: rgb(248 113 113); /* red-400 */
}
</style>