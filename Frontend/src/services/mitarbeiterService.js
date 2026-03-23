// mitarbeiterService.js
// ============================================================================
// Service für die Mitarbeiter-API
// Aufgaben dieser Datei:
// - Definition der API-Endpunkte für Mitarbeiter (/api/mitarbeiter)
// - Bereitstellung von CRUD-Methoden (GET, POST, PUT, DELETE)
// - Abfrage der Verfügbarkeit von Mitarbeitern
// ============================================================================

import { http } from "./http"

// GET: Liste aller Mitarbeiter abrufen (/api/mitarbeiter)
export function getMitarbeiter() {
  return http.get("/mitarbeiter")
}

// GET: Einzelnen Mitarbeiter nach MNR abrufen
export function getMitarbeiterById(id) {
  return http.get(`/mitarbeiter/${id}`)
}

// POST: Mitarbeiter anlegen (/api/mitarbeiter)
export function createMitarbeiter(m) {
  return http.post("/mitarbeiter", m)
}

// PUT: Mitarbeiter aktualisieren (/api/mitarbeiter/:mnr)
export function updateMitarbeiter(m) {
  return http.put(`/mitarbeiter/${m.mnr}`, m)
}

// DELETE: Mitarbeiter löschen (/api/mitarbeiter/:mnr)
export function deleteMitarbeiter(id) {
  return http.delete(`/mitarbeiter/${id}`)
}



/*
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
  */
