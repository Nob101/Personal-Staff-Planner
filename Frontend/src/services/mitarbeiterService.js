// mitarbeiterService.js
// Hier ist gesamte Backend-Kommunikation für Mitarbeiter
// Dummy-Daten für Testzwecke sind im JSON-Server db.json
// BaseURL importieren

import http from "./http"

export function getMitarbeiter() {
  return http.get("/mitarbeiter")
}

export function getMitarbeiterById(id) {
  return http.get(`/mitarbeiter/${id}`)
}

export function createMitarbeiter(m) {
  return http.post("/mitarbeiter", m)
}

export function updateMitarbeiter(m) {
  return http.put(`/mitarbeiter/${m.id}`, m)
}

export function deleteMitarbeiter(id) {
  return http.delete(`/mitarbeiter/${id}`)
}