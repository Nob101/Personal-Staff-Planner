//zentrale Axios Instant
//Später muss nur die BaseURL getauscht werden, die services bleiben gleich!

import axios from "axios"

export const http = axios.create({
  //baseURL: 'http://localhost:3001', // JSON Server für Entwicklung. Muss auf /api geändert werden, wenn Backend läuft
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

export default http;
