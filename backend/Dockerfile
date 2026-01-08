#  Basis-Image: Eine stabile Node.js Version (schlanke Alpine-Variante)
FROM node:20-alpine

#  Arbeitsverzeichnis im Container festlegen
WORKDIR /app

#  Abhängigkeiten kopieren und installieren
#  kopiert erst nur die package-Dateien( Docker-Cache optimal  nutzen)
COPY package*.json ./
RUN npm install

#  Den restlichen Quellcode kopieren (inkl. deiner db-Struktur und server.js)
COPY . .

#  Den Port freigeben, auf dem deine Express-App läuft
EXPOSE 3000

#  Startbefehl für den Server
CMD ["node", "server.js"]


# Ich hab Docker für unsere DB-Anbindung fertiggemacht. In deinem Ordner liegt jetzt ein Dockerfile, dass deinen Node-Server 
# in einer isolierten Box startet. 
# Du musst lokal kein Postgres mehr konfigurieren, Docker regelt das Netzwerk zur DB automatisch.

        # Start: Im Hauptordner docker-compose up (startet DB + dein Backend).

        # Code-Änderung: Wenn du in deinen Routes/Files was änderst, musst du aktuell den Container neu starten (außer bei nodemon).

        # Neue Pakete: Nach einem npm install immer docker-compose up --build nutzen.

        # DB-Anbindung: Nutze in deiner Config host: 'db' (statt localhost), damit der Server die Datenbank im Docker-Netz findet.