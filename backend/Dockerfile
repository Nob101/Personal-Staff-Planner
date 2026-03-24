#  Basis-Image: Eine stabile Node.js Version (schlanke Alpine-Variante)
FROM node:20-alpine

#  Arbeitsverzeichnis im Container festlegen
WORKDIR /app

#  Abhängigkeiten kopieren und installieren
#  kopiert erst nur die package-Dateien
COPY package*.json ./
RUN npm install

#  Den restlichen Quellcode kopieren (inkl. der db-Struktur und server.js)
COPY . .

#  Der Port auf dem die Express-App läuft (lauschen)
EXPOSE 3001

#  Startbefehl für den Server 
# Für nodemon: CMD ["npm", "run", "devStart"] mit CMD ["npm", "start"] tauschen
CMD ["npm", "start"]


# für Alex:

# Ich hab Docker für unsere DB-Anbindung fertiggemacht. In den Hauptordnern liegt jetzt jewiels ein Dockerfile
# Startet in einer isolierten Box. 
# Du musst lokal kein Postgres mehr konfigurieren, Docker regelt das Netzwerk zur DB automatisch.

        # Start: Im Hauptordner docker-compose up (startet DB + Backend-Container).

        # Code-Änderung: Wenn du in deinen Routes/Files was änderst, musst du aktuell den Container neu starten (außer bei nodemon).

        # Neue Pakete: Nach einem npm install immer docker-compose up --build nutzen.

        # DB-Anbindung: Nutze in deiner Config host: 'db' (statt localhost), damit der Server die Datenbank im Docker-Netz findet.