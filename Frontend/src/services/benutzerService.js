import { http } from "./http"

// GET: Liste aller Benutzer abrufen (/api/users)
export function getBenutzer() {
  return http.get("/users")
}

// GET: Einzelnen Benutzer nach ID abrufen
export function getBenutzerById(id) {
  return http.get(`/users/${id}`)
}

// POST: Benutzer anlegen (/api/users)
export function createBenutzer(userData) {
  // Erwartet laut Backend: { username, password, role }
  return http.post("/users", userData)
}

// PUT: Benutzer aktualisieren (/api/users/:id)
export function updateBenutzer(userData) {
  // Wir extrahieren die ID für die URL und schicken den Rest als Body
  const { id, ...payload } = userData
  return http.put(`/users/${id}`, payload)
}

// DELETE: Benutzer löschen (/api/users/:id)
export function deleteBenutzer(id) {
  return http.delete(`/users/${id}`)
}