<script setup>
import BenutzerList from '@/components/benutzer/BenutzerList.vue'
import BestätigungsModal from '@/components/global/BestätigungsModal.vue'
import { useBenutzer } from '@/composables/useBenutzer.js'

const {
  benutzer,
  isLoading,
  showDeleteModal,
  benutzerToDelete,
  handleCreate,
  handleUpdate,
  openDeleteModal,
  confirmDelete,
  cancelDelete
} = useBenutzer()
</script>

<template>
  <div class="benutzer-view">
    <main class="container mx-auto p-6">

      <BenutzerList 
        :benutzer="benutzer" 
        :isLoading="isLoading"
        @create="handleCreate"
        @update="handleUpdate"
        @delete="openDeleteModal"
      />
    </main>

    <BestätigungsModal
      :show="showDeleteModal"
      :message="`Möchten Sie den Benutzer '${benutzerToDelete?.username}' wirklich löschen?`"
      @confirm="confirmDelete"
      @close="cancelDelete"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
}
</style>