<!-- MitarbeiterView.vue -->

<script setup>
//Komponenten/Composables/Icons/Modale/etc. importieren
import Navbar from '@/components/global/Navbar.vue'
import { useMitarbeiter } from '@/composables/useMitarbeiter'
import MitarbeiterActionBar from '@/components/mitarbeiter/MitarbeiterActionBar.vue'
import MitarbeiterList from '@/components/mitarbeiter/MitarbeiterList.vue'
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
  cancelDelete
} = useMitarbeiter()
</script>

<template>
  <Navbar />
  <div class="mitarbeiter-view container mx-auto p-4">
    <!-- ActionBar -->
    <MitarbeiterActionBar 
      v-model:modelValue="sortOption"  
      :sortOptions="sortOptions"
      @searchMitarbeiter="val => searchTerm = val" 
      @mitarbeiterCreate="showModalMitarbeiterCreate = true" />

    <!-- Mitarbeiter Liste -->
    <MitarbeiterList 
      :mitarbeiter="sortedMitarbeiter" 
      :filialen="filialen" 
      :isLoading="isLoading" 
      @edit="handleEdit" 
      @delete="handleDelete" />

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
</template>



