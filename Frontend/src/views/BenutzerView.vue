<script setup>
import { ref } from 'vue'
import BenutzerList from '@/components/benutzer/BenutzerList.vue'
import BestätigungsModal from '@/components/global/BestätigungsModal.vue' // Pfad prüfen!
import { useBenutzer } from '@/composables/useBenutzer.js'

const {
  benutzer,
  isLoading,
  handleCreate,
  handleUpdate,
  handleDelete
} = useBenutzer()

// State für das Lösch-Modal
const showDeleteModal = ref(false)
const benutzerToDelete = ref(null)

// Öffnet das Modal und merkt sich, welcher Benutzer gelöscht werden soll
function openDeleteModal(b) {
  benutzerToDelete.value = b
  showDeleteModal.value = true
}

// Wird aufgerufen, wenn im Modal auf "Ja" geklickt wird
async function confirmDelete() {
  if (benutzerToDelete.value) {
    await handleDelete(benutzerToDelete.value)
    showDeleteModal.value = false
    benutzerToDelete.value = null
  }
}
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
      @close="showDeleteModal = false"
    />
  </div>
</template>

<style scoped>
.container {
  max-width: 1000px;
}
</style>