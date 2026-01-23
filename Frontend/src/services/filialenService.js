//filialenService.js
//Hier ist gesamte Backend-Kommunikation für Filialen

//Dummy-Daten für Testzwecke sind im Json-Server db.json

//BaseURL importieren
import { http } from "./http"

// Alle Filialen abrufen
export function getFilialen() {
  return http.get("/filialen")
}

// Einzelne Filiale abrufen (optional)
export function getFilialeById(id) {
  return http.get(`/filialen/${id}`)
}

// Neue Filiale erstellen
export function createFiliale(filiale) {
  return http.post("/filialen", filiale)
}

// Filiale aktualisieren
export function updateFiliale(filiale) {
  return http.put(`/filialen/${filiale.id}`, filiale)
}

// Filiale löschen
export function deleteFiliale(id) {
  return http.delete(`/filialen/${id}`)
}