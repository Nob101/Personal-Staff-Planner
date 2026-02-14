#!/usr/bin/env bash
set -euo pipefail

# Immer im Ordner des Scripts ausführen (wichtig bei Doppelklick/Shortcuts)
cd "$(dirname "$0")"

echo "-------------------------------------"
echo "PSP-Dienstplan: System check und start"
echo "-------------------------------------"

# 1) Docker Desktop prüfen / starten
echo "Pruefe Docker Desktop..."
if ! docker info >/dev/null 2>&1; then
  echo "Docker laeuft nicht... Starte Docker Desktop..."

  # Docker Desktop starten
  open -a Docker

  echo "Warte auf Docker Daemon (Check alle 5s)..."
  until docker info >/dev/null 2>&1; do
    sleep 5
  done
  echo "Docker ist nun bereit!"
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

# 3) Container starten (mit Build wie bei Windows)
echo "Starte Docker-container..."
docker compose up --build -d

# 4) Warten
sleep 15

echo "-------------------------------------"
echo "System ist online!"
echo "Oeffne App unter https://localhost"
echo "-------------------------------------"

# 5) Browser öffnen (Standardbrowser)
open "https://localhost"

# Optional: wie Edge-App-Modus auf Windows
# open -a "Microsoft Edge" --args --app="https://localhost"