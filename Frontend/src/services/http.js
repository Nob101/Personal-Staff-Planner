//zentrale Axios Instant
//Später muss nur die BaseURL getauscht werden, die services bleiben gleich!

import axios from "axios"

export const http = axios.create({
  baseURL: "http://localhost:3001", // JSON Server Base URL
  headers: {
    "Content-Type": "application/json"
  }
})