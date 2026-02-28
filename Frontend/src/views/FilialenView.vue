<!-- FilialenView.vue -->
<script setup>
/**
 * View für die Filialen-Verwaltung.
 * Nutzt das useFilialen Composable für die gesamte Logik.
 * FilialenView enthält nur Template + Event-Handler-Calls.
 */

import { useFilialen } from '@/composables/useFilialen'

// Komponenten-Importe für die Filialen-Ansicht
import FilialenActionBar from '@/components/filialen/FilialenActionBar.vue'
import FilialenList from '@/components/filialen/FilialenList.vue'
import FilialenCard from '@/components/filialen/FilialenCard.vue'
import ModalFilialeCreate from '@/components/filialen/ModalFilialenCreate.vue'
import ModalFilialeEdit from '@/components/filialen/ModalFilialenEdit.vue'
import BestätigungsModal from '@/components/global/BestätigungsModal.vue'

// Holt alle Daten, Funktionen und States aus dem Composable
const {
  filialen,
  mitarbeiter,
  searchTerm,
  sortedFilialen,
  sortOption,
  sortOptions,
  isLoading,
  showModalFilialeCreate,
  showModalFilialeEdit,
  showDeleteModal,
  selectedFiliale,

  handleFilialeCreate,
  handleEdit,
  handleFilialeEdit,
  handleDelete,
  confirmDelete,
  cancelDelete,

  // (Design/Overlay): neu aus Composable
  handleSelect,
  closeDetails
} = useFilialen()
</script>

<template>
  <div class="min-h-screen bg-white text-black dark:bg-[#18181b] dark:text-white">

    <FilialenActionBar 
      v-model:modelValue="sortOption" 
      :sortOptions="sortOptions"
      @searchFiliale="val => searchTerm = val" 
      @filialeCreate="showModalFilialeCreate = true" 
    />

    <div class="mx-auto w-full max-w-[1400px] px-6 py-6 font-sans">


    <!-- DETAIL OVERLAY (wie bei Mitarbeiter) -->
    <div
      v-if="selectedFiliale"
      class="fixed inset-0 z-9999 flex items-start justify-center p-6
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

        <FilialenCard
          :filialen="selectedFiliale"
          :mitarbeiter="mitarbeiter"
          @select="handleSelect"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- LISTE -->
    <FilialenList 
      v-else
      :filialen="sortedFilialen" 
      :mitarbeiter="mitarbeiter" 
      :isLoading="isLoading" 
      @select="handleSelect"
      @edit="handleEdit" 
      @delete="handleDelete"
    />

    <ModalFilialeCreate 
      :show="showModalFilialeCreate" 
      :filialen="filialen"
      :mitarbeiter="mitarbeiter" 
      @close="showModalFilialeCreate = false" 
      @filialeCreate="handleFilialeCreate"
    />

    <ModalFilialeEdit
      v-if="showModalFilialeEdit && !!selectedFiliale"
      :show="showModalFilialeEdit"
      :filiale="selectedFiliale"
      @close="showModalFilialeEdit = false"
      @filialeEdit="handleFilialeEdit"
    />

    <BestätigungsModal
      :show="showDeleteModal"
      message="Möchtest du diese Filiale wirklich löschen?"
      @confirm="confirmDelete"
      @close="cancelDelete"
    />
    </div>
  </div>
</template>