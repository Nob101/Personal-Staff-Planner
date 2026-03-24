// mitarbeiterService.js
// ============================================================================
// Service für die Mitarbeiter-API
// Aufgaben dieser Datei:
// - Definition der API-Endpunkte für Mitarbeiter (/api/mitarbeiter)
// - Bereitstellung von CRUD-Methoden (GET, POST, PUT, DELETE)
// - Abfrage der Verfügbarkeit von Mitarbeitern
// ============================================================================

import { http } from "./http"

// GET: Liste aller Mitarbeiter abrufen (/api/mitarbeiter)
export function getMitarbeiter() {
  return http.get("/mitarbeiter")
}

// GET: Einzelnen Mitarbeiter nach MNR abrufen
export function getMitarbeiterById(id) {
  return http.get(`/mitarbeiter/${id}`)
}

// POST: Mitarbeiter anlegen (/api/mitarbeiter)
export function createMitarbeiter(m) {
  return http.post("/mitarbeiter", m)
}

// PUT: Mitarbeiter aktualisieren (/api/mitarbeiter/:mnr)
export function updateMitarbeiter(m) {
  return http.put(`/mitarbeiter/${m.mnr}`, m)
}

// DELETE: Mitarbeiter löschen (/api/mitarbeiter/:mnr)
export function deleteMitarbeiter(id) {
  return http.delete(`/mitarbeiter/${id}`)
}
