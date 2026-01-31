// mitarbeiterService.js
// Hier ist gesamte Backend-Kommunikation für Mitarbeiter
// Dummy-Daten für Testzwecke sind im JSON-Server db.json
// BaseURL importieren
import http from "./http"

// --- Mitarbeiter CRUD ---

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
  console.log(
    "AXIOS POST → /mitarbeiter",
    JSON.stringify(m, null, 2)
  )

  return http.post("/mitarbeiter", m)
}

// Mitarbeiter aktualisieren
export function updateMitarbeiter(m) {
  console.log(
    "AXIOS PUT →",
    `/mitarbeiter/${m.id}`,
    JSON.stringify(m, null, 2)
  )

  return http.put(`/mitarbeiter/${m.id}`, m)
}

// Mitarbeiter löschen
export function deleteMitarbeiter(id) {
  return http.delete(`/mitarbeiter/${id}`)
}

// --- Zusätzliche Funktion: Verfügbare Mitarbeiter || unnötig?---
// POST /mitarbeiter/verfuegbar
export function getVerfuegbareMitarbeiter(filialeId, datum) {
  return http.post("/mitarbeiter/verfuegbar", {
    filialeId,
    datum
  })
}