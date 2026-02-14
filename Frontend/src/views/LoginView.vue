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
    router.push({ name: 'mitarbeiter' })
  }
}
</script>

<template>
  <div class="auth-card">
    <h2 class="auth-title">Anmelden</h2>

    <div class="form">
      <input
        v-model="benutzername"
        placeholder="Benutzername"
        class="input"
        @keyup.enter="onSubmit"
      />
      <input
        v-model="passwort"
        type="password"
        placeholder="Passwort"
        class="input"
        @keyup.enter="onSubmit"
      />

      <p v-if="error" class="error">{{ error }}</p>

      <button @click="onSubmit" :disabled="isLoading" class="submit">
        {{ isLoading ? 'Lädt...' : 'Anmelden' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-card {
  width: 300px;
  margin: 100px auto;
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auth-title {
  text-align: center;
  font-weight: 600;
  font-size: 1.2rem;
  color: #333;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input {
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  font-size: 14px;
}

.submit {
  padding: 10px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.submit:hover {
  background: #2d80b8;
}

.submit:disabled {
  background: #95a5a6;
}

.error {
  color: red;
  font-size: 0.9rem;
  text-align: center;
}
</style>