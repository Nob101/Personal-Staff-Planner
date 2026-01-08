//zentrale Axios Instant

/** ############################################################################
 * * WICHTIG FÜR DAS TEAM:
 * 1. Diese Datei regelt die Verbindung zwischen Frontend (Vue) und Backend (Express).
 * 
 * 2. Die 'baseURL' wird automatisch zwischen Docker-Umgebung und lokalem 
 * Entwicklungsmodus gewechselt.
 * 
 * 3. BITTE KEINE HARDCODIERTEN IP-ADRESSEN ODER PORTS HIER ÄNDERN!
 * Änderungen an der API-URL müssen in der 'docker-compose.yml'
 * (VITE_API_URL) vorgenommen werden.
 * Danke. lukas
 ** ############################################################################
 */

//  NEU! Dynamische URL zuweisung siehe oben Punkt 3!!!!
import axios from "axios"

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/` : "http://localhost:3001/api/", // JSON Server Base URL Muss mit Backend URL ersetzt werden.Heißt: http://localhost:3000/api/
  headers: {
    "Content-Type": "application/json"
  },
  // Zeitlimit für Anfragen (WICHTIG: Nicht jede Instanz ist gleich schnell)
  timeout : 10000
});


// Test-Log  (Interceptor)  muss im App.vue ausgeführt werden -> test rückgabe  (Überwachungs-Logik)

http.interceptors.request.use((config) => {
  console.log(`%c[Frontend -> Backend] Anfrage geht raus an: ${config.baseURL}${config.url}`, "color: #3498db; font-weight: bold;");
  return config;
});

// test-Log Antwort vom Server
http.interceptors.response.use((response) => {
  console.log("%c[Backend -> Frontend] Antwort erfolgreich empfangen!", "color: #2ecc71; font-weight: bold;");
  return response;
});