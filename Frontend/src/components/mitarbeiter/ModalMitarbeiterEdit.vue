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
                {{ mitarbeiter.vorname }} {{ mitarbeiter.nachname }} bearbeiten
              </div>
              <div class="text-[11px] text-zinc-600 dark:text-white/70">
                Pflichtfelder: Vorname, Nachname, Hauptfiliale
              </div>
            </div>

            <!-- ACTIONS wie Create -->
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
                title="Speichern"
              >
                <img :src="speichern_icon" class="h-4 w-4 opacity-90" alt="Speichern" />
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
                <div class="grid grid-cols-[1fr_1px_1fr] gap-6 text-sm text-zinc-900 dark:text-white/90">
                  <!-- LINKS -->
                  <section class="space-y-4 min-w-0">
                    <!-- Name -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Name</legend>

                      <div class="form-body">
                        <div class="form-row">
                          <span class="form-label">Vorname</span>
                          <input v-model="vorname" type="text" class="form-input" />
                        </div>
                        <p v-if="vornameFehler" class="form-error">Vorname ist erforderlich</p>

                        <div class="form-row">
                          <span class="form-label">Nachname</span>
                          <input v-model="nachname" type="text" class="form-input" />
                        </div>
                        <p v-if="nachnameFehler" class="form-error">Nachname ist erforderlich</p>
                      </div>
                    </fieldset>

                    <!-- Email -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Email</legend>

                      <div class="form-body">
                        <div class="form-row">
                          <span class="form-label">Email 1</span>
                          <input type="email" v-model="email1" class="form-input" />
                        </div>

                        <div class="form-row">
                          <span class="form-label">Email 2</span>
                          <input type="email" v-model="email2" class="form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Telefon -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Telefon</legend>

                      <div class="form-body">
                        <div class="form-row">
                          <span class="form-label">Telefon 1</span>
                          <input type="tel" v-model="telefon1" class="form-input" />
                        </div>

                        <div class="form-row">
                          <span class="form-label">Telefon 2</span>
                          <input type="tel" v-model="telefon2" class="form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Filialen -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Filialen</legend>

                      <div class="mt-2 space-y-4">
                        <!-- Hauptfiliale -->
                        <div class="space-y-1">
                          <div class="form-row">
                            <div class="form-inputwrap">
                              <Multiselect
                                class="ms"
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
                                      class="h-3.5 w-3.5 rounded-full ring-1 ring-black/20 dark:ring-white/20"
                                      :style="{ backgroundColor: option.farbe || '#ccc' }"
                                    />
                                    <span class="truncate">{{ option.filialname }}</span>
                                  </div>
                                </template>
                              </Multiselect>
                            </div>
                          </div>

                          <p v-if="hauptfilialeFehler" class="form-error">
                            Hauptfiliale ist erforderlich
                          </p>
                        </div>

                        <!-- Nebenfilialen -->
                        <div class="space-y-1">
                          <div class="form-row">
                            <div class="form-inputwrap">
                              <Multiselect
                                class="ms"
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
                                           ring-1 ring-black/20 dark:ring-white/20
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
                                      class="h-3.5 w-3.5 rounded-full ring-1 ring-black/20 dark:ring-white/20"
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
                          <span class="form-label">Postleitzahl</span>
                          <input type="text" v-model="postleitzahl" class="form-input" />
                        </div>

                        <div class="form-row">
                          <span class="form-label">Land</span>
                          <input type="text" v-model="land" class="form-input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Arbeit -->
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Arbeit</legend>

                      <div class="form-body">
                        <div class="form-row">
                          <span class="form-label">Arbeitsstunden</span>
                          <input type="number" v-model="arbeitsstunden" class="form-input" />
                        </div>

                        <div class="flex justify-between items-center gap-3">
                          <span class="form-label">Springer</span>

                          <div class="flex gap-6 text-sm text-zinc-900 dark:text-white/90">
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
                    <fieldset class="form-fieldset">
                      <legend class="form-legend">Anmerkungen</legend>

                      <textarea
                        rows="4"
                        v-model="anmerkungen"
                        class="w-full resize-none rounded-xl
                               ring-1 ring-white/80 dark:ring-white/20
                               bg-white/70 dark:bg-black/30
                               p-2 text-sm text-zinc-900 dark:text-white/90
                               outline-none"
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

<style scoped>
/* exakt die selben Utility-Klassen wie im Create (damit’s wirklich gleich aussieht) */
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