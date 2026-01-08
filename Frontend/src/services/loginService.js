//loginServie.js
//Hier ist gesamte Backend-Kommunikation für Login/Auth

//BaseURL importieren
import { http } from './http'

// --- Login ---
export function login(benutzername, passwort) {
  return http.post('/auth/login', {
    username: benutzername,
    password: passwort
  })
}

// --- Registrierung ---
export function register(benutzername, passwort) {
  return http.post('/auth/register', {
    username: benutzername,
    password: passwort
  })
}