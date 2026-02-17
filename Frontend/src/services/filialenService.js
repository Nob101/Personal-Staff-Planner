//filialenService.js
//Gesamte Backend-Kommunikation für Filialen


// BaseURL importieren
import { http } from "./http"

// Alle Filialen abrufen
export function getFilialen() {
  return http.get("/filialen")
}

// Einzelne Filiale abrufen UNNÖTIG?
export function getFilialeByFNR(fnr) {
  return http.get(`/filialen/${fnr}`)
}

// Neue Filiale erstellen
export function createFiliale(filiale) {
  return http.post("/filialen", filiale)
}

// Filiale aktualisieren
export function updateFiliale(filiale) {
  return http.put(`/filialen/${filiale.fnr}`, filiale)
}

// Filiale löschen
export function deleteFiliale(fnr) {
  return http.delete(`/filialen/${fnr}`)
}