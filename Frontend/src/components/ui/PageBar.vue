<script setup>
defineProps({
  title: { type: String, default: "" },
});
</script>

<template>
  <div class="border-b border-white/10 bg-zinc-700">
    <div class="mx-auto flex h-10 w-full max-w-[1400px] items-stretch px-6">
      <!-- LINKS: Actions (nimmt den Platz) -->
      <div class="flex min-w-0 flex-1 items-center">
        <div class="flex items-center">
          <slot name="actions" />
        </div>
      </div>

      <!-- RECHTS: Search (nimmt nur seine eigene Breite) -->
      <div class="flex shrink-0 items-center font-sans">
        <slot name="search" />
      </div>
    </div>
  </div>
</template>

