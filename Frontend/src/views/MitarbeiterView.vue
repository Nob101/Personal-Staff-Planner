<!-- MitarbeiterView.vue -->
<script setup>
import { computed, ref } from 'vue'

import Navbar_main from '@/components/global/Navbar_main.vue'
import { useMitarbeiter } from '@/composables/useMitarbeiter'

import PageBar from '@/components/ui/PageBar.vue'
import MitarbeiterList from '@/components/mitarbeiter/MitarbeiterList.vue'
import MitarbeiterCard from '@/components/mitarbeiter/MitarbeiterCard.vue'

import ModalMitarbeiterCreate from '@/components/mitarbeiter/ModalMitarbeiterCreate.vue'
import ModalMitarbeiterEdit from '@/components/mitarbeiter/ModalMitarbeiterEdit.vue'
import BestätigungsModal from '@/components/global/BestätigungsModal.vue'

import mitarbeiter_anlegen_icon from '@/assets/icons/mitarbeiter_anlegen_icon_solid.svg'
import filter_icon from '@/assets/icons/filter_icon_solid.svg'
import lupe_icon from '@/assets/icons/lupe_icon_solid.svg'

// States/Funktionen aus dem Composable
const {
  mitarbeiter,
  filialen,
  showModalMitarbeiterCreate,
  showModalMitarbeiterEdit,
  selectedMitarbeiter,
  showDeleteModal,
  handleMitarbeiterCreate,
  handleEdit,
  handleMitarbeiterEdit,
  handleDelete,
  confirmDelete,
  cancelDelete
} = useMitarbeiter()

// Suche
const search = ref('')

// Gefilterte Mitarbeiterliste
const filteredMitarbeiter = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return mitarbeiter.value

  return mitarbeiter.value.filter((m) => {
    const vorname = (m.vorname ?? '').toLowerCase()
    const nachname = (m.nachname ?? '').toLowerCase()
    const id = String(m.mnr ?? m.id ?? '')
    return (
      vorname.includes(q) ||
      nachname.includes(q) ||
      `${vorname} ${nachname}`.includes(q) ||
      id.includes(q)
    )
  })
})

// Öffnet Detailansicht
function handleSelect(m) {
  selectedMitarbeiter.value = m
}

// Schließt Detailansicht
function closeDetails() {
  selectedMitarbeiter.value = null
}
</script>

<template>
  <!-- Navbar -->
  <Navbar_main />

  <!-- Action / Search Bar -->
  <PageBar>
    <template #actions>
      <button
        @click="showModalMitarbeiterCreate = true"
        class="group flex items-center gap-2 px-5 py-1.5
               font-sans text-sm font-medium text-white/80
               border-b-2 border-transparent
               hover:border-white/60 hover:text-white transition-colors"
      >
        <img
          :src="mitarbeiter_anlegen_icon"
          class="h-6 w-6 opacity-70 group-hover:opacity-100"
          alt=""
        />
        Neu anlegen
      </button>

      <div class="w-px bg-white/10" />

      <button
        type="button"
        class="group flex items-center gap-2 px-5 py-1.5
               font-sans text-sm font-medium text-white/80
               border-b-2 border-transparent
               hover:border-white/60 hover:text-white transition-colors"
      >
        <img
          :src="filter_icon"
          class="h-6 w-6 opacity-70 group-hover:opacity-100 -ml-1"
          alt=""
        />
        Filtern
      </button>
    </template>

    <template #search>
      <div class="flex items-center px-4">
        <div class="relative">
          <input
            v-model="search"
            placeholder="Suchen"
            class="h-7 w-64 rounded-md bg-black/30 pl-12 pr-3
                   text-sm text-white/90 outline-none
                   ring-1 ring-white/15 focus:ring-white/30"
          />
          <span class="absolute left-3 top-1/2 -translate-y-1/2">
            <img :src="lupe_icon" class="h-6 w-6 opacity-60" />
          </span>
        </div>
      </div>
    </template>
  </PageBar>

  <!-- ================= DETAILANSICHT ================= -->
  <div
    v-if="selectedMitarbeiter"
    class="fixed inset-0 z-50 flex items-start justify-center p-6
           bg-black/50 backdrop-blur-sm overflow-auto"
    @click.self="closeDetails"
  >
    <div class="w-full max-w-6xl" @click.stop>
      <button
        type="button"
        class="mb-4 font-sans text-white/80 hover:text-white"
        @click="closeDetails"
      >
        ❮ Zurück zur Übersicht
      </button>

      <MitarbeiterCard
        :mitarbeiter="selectedMitarbeiter"
        :filialen="filialen"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>
  </div>

  <!-- ================= ÜBERSICHT ================= -->
  <div v-else class="container mx-auto p-4">
    <MitarbeiterList
      :mitarbeiter="filteredMitarbeiter"
      :filialen="filialen"
      @select="handleSelect"
      @edit="handleEdit"
      @delete="handleDelete"
    />
  </div>

  <!-- ================= MODALE ================= -->
  <ModalMitarbeiterCreate
    :show="showModalMitarbeiterCreate"
    :filialen="filialen"
    @close="showModalMitarbeiterCreate = false"
    @mitarbeiterCreate="handleMitarbeiterCreate"
  />

  <!--<ModalMitarbeiterEdit
    :show="showModalMitarbeiterEdit && selectedMitarbeiter"
    :mitarbeiter="selectedMitarbeiter"
    :filialen="filialen"
    @close="showModalMitarbeiterEdit = false"
    @mitarbeiterEdit="handleMitarbeiterEdit"
  />-->

  <BestätigungsModal
    :show="showDeleteModal"
    message="Möchtest du diesen Mitarbeiter wirklich löschen?"
    @confirm="confirmDelete"
    @close="cancelDelete"
  />
</template>
