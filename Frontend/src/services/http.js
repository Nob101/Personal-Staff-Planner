// http.js
// zentrale Axios Instant
import axios from "axios"

export const http = axios.create({
  baseURL:  '/api', // NEU: nginx fängt alles unter /api/ ab und reicht relativen pfad weiter
  headers: {
    "Content-Type": "application/json"
  } 
  // axios setzt header automatisch, schadet aber nicht ihn zu setzen
})


// NEU: Mit Interceptor wird der token bei jeder Anfrage im Header mitgeschickt und geprüft
// Entfernen für Frontend Tests
 http.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken');
  if (token){
    config.headers.Authorization = token;      //NEU: token aus dem localstorage direkt holen
  }
  return config
},
  error => {
    return Promise.reject(error);
  }
);

// NEU: Auf fehler 403 reagieren damit der localstorage (token) gelöscht wird
http.interceptors.response.use(
  response => response, // Wenn alles okay ist, einfach weitergeben
  error => {
    // Wenn der Server 403 (Verboten) antwortet -> Sitzung im Backend existiert nicht mehr
    if (error.response && error.response.status === 403) {
      console.warn("Sitzung abgelaufen (403). Lösche LocalStorage...");
      
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      
      // Seite neu laden oder zum Login schicken
      // Das zwingt die App, den ungültigen Zustand zu verlassen
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default http;
