import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  base: '/', // Stellt sicher, dass Pfade vom Root-Verzeichnis aus aufgelöst werden
  server: {
    port: 5173,      // Muss mit dem Port in der docker-compose übereinstimmen
    host: '0.0.0.0', // WICHTIG: Erlaubt Zugriff von außerhalb des Containers
    watch: {
      usePolling: true, // WICHTIG: Damit Änderungen am Code in Windows auch im Docker-Container bemerkt werden
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
