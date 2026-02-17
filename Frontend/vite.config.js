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
  server: {
    port: 3000,
    strictPort: true,       //Verhindert dass Vite auf andere Ports ausweicht
    host: true,           //Wichtig:verarbeitung Nginx Anfragen
    hmr: {
      protocol: 'wss',        //NEU: forced Websocket
      clientPort: 443         // Wichtig: Der Browser "denkt", der WebSocket liegt auf 443
    },
    watch: {
      usePolling: true,       //NEU: Hilft in Docker-Umgebung änderungen zu erkennen 
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    }
  }
});