//useLogin.js Composable

import { ref } from 'vue'
import * as loginService from '@/services/loginService'

export function useLogin() {
  const benutzername = ref('')
  const passwort = ref('')
  const error = ref('')
  const isLoading = ref(false)

  // NEU: --- Login ---  mit token
  async function handleLogin() {
    error.value = ''
    isLoading.value = true

    try {
      const res = await loginService.login(benutzername.value, passwort.value)

      if (!res.data.success) {
        error.value = 'Benutzername oder Passwort falsch'
        return false
      }

      // NEU: token im localStorage speichern  (token = token; FE = BE)
      if (res.data.token){
        localStorage.setItem('userToken', res.data.token)
      }

      // console.log('Eingeloggt als:', res.data.user)
      return true

    } catch (err) {
      error.value = 'Serverfehler beim Login'
      return false
    } finally {
      isLoading.value = false
    }
  }

  //NEU: --- Registrierung ---  mit token
  async function handleRegister() {
    error.value = ''
    isLoading.value = true

    try {
      const res = await loginService.register(benutzername.value, passwort.value)

      if (!res.data.success) {
        error.value = res.data.error || 'Benutzername existiert bereits'
        return false
      }

      // NEU: Auch nach Registrierung den token speichern !!!
      if (res.data.token) {
        localStorage.setItem('userToken', res.data.token)
      }

      console.log('Benutzer registriert:', res.data.user)
      return true

    } catch (err) {
      error.value = 'Serverfehler bei der Registrierung'
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    benutzername,
    passwort,
    error,
    isLoading,
    handleLogin,
    handleRegister
  }
}