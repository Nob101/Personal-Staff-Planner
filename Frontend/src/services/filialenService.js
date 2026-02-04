// filialenService.js
/*
// TEMP-Version für JSON-Server kompatibel
// Frontend arbeitet nur mit fnr
// Intern wird id automatisch aus fnr gesetzt für JSON-Server

/*
// TEMP-Version für JSON-Server kompatibel
import { http } from "./http"

// --- Alle Filialen abrufen ---
export async function getFilialen() {
  const res = await http.get("/filialen")
  return {
    data: res.data.map(f => {
      const internalId = f.id || generateId()
      return {
        ...f,
        id: internalId,  // JSON-Server benötigt id
        fnr: internalId  // Frontend arbeitet nur mit fnr = id
      }
    })
  }
}

// --- Einzelne Filiale abrufen ---
export function getFilialeByFNR(fnr) {
  return http.get(`/filialen/${fnr}`)
}

// --- Neue Filiale erstellen ---
export async function createFiliale(filiale) {
  const newId = generateId()
  const payload = {
    ...filiale,
    id: newId,
    fnr: newId // fnr = id
  }
  return http.post("/filialen", payload)
}

// --- Filiale aktualisieren ---
export async function updateFiliale(filiale) {
  return http.put(`/filialen/${filiale.fnr}`, filiale)
}

// --- Filiale löschen ---
export async function deleteFiliale(fnr) {
  return http.delete(`/filialen/${fnr}`)
}

// --- Hilfsfunktion für TEMP ---
function generateId() {
  return Math.random().toString(36).substring(2, 10) // zufällige id
}
*/


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
