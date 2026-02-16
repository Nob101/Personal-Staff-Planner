<!-- LoginView.vue-->
<script setup>
import { ref } from 'vue'
import router from '@/router/router.js'
import { useLogin } from '@/composables/useLogin'

const {
  benutzername,
  passwort,
  error,
  isLoading,
  handleLogin,
  handleRegister
} = useLogin()

const activeTab = ref('login')

// --- Klick auf Anmelden/Registrieren Button ---
async function onSubmit() {
  let ok = false
  if (activeTab.value === 'login') {
    ok = await handleLogin()
  } else {
    ok = await handleRegister()
  }

  if (ok) {
    // Login / Registrierung erfolgreich -> MitarbeiterView
    router.push('/filialen' )
  }
}
</script>

<template>
  <div class="auth-card">
    <!-- Tabs -->
    <div class="tabs">
      <button
        class="tab"
        :class="{ active: activeTab === 'login' }"
        @click="activeTab = 'login'"
      >
        Anmelden
      </button>
      <button
        class="tab"
        :class="{ active: activeTab === 'registrieren' }"
        @click="activeTab = 'registrieren'"
      >
        Registrieren
      </button>
    </div>

    <!-- Formular -->
    <div class="form">
      <input
        v-model="benutzername"
        placeholder="Benutzername"
        class="input"
      />
      <input
        v-model="passwort"
        type="password"
        placeholder="Passwort"
        class="input"
      />

      <p v-if="error" class="error">{{ error }}</p>

      <button @click="onSubmit" :disabled="isLoading" class="submit">
        {{ activeTab === 'login' ? 'Anmelden' : 'Registrieren' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.auth-card {
  width: 300px;
  margin: 40px auto;
  padding: 24px;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tabs {
  display: flex;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.tab {
  flex: 1;
  padding: 10px;
  text-align: center;
  border: none;
  background: #e6e6e6;
  cursor: pointer;
  font-weight: 500;
  color: #333;
  transition: 0.2s;
}

.tab.active {
  background: #3498db;
  color: white;
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

.error {
  color: red;
  font-size: 0.9rem;
}
</style>
