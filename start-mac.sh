#!/usr/bin/env bash
set -euo pipefail

echo "-------------------------------------"
echo "PSP-Dienstplan: System check und start"
echo "-------------------------------------"

# 1) Docker prüfen
echo "Pruefe Docker Desktop..."
if ! docker info >/dev/null 2>&1; then
  echo "Docker laeuft nicht. Bitte Docker Desktop starten."
  echo "Tipp: Spotlight -> Docker öffnen, dann nochmal dieses Script starten."
  exit 1
else
  echo "Docker laeuft bereits."
fi

# 2) certs Ordner / Zertifikate
mkdir -p certs

if [[ -f "certs/cert.pem" && -f "certs/key.pem" ]]; then
  echo "Zertifikate sind bereits vorhanden."
else
  echo "Erstelle Zertifikate..."
  if ! command -v openssl >/dev/null 2>&1; then
    echo "FEHLER: openssl nicht gefunden (sollte auf macOS normal vorhanden sein)."
    exit 1
  fi

  openssl req -x509 -newkey rsa:4096 \
    -keyout certs/key.pem \
    -out certs/cert.pem \
    -sha256 -days 365 -nodes \
    -subj "/CN=localhost"

  echo "Zertifikate erfolgreich erstellt!"
fi

# 3) Container starten
echo "Starte Docker-container..."
docker compose up -d

sleep 15

echo "-------------------------------------"
echo "System ist online!"
echo "Oeffne App unter https://localhost"
echo "-------------------------------------"

# 4) Browser öffnen
open "https://localhost"