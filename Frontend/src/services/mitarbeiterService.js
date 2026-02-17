// mitarbeiterService.js
// Gesamte Backend-Kommunikation für Mitarbeiter

// BaseURL importieren
import http from "./http"

// Alle Mitarbeiter abrufen
export function getMitarbeiter() {
  return http.get("/mitarbeiter")
}

// Einzelnen Mitarbeiter abrufen
export function getMitarbeiterById(id) {
  return http.get(`/mitarbeiter/${id}`)
}

// Neuen Mitarbeiter erstellen
export function createMitarbeiter(m) {
  return http.post("/mitarbeiter", m)
}

// Mitarbeiter aktualisieren
export function updateMitarbeiter(m) {
  return http.put(`/mitarbeiter/${m.id}`, m)
}

// Mitarbeiter löschen
export function deleteMitarbeiter(id) {
  return http.delete(`/mitarbeiter/${id}`)
}

// --- Verfügbare Mitarbeiter --- UNNÖTIG?
// POST /mitarbeiter/verfuegbar
export function getVerfuegbareMitarbeiter(filialeId, datum) {
  return http.post("/mitarbeiter/verfuegbar", {
    filialeId,
    datum
  })
}