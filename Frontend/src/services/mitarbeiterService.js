//mitarbeiterServie.js
//Hier ist gesamte Backend-Kommunikation für Mitarbeiter

//Dummy-Daten für Testzwecke sind im Json-Server db.json

//BaseURL importieren
import { http } from "./http"


// Alle Mitarbeiter abrufen
export function getMitarbeiter() {
  return http.get("/mitarbeiter")
}

// Einzelnen Mitarbeiter abrufen
export function getMitarbeiterById(id) {
  return http.get(`/mitarbeiter/${id}`)
}

// Neuen Mitarbeiter erstellen
export function createMitarbeiter(mitarbeiter) {
  return http.post("/mitarbeiter", mitarbeiter)
}

// Mitarbeiter aktualisieren
export function updateMitarbeiter(mitarbeiter) {
  return http.put(`/mitarbeiter/${mitarbeiter.id}`, mitarbeiter)
}

// Mitarbeiter löschen
export function deleteMitarbeiter(id) {
  return http.delete(`/mitarbeiter/${id}`)
}



