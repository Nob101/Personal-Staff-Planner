//mitarbeiterServie.js
//Hier ist gesamte Backend-Kommunikation für Filialen

//Dummy-Daten für Testzwecke sind im Json-Server db.json

//BaseURL importieren
import { http } from "./http"

// Alle Filialen abrufen
export function getFilialen() {
  return http.get("/filialen")
}