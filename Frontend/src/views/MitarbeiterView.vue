<!-- MitarbeiterView.vue -->

<script setup>
//Komponenten/Composables/Icons/Modale/etc. importieren
import { useMitarbeiter } from '@/composables/useMitarbeiter'
import MitarbeiterActionBar from '@/components/mitarbeiter/MitarbeiterActionBar.vue'
import MitarbeiterList from '@/components/mitarbeiter/MitarbeiterList.vue'
import MitarbeiterCard from '@/components/mitarbeiter/MitarbeiterCard.vue'
import ModalMitarbeiterCreate from '@/components/mitarbeiter/ModalMitarbeiterCreate.vue'
import ModalMitarbeiterEdit from '@/components/mitarbeiter/ModalMitarbeiterEdit.vue'
import BestätigungsModal from '@/components/global/BestätigungsModal.vue'

//Holt sich alle Daten/Funktionen/States aus useMitarbeiter (Composable) heraus, damit diese hier verwendet werden können
const {
  mitarbeiter,
  filialen,
  searchTerm,
  filteredMitarbeiter,
  sortedMitarbeiter,
  sortOption,
  sortOptions,
  isLoading,
  showModalMitarbeiterCreate,
  showModalMitarbeiterEdit,
  selectedMitarbeiter,
  selectedMitarbeiterToDelete,
  showDeleteModal,
  handleMitarbeiterCreate,
  handleEdit,
  handleMitarbeiterEdit,
  handleDelete,
  confirmDelete,
  cancelDelete,

  // (notwendig fürs Design/Overlay):
  // WHY: Klick auf Card öffnet Detail-Overlay, Zurück schließt es
  handleSelect,
  closeDetails
} = useMitarbeiter()
</script>

<template>
  <div class="min-h-screen bg-white text-black dark:bg-[#18181b] dark:text-white">

    <!-- ActionBar -->
    <MitarbeiterActionBar
      v-model:modelValue="sortOption"
      :sortOptions="sortOptions"
      @searchMitarbeiter="val => (searchTerm = val)"
      @mitarbeiterCreate="showModalMitarbeiterCreate = true"
    />

    <!-- Design-Container -->
    <div class="mx-auto w-full max-w-[1400px] px-6 py-6 font-sans">
      <!-- DETAIL OVERLAY (Design) -->
      <div
        v-if="selectedMitarbeiter"
        class="fixed inset-0 z-50 flex items-start justify-center p-6
              bg-black/50 backdrop-blur-sm overflow-auto"
        @click.self="closeDetails"
      >
        <div class="w-full max-w-[760px]" @click.stop>
          <button
            type="button"
            class="mb-4 font-sans text-white/80 hover:text-white
                  transition-colors focus:outline-none focus:ring-0"
            @click="closeDetails"
          >
            ❮ Zurück zur Übersicht
          </button>

          <MitarbeiterCard
            :mitarbeiter="selectedMitarbeiter"
            :filialen="filialen"
            @select="handleSelect"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>

      <!-- Mitarbeiter Liste -->
      <!-- WHY: Liste soll NICHT gerendert werden, wenn Overlay offen ist (Design-Flow) -->
      <MitarbeiterList
        v-else
        :mitarbeiter="sortedMitarbeiter"
        :filialen="filialen"
        :isLoading="isLoading"
        @select="handleSelect"
        @edit="handleEdit"
        @delete="handleDelete"
      />

      <!-- Modale am Ende -->
      <ModalMitarbeiterCreate
        :show="showModalMitarbeiterCreate"
        :filialen="filialen"
        @close="showModalMitarbeiterCreate = false"
        @mitarbeiterCreate="handleMitarbeiterCreate"
      />

      <ModalMitarbeiterEdit
        v-if="showModalMitarbeiterEdit && !!selectedMitarbeiter"
        :show="showModalMitarbeiterEdit"
        :mitarbeiter="selectedMitarbeiter"
        :filialen="filialen"
        @close="showModalMitarbeiterEdit = false"
        @mitarbeiterEdit="handleMitarbeiterEdit"
      />

      <BestätigungsModal
        :show="showDeleteModal"
        message="Möchtest du diesen Mitarbeiter wirklich löschen?"
        @confirm="confirmDelete"
        @close="cancelDelete"
      />
    </div>
  </div>
</template>