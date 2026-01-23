<script setup>
  import Navbar from '@/components/global/Navbar.vue'
  import { useFilialen } from '@/composables/useFilialen'
  import FilialenActionBar from '@/components/filialen/FilialenActionBar.vue';
  import FilialenList from '@/components/filialen/FilialenList.vue';
  import ModalFilialeCreate from '@/components/filialen/ModalFilialenCreate.vue';
  import ModalFilialeEdit from '@/components/filialen/ModalFilialenEdit.vue';
  import BestätigungsModal from '@/components/global/BestätigungsModal.vue'

  const {
  filialen,
  mitarbeiter,
  searchTerm,
  filteredFilialen,
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
    <!-- ActionBar -->
    <FilialenActionBar @searchFiliale="val => searchTerm = val" @filialeCreate="showModalFilialeCreate = true" />

    <!-- Filialen Liste -->
    <FilialenList :filialen="filteredFilialen" :mitarbeiter="mitarbeiter" @edit="handleEdit" @delete="handleDelete"/>

    <!-- Modale am Ende -->
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