//zentrale Axios Instant
//Später muss nur die BaseURL getauscht werden, die services bleiben gleich!

import axios from "axios"
import router from '@/router/router.js'  //NEU: Router für die Umleitung nutzen !

export const http = axios.create({
  //  baseURL: 'http://localhost:3001', // JSON Server für Entwicklung. Muss auf /api geändert werden, wenn Backend läuft
  baseURL:  '/api', // NEU: nginx fängt alles unter /api ab und reicht relativen pfad weiter
  headers: {
    "Content-Type": "application/json"
  } 
  // axios setzt header automatisch, schadet aber nicht ihn zu setzen
})


// NEU: Aktualisiert Header sofort nach login (Axios)
export function setAuthHeader(token){
  if (token){
    http.defaults.headers.Authorization = token;
  } else {
    delete http.defaults.headers.Authorization;
  }
}

// NEU: Mit Interceptor wird der token bei jeder Anfrage im Header mitgeschickt und geprüft

http.interceptors.request.use(config => {
  const token = localStorage.getItem('userToken');
  if (token){
    config.headers.Authorization = token;      //NEU: token aus dem localstorage direkt holen
  }
  return config;
},
  error => {
    return Promise.reject(error);
  }
);

// NEU: Auf fehler 403 reagieren damit der localstorage (token) gelöscht wird
http.interceptors.response.use(
  response => response,           // Wenn alles okay ist, einfach weitergeben
  error => {
    // Wenn der Server 403 (Verboten) antwortet -> Sitzung im Backend existiert nicht mehr
    if (error.response && (error.response.status === 403 || error.response.status === 401)) {
      // console.warn("Sitzung abgelaufen (403). Lösche LocalStorage...");
      
      localStorage.removeItem('userToken');
      localStorage.removeItem('user');
      
      // NEU: Zum Login schicken via Vue-Router (verhindert weißes Fenster/leere Seite)
      if (router.currentRoute.value.name !== 'login') {
                router.push({ name: 'login' }); 
    }
  }
    return Promise.reject(error);
  }
);

export default http;
