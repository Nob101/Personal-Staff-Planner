// benutzerService.js
// RICHTIGE VERSION, FÜR SOBALD EIN BACKEND MIT BENUTZERFUNKTIONEN VORLIEGT. 
import { http } from "./http"

//Liste aller Benutzer abrufen Array mit benutzer-Objekten (username, password) zurückgeben
export function getBenutzer() {
  return http.get("/users")
}

//POST: Benutzer anlegen (schickt { username, password } im Body)
export function createBenutzer(userData) {
  // Erwartet { username, password }
  return http.post("/users/register", userData)
}

//PUT: Benutzer aktualisieren (schickt { username, password } im Body)
export function updateBenutzer(userData) {
  return http.put(`/users/${userData.username}`, userData)
}
//DELETE: Benutzer löschen (schickt username als URL-Parameter)
export function deleteBenutzer(username) {
  return http.delete(`/users/${username}`)
}
  




// benutzerService.js (Mock-Version für Tests)

// const mockData = [
//   { username: 'admin', password: '1234' },
//   { username: 'markus', password: 'psp1234' }
// ];

// export async function getBenutzer() {
//   return new Promise(res => setTimeout(() => res({ data: [...mockData] }), 500));
// }

// export async function createBenutzer(userData) {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       if (mockData.find(b => b.username === userData.username)) {
//         return resolve({ data: { success: false, error: 'Benutzername existiert bereits' }});
//       }
//       mockData.push(userData);
//       resolve({ data: { success: true, user: userData } });
//     }, 400);
//   });
// }

// export async function updateBenutzer(userData) {
//   return new Promise(res => {
//     setTimeout(() => {
//       const idx = mockData.findIndex(b => b.username === userData.username);
//       if (idx !== -1) mockData[idx] = userData;
//       res({ data: { success: true, user: userData } });
//     }, 300);
//   });
// }

// export async function deleteBenutzer(username) {
//   return new Promise(res => {
//     setTimeout(() => {
//       const idx = mockData.findIndex(b => b.username === username);
//       if (idx !== -1) mockData.splice(idx, 1);
//       res({ data: { success: true } });
//     }, 300);
//   });
// }