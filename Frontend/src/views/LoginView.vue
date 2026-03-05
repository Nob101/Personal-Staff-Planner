<!-- LoginView.vue-->
<script setup>
import router from '@/router/router.js'
import { useLogin } from '@/composables/useLogin'
const {
  benutzername,
  passwort,
  error,
  isLoading,
  handleLogin
} = useLogin()

// --- Klick auf Anmelden Button ---
async function onSubmit() {
  // Login erfolgreich -> MitarbeiterView
  const ok = await handleLogin()

  if (ok) {
    router.push({ name: 'home' })
  }
}
</script>

<template>
  <div
    class="relative min-h-screen
           bg-linear-to-b from-zinc-300/70 to-zinc-900 overflow-hidden"
  >


    <!-- Centered Login Card -->
    <div class="relative z-10 min-h-[calc(100vh-64px)]
                flex items-center justify-center px-4 py-10">
      <div
        class="w-full max-w-sm rounded-3xl
               border border-zinc-200
               bg-white/80 backdrop-blur-xl
               shadow-xl p-7 sm:p-8"
      >
        <div class="mb-6 text-center">
          <h2 class="text-2xl font-bold tracking-tight text-zinc-900">
            Anmelden
          </h2>
          <p class="mt-1 text-sm text-zinc-500">
            Bitte melde dich mit deinen Zugangsdaten an
          </p>
        </div>

        <div class="space-y-4">
          <!-- Benutzername -->
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-zinc-700">
              Benutzername
            </span>
            <input
              v-model="benutzername"
              placeholder="Benutzername eingeben"
              class="w-full rounded-2xl
                     border border-zinc-300
                     bg-white
                     px-4 py-3 text-zinc-900
                     placeholder:text-zinc-400
                     outline-none transition
                     focus:ring-4 focus:ring-zinc-900/10
                     focus:border-zinc-400"
              @keyup.enter="onSubmit"
            />
          </label>

          <!-- Passwort -->
          <label class="block">
            <span class="mb-1 block text-sm font-medium text-zinc-700">
              Passwort
            </span>
            <input
              v-model="passwort"
              type="password"
              placeholder="••••••••"
              class="w-full rounded-2xl
                     border border-zinc-300
                     bg-white
                     px-4 py-3 text-zinc-900
                     placeholder:text-zinc-400
                     outline-none transition
                     focus:ring-4 focus:ring-zinc-900/10
                     focus:border-zinc-400"
              @keyup.enter="onSubmit"
            />
          </label>

          <!-- Error -->
          <div v-if="error" class="rounded-2xl border border-red-300 bg-red-50 p-3">
            <p class="text-sm font-medium text-red-700">
              {{ error }}
            </p>
          </div>

          <!-- Submit -->
          <button
            @click="onSubmit"
            :disabled="isLoading"
            class="w-full rounded-2xl px-4 py-3 text-sm font-semibold
                   text-white shadow-lg transition
                   bg-linear-to-b from-blue-300 to-blue-900
                   hover:from-blue-900 hover:to-blue-300
                   disabled:opacity-60 disabled:cursor-not-allowed
                   active:scale-[0.99]"
          >
            <span v-if="isLoading" class="inline-flex items-center gap-2">
              <span
                class="h-4 w-4 animate-spin rounded-full
                       border-2 border-white/40 border-t-white"
              ></span>
              Lädt...
            </span>
            <span v-else>Anmelden</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
