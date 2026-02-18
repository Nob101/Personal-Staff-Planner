// useLogin.js Composable

import { ref } from 'vue'
import * as loginService from '@/services/loginService'

export function useLogin() {
  const benutzername = ref('')
  const passwort = ref('')
  const error = ref('')
  const isLoading = ref(false)

  // NEU: --- Login --- mit token
  async function handleLogin() {
    error.value = ''
    isLoading.value = true

    try {
      const res = await loginService.login(benutzername.value, passwort.value)

      if (!res.data.success) {
        error.value = 'Benutzername oder Passwort falsch'
        return false
      }

      // NEU: token im localStorage speichern (token = token; FE = BE)
      if (res.data.token) {
        localStorage.setItem('userToken', res.data.token)
      }

      return true

    } catch (err) {
      error.value = 'Serverfehler beim Login'
      return false
    } finally {
      isLoading.value = false
    }
  }

  // handleRegister wurde entfernt, da Registrierung nur noch über Benutzerverwaltung erfolgt

  return {
    benutzername,
    passwort,
    error,
    isLoading,
    handleLogin
  }
}