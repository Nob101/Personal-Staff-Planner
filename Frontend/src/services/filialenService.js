// filialenService.js

// DAS "RICHTIGE" SERVICE FILE FÜR SPÄTERE ECHTE BACKEND-API
//  JSON-SERVER braucht id, Frontend arbeitet aber nur mit fnr, deshalb die obrige TEMP-Lösung. fnr wird dann im Backend generiert und verwaltet.
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
export function getFilialeByFNR(fnr) {
  return http.get(`/filialen/${fnr}`)
}

// Neue Filiale erstellen
export function createFiliale(filiale) {
  console.log(
    "AXIOS POST → /filialen",
    JSON.stringify(filiale, null, 2)
  )

  return http.post("/filialen", filiale)
}

export function updateFiliale(filiale) {
  console.log(
    "AXIOS PUT →",
    `/filialen/${filiale.fnr}`,
    JSON.stringify(filiale, null, 2)
  )

  return http.put(`/filialen/${filiale.fnr}`, filiale)
}

// Filiale löschen
export function deleteFiliale(fnr) {
  return http.delete(`/filialen/${fnr}`)
}
