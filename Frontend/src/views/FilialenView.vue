<!-- FilialenView.vue -->
<script setup>
/**
 * View für die Filialen-Verwaltung.
 * Nutzt das useFilialen Composable für die gesamte Logik.
 * FilialenView enthält nur Template + Event-Handler-Calls.
 */
import Navbar from '@/components/global/Navbar.vue'
import { useFilialen } from '@/composables/useFilialen'

// Komponenten-Importe für die Filialen-Ansicht
import FilialenActionBar from '@/components/filialen/FilialenActionBar.vue'
import FilialenList from '@/components/filialen/FilialenList.vue'
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
} = useFilialen()
</script>

<template>
  <Navbar />
  
  <div class="filialen-view container mx-auto p-4">
    <FilialenActionBar 
      v-model:modelValue="sortOption" 
      :sortOptions="sortOptions"
      @searchFiliale="val => searchTerm = val" 
      @filialeCreate="showModalFilialeCreate = true" 
    />

    <FilialenList 
      :filialen="sortedFilialen" 
      :mitarbeiter="mitarbeiter" 
      :isLoading="isLoading" 
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
</template>