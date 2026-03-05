<!-- ModalMitarbeiterCreate.vue -->
<script setup>
import BaseModal from '@/components/global/BaseModal.vue'
import Multiselect from 'vue-multiselect'
import { ref, watch, defineProps, computed } from 'vue'
import speichern_icon from '@/assets/icons/speichern_icon.png'
import abbrechen_icon from '@/assets/icons/abbrechen_icon.svg'

// Emits
const emit = defineEmits(['close', 'mitarbeiterCreate'])

// Props
const props = defineProps({
  filialen: { type: Array, required: true },
  show: { type: Boolean, required: true } // wird von Parent gesteuert
})

/* === Wiederholungen zentral === */
const cls = {
  // Card Actions (wie MitarbeiterCard)
  actionWrap:
    `flex items-center gap-1 rounded-xl
     bg-white/60 dark:bg-white/10
     ring-1 ring-black/10 dark:ring-white/10
     p-1`,

  iconBtn:
    `inline-flex h-8 w-8 items-center justify-center rounded-xl
     ring-1 shadow-sm transition active:scale-[0.97]`,

  iconImg: `h-4 w-4 opacity-90`,

  // Form “fieldset”-Look (ersetzt form-fieldset)
  fieldset:
    `rounded-2xl bg-white dark:bg-black/25
     ring-1 ring-inset ring-black/10 dark:ring-white/10
     p-3`,

  legend:
    `text-sm font-extrabold uppercase tracking-wide
     text-zinc-600 dark:text-white/70
     px-1 -mb-3`,

  body: `mt-2 space-y-2`,

  row: `flex justify-between items-center gap-3 min-w-0`,

  label: `font-bold whitespace-nowrap`,

  inputWrap: `flex-1 max-w-[220px] min-w-0`,

  input:
    `h-9 flex-1 max-w-[220px] min-w-0
     rounded-xl bg-white/70 dark:bg-black/30
     px-3 text-sm text-zinc-900 dark:text-white/90
     outline-none text-right
     ring-1 ring-inset ring-black/10 dark:ring-white/15
     focus:ring-black/20 dark:focus:ring-white/30`,

  error: `text-sm text-red-400`
}

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
const springer = ref(undefined) // undefined, nichts vorausgewählt
const hauptfiliale = ref(null)
const nebenfilialen = ref([])
const anmerkungen = ref('')
const vornameFehler = ref(false)
const nachnameFehler = ref(false)
const hauptfilialeFehler = ref(false)

// Nebenfilialen automatisch anpassen
watch(hauptfiliale, (newVal) => {
  if (!newVal) return
  nebenfilialen.value = nebenfilialen.value.filter(
    f => f.fnr !== newVal.fnr
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

// Submit
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
    springer: springer.value ?? false, // wenn undefined, dann false
    hauptfiliale: hauptfiliale.value?.fnr || null,
    nebenfilialen: nebenfilialen.value.length ? nebenfilialen.value.map(f => f.fnr) : null,
    anmerkungen: anmerkungen.value || ''
  })

  // Formular zurücksetzen
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

  emit('close')
}
</script>

<template>
  <BaseModal :show="show" @close="emit('close')" width="760px">
    <template #body>
      <!-- Card wie Mitarbeiter-Detail -->
      <article
        class="mx-auto w-full max-w-[760px]
               font-sans relative rounded-3xl
               bg-white/70 dark:bg-zinc-900/50
               shadow-[0_16px_40px_rgba(0,0,0,0.4)]
               backdrop-blur overflow-hidden"
      >
        <!-- HEADER -->
        <div class="bg-linear-to-b from-zinc-300 to-zinc-400">
          <div class="flex items-center justify-between gap-3 px-4 py-2">
            <div class="min-w-0">
              <div class="text-xl font-extrabold text-zinc-900 dark:text-white truncate">
                Neuen Mitarbeiter anlegen
              </div>
              <div class="text-[11px] text-zinc-600 dark:text-white/70">
                Pflichtfelder: Vorname, Nachname, Hauptfiliale
              </div>
            </div>

            <!-- ACTIONS wie Card -->
            <div :class="cls.actionWrap">
              <button
                type="button"
                @click="handleSubmit"
                :class="`${cls.iconBtn} bg-linear-to-b from-emerald-300 to-emerald-900 hover:from-emerald-900 hover:to-emerald-300 ring-emerald-600/30`"
                title="Erstellen"
              >
                <img :src="speichern_icon" :class="cls.iconImg" alt="Erstellen" />
              </button>

              <button
                type="button"
                @click="emit('close')"
                :class="`${cls.iconBtn} bg-linear-to-b from-red-300 to-red-900 hover:from-red-900 hover:to-red-300 ring-red-600/30`"
                title="Abbrechen"
              >
                <img :src="abbrechen_icon" :class="cls.iconImg" alt="Abbrechen" />
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
                    <fieldset :class="cls.fieldset">
                      <legend :class="cls.legend">Name</legend>

                      <div :class="cls.body">
                        <div :class="cls.row">
                          <span :class="cls.label">Vorname</span>
                          <input v-model="vorname" type="text" :class="cls.input" />
                        </div>
                        <p v-if="vornameFehler" :class="cls.error">Vorname ist erforderlich</p>

                        <div :class="cls.row">
                          <span :class="cls.label">Nachname</span>
                          <input v-model="nachname" type="text" :class="cls.input" />
                        </div>
                        <p v-if="nachnameFehler" :class="cls.error">Nachname ist erforderlich</p>
                      </div>
                    </fieldset>

                    <!-- Email -->
                    <fieldset :class="cls.fieldset">
                      <legend :class="cls.legend">Email</legend>

                      <div :class="cls.body">
                        <div :class="cls.row">
                          <span :class="cls.label">Email 1</span>
                          <input type="email" v-model="email1" :class="cls.input" />
                        </div>

                        <div :class="cls.row">
                          <span :class="cls.label">Email 2</span>
                          <input type="email" v-model="email2" :class="cls.input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Telefon -->
                    <fieldset :class="cls.fieldset">
                      <legend :class="cls.legend">Telefon</legend>

                      <div :class="cls.body">
                        <div :class="cls.row">
                          <span :class="cls.label">Telefon 1</span>
                          <input type="tel" v-model="telefon1" :class="cls.input" />
                        </div>

                        <div :class="cls.row">
                          <span :class="cls.label">Telefon 2</span>
                          <input type="tel" v-model="telefon2" :class="cls.input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Filialen -->
                    <fieldset :class="cls.fieldset">
                      <legend :class="cls.legend">Filialen</legend>

                      <div class="mt-2 space-y-4">
                        <div class="space-y-1">
                          <div :class="cls.row">
                            <div :class="cls.inputWrap">
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
                              />
                            </div>
                          </div>

                          <p v-if="hauptfilialeFehler" :class="cls.error">
                            Hauptfiliale ist erforderlich
                          </p>
                        </div>

                        <div class="space-y-1">
                          <div :class="cls.row">
                            <div :class="cls.inputWrap">
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
                                <!-- AUSGEWÄHLTE TAGS im Input-Feld -->
                                <template #tag="{ option, remove }">
                                  <span
                                    class="inline-flex items-center justify-center h-5 w-5 rounded-full
                                           ring-1 ring-black/20 dark:ring-white/20 cursor-pointer"
                                    :style="{ backgroundColor: option.farbe || '#ccc' }"
                                    :title="option.filialname"
                                    @mousedown.prevent
                                    @click.stop="remove(option)"
                                  >
                                    <span class="text-[10px] leading-none text-black/60 dark:text-white/70 opacity-0 hover:opacity-100">
                                      ×
                                    </span>
                                  </span>
                                </template>

                                <!-- OPTIONEN im Dropdown: Punkt + Name -->
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
                    <fieldset :class="cls.fieldset">
                      <legend :class="cls.legend">Adresse</legend>

                      <div :class="cls.body">
                        <div :class="cls.row">
                          <span :class="cls.label">Straße</span>
                          <input type="text" v-model="strasse" :class="cls.input" />
                        </div>

                        <div :class="cls.row">
                          <span :class="cls.label">Ort</span>
                          <input type="text" v-model="ort" :class="cls.input" />
                        </div>

                        <div :class="cls.row">
                          <span :class="cls.label">Postleitzahl</span>
                          <input type="text" v-model="postleitzahl" :class="cls.input" />
                        </div>

                        <div :class="cls.row">
                          <span :class="cls.label">Land</span>
                          <input type="text" v-model="land" :class="cls.input" />
                        </div>
                      </div>
                    </fieldset>

                    <!-- Arbeit -->
                    <fieldset :class="cls.fieldset">
                      <legend :class="cls.legend">Arbeit</legend>

                      <div class="mt-2 space-y-2">
                        <div :class="cls.row">
                          <span :class="cls.label">Arbeitsstunden</span>
                          <input type="number" v-model="arbeitsstunden" :class="cls.input" />
                        </div>

                        <div class="flex justify-between items-center gap-3">
                          <span :class="cls.label">Springer</span>

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
                    <fieldset :class="cls.fieldset">
                      <legend :class="cls.legend">Anmerkungen</legend>

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

    <!-- Footer Slot -->
    <template #footer></template>
  </BaseModal>
</template>