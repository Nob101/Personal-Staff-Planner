# Basis Image -> spart platz version 20
# wird gelb unterstrichen weil die IDE "nachsehen" will ob das image verfügbar ist (also ganz normal)
FROM node:20-alpine

# Arbeitsverzeichnis im Container (app DIR wird automatisch erstellt und führt COPY RUN usw. aus)
WORKDIR /app

# Installiere Abhängigkeiten (erst werden die abhängigkeiten überprüft, wenn bereits vorhanden wird npm install übersprungen)
COPY package*.json ./
RUN npm install

# Kopiere den Rest des Codes in den Container
COPY . .

# Öffnet den Vite-Standardport
EXPOSE 5173

# Starte Vue im Host-Modus (--host), damit wir vom Browser drauf zugreifen können
CMD ["npm", "run", "dev", "--", "--host"]


# Ich hab Docker aufgesetzt, damit unser Projekt bei jedem (und vorallem bei markus) sofort läuft. 
# In eurem Ordner liegt ein Dockerfile – das ist eine isolierte Box, 
# in der Vue und Tailwind fertig konfiguriert starten. 
# Ihr müsst nichts lokal installieren, Docker erledigt alles. 
# Code-Änderungen in src werden wie gewohnt live übernommen. 


# Nur bei neuen npm-Paketen müssen wir einmal neu bauen.

    # Starten: Im Hauptordner docker-compose up tippen.

    # Browser: App unter localhost:5173 öffnen.

    # Neue Pakete: Nach einem npm install einmal docker-compose up --build ausführen.

    # Stoppen: Strg + C im Terminal.

