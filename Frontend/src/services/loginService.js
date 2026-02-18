// loginServie.js
// Gesamte Backend-Kommunikation für Login

//BaseURL importieren
import { http } from './http'

// Login
export function login(benutzername, passwort) {
  return http.post('/auth/login', {
    username: benutzername,
    password: passwort
  })
}