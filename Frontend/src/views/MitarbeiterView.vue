<!-- MitarbeiterView.vue -->

<script setup>
//Komponenten/Composables/Icons/Modale/etc. importieren
import { useMitarbeiter } from '@/composables/useMitarbeiter'
import MitarbeiterList from '@/components/mitarbeiter/MitarbeiterList.vue'
import ModalMitarbeiterCreate from '@/components/mitarbeiter/ModalMitarbeiterCreate.vue'
import ModalMitarbeiterEdit from '@/components/mitarbeiter/ModalMitarbeiterEdit.vue'
import BestätigungsModal from '@/components/global/BestätigungsModal.vue'
import MitarbeiterCard from '@/components/mitarbeiter/MitarbeiterCard.vue'

//Holt sich alle Daten/Funktionen/States aus useMitarbeiter (Composable) heraus, damit diese hier verwendet werden können
const {
  mitarbeiter,
  filialen,
  showModalMitarbeiterCreate,
  showModalMitarbeiterEdit,
  selectedMitarbeiter,
  selectedMitarbeiterToDelete,
  showDeleteModal,
  handleMitarbeiterCreate,
  handleEdit,
  handleMitarbeiterEdit,
  handleDelete,
  handleSelect,
  closeDetails,
  confirmDelete,
  cancelDelete
} = useMitarbeiter()
</script>

<template>
    <!-- ActionBar -->
    <MitarbeiterActionBar @mitarbeiterCreate="showModalMitarbeiterCreate = true"
    @search="search = $event"/>

      <div class="mx-auto w-full max-w-[1400px] px-6 py-6 font-sans">
    <!-- DETAIL OVERLAY -->
    <div
      v-if="selectedMitarbeiter"
      class="fixed inset-0 z-9999 flex items-start justify-center p-6
             bg-black/50 backdrop-blur-sm overflow-auto"
      @click.self="closeDetails"
    >
      <div class="w-full max-w-6xl" @click.stop>
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
    <MitarbeiterList
    v-else
    :mitarbeiter="mitarbeiter"
    :filialen="filialen"
    @select="handleSelect"
    @edit="handleEdit"
    @create="showModalMitarbeiterCreate = true"
    />

    

    <!-- Modale am Ende -->
    <ModalMitarbeiterCreate 
      :show="showModalMitarbeiterCreate" 
      :filialen="filialen" 
      @close="showModalMitarbeiterCreate = false" 
      @mitarbeiterCreate="handleMitarbeiterCreate"
    />

    <ModalMitarbeiterEdit
      :show="showModalMitarbeiterEdit && selectedMitarbeiter"
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



