#!/bin/bash

# IP des Pi ermitteln (Damit das Zertifikat zur URL passt!)
RP_IP=$(hostname -I | awk '{print $1}')
[ -z "$RP_IP" ] && RP_IP="localhost"

CERTS_DIR="./certs" 

echo "-------------------------------------"
echo "PSP-Dienstplan: Linux System Check"
echo "-------------------------------------"

# Docker Check
if ! command -v docker &> /dev/null; then
    echo "[FEHLER] Docker ist nicht installiert!"
    echo "Bitte  Docker installieren ->  curl -sSL https://get.docker.com | sh"
    exit 1
fi

# Zertifikate erstellen (falls nicht vorhanden)
if [ ! -d "$CERTS_DIR" ]; then
    mkdir -p "$CERTS_DIR"
fi

if [ ! -f "$CERTS_DIR/cert.pem" ]; then
    echo "[INFO] Generiere selbstsignierte Zertifikate für IP : $RP_IP"
    openssl req -x509 -newkey rsa:4096 -keyout "$CERTS_DIR/key.pem" -out "$CERTS_DIR/cert.pem" \
    -sha256 -days 365 -nodes -subj "/CN=$RP_IP"
fi

#  Docker Compose starten
echo "[INFO] Starte Container..."
# 
docker compose up -d

#  Healthcheck (Warten bis Nginx antwortet!!!)
echo "[INFO] Warte auf Server-Response..."
retry_count=0
max_retries=20

while [ $retry_count -lt $max_retries ]; do
    # -k für selbstsignierte Zertifikate ignorieren
    status=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost)
    
    if [ "$status" == "200" ]; then
        echo "[OK] System ist online!"
        break
    elif [ "$status" == "502" ]; then
        echo "[WAIT] Nginx bereit, Backend startet noch... ($retry_count)"
    else
        echo "[WAIT] Warte auf Netzwerk... ($status)"
    fi
    
    retry_count=$((retry_count+1))
    sleep 2
done

echo "-------------------------------------"
echo "System bereit unter: https://<VPN-IP-DES-PI>"