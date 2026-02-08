//zentrale Axios Instant
//Später muss nur die BaseURL getauscht werden, die services bleiben gleich!

import axios from "axios"

export const http = axios.create({
  baseURL: "http://localhost:3001/api", // JSON Server Base URL Muss mit Backend URL ersetzt werden.Heißt: http://localhost:3000/api/
  headers: {
    "Content-Type": "application/json"
  }
})