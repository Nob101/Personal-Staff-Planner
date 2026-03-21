// benutzerService.js
// ============================================================================
// Service für die Benutzer-API
// Aufgaben dieser Datei:
// - Definition der API-Endpunkte für Benutzer (/api/users)
// - Bereitstellung von CRUD-Methoden (GET, POST, PUT, DELETE)
// ============================================================================

import { http } from "./http"

// GET: Liste aller Benutzer abrufen (/api/users)
export function getBenutzer() {
  return http.get("/users")
}

// GET: Einzelnen Benutzer nach ID abrufen
export function getBenutzerById(id) {
  return http.get(`/users/${id}`)
}

// POST: Benutzer anlegen (/api/users)
// Backend erwartet { username, password, role }
export function createBenutzer(userData) {
  return http.post("/users", userData)
}

// PUT: Benutzer aktualisieren (/api/users/:id)
export function updateBenutzer(userData) {
  const { id, ...payload } = userData
  return http.put(`/users/${id}`, payload)
}

// DELETE: Benutzer löschen (/api/users/:id)
export function deleteBenutzer(id) {
  return http.delete(`/users/${id}`)
}