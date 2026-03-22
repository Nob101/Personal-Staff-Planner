// loginService.js
// ============================================================================
// Service für die Authentifizierungs-API
// Aufgaben dieser Datei:
// - Bereitstellung von Methoden für Login und Registrierung
// - Kommunikation mit den Auth-Endpunkten (/api/auth)
// ============================================================================

import { http } from './http'

// POST: Login durchführen (/api/auth/login)
export function login(benutzername, passwort) {
  return http.post('/auth/login', {
    username: benutzername,
    password: passwort
  })
}