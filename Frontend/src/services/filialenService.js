// filialenService.js
// ============================================================================
// Service für die Filialen-API
// Aufgaben dieser Datei:
// - Definition der API-Endpunkte für Filialen (/api/filialen)
// - Bereitstellung von CRUD-Methoden (GET, POST, PUT, DELETE)
// ============================================================================

import { http } from "./http"

// GET: Liste aller Filialen abrufen (/api/filialen)
export function getFilialen() {
  return http.get("/filialen")
}

// GET: Einzelne Filiale nach FNR abrufen
export function getFilialeByFNR(fnr) {
  return http.get(`/filialen/${fnr}`)
}

// POST: Filiale anlegen (/api/filialen)
export function createFiliale(filiale) {
  return http.post("/filialen", filiale)
}

// PUT: Filiale aktualisieren (/api/filialen/:fnr)
export function updateFiliale(filiale) {
  return http.put(`/filialen/${filiale.fnr}`, filiale)
}

// DELETE: Filiale löschen (/api/filialen/:fnr)
export function deleteFiliale(fnr) {
  return http.delete(`/filialen/${fnr}`)
}
