<script setup>

import { ref } from "vue";
 
const jahr = ref(2025);

const monat = ref(5);
 
function laden() {

  alert(`Dummy: Laden ${jahr.value}-${String(monat.value).padStart(2, "0")}`);

}

function neuGenerieren() {

  alert(`Dummy: Neu generieren ${jahr.value}-${String(monat.value).padStart(2, "0")}`);

}
</script>
 
<template>
<div>
<h1 class="text-2xl font-semibold mb-4">Automatischer Dienstplan</h1>
 
    <section class="flex gap-3 items-end flex-wrap">
<label class="flex flex-col text-sm">

        Jahr:
<input

          v-model.number="jahr"

          type="number"

          min="2000"

          max="2100"

          class="border border-black rounded-md px-2 py-1"

        />
</label>
 
      <label class="flex flex-col text-sm">

        Monat:
<input

          v-model.number="monat"

          type="number"

          min="1"

          max="12"

          class="border border-black rounded-md px-2 py-1"

        />
</label>
 
      <!-- nutzt euer globales button @apply aus style.css -->
<button type="button" @click="laden">Dienstplan laden</button>
<button type="button" @click="neuGenerieren">neu generieren</button>
</section>
 
    <section class="mt-6">
<div class="border border-black rounded-lg p-4">
<p class="opacity-70">Hier kommt später die Matrix rein (Dummy).</p>
</div>
</section>
</div>
</template>

 