#!/bin/bash

# ============================================================================
# PSP-Dienstplan: Start-Script für Raspberry Pi (via LAN)
# ============================================================================

#  Pfad-Stabilität: Sicherstellen, dass Skript-Ordner verwendet wird
SCRIPT_DIR=$(dirname "$(realpath "$0")")
cd "$SCRIPT_DIR"

# FIX: IP des Pi ermitteln (Priorisiert die erste LAN-IP für das Zertifikat!!!!!!!!)
RP_IP=$(hostname -I | awk '{print $1}')
[ -z "$RP_IP" ] && RP_IP="localhost"

CERTS_DIR="./certs"

echo "-------------------------------------------------------"
echo "PSP-Dienstplan: System-Check & Startup"
echo "Erkannte Pi-IP: $RP_IP"
echo "-------------------------------------------------------"

# NEU: Installieren von curl und openSSL -> Reihenfolge
for tool in  openssl curl; do
    if ! command -v $tool &> /dev/null; then
        echo "[INFO] $tool fehlt. Installation wird gestartet..."
        sudo apt-get update && sudo apt-get install $tool -y
    fi
done

# Docker mit curl holen
if ! command -v docker &> /dev/null; then
    echo "[INFO] Docker fehlt. Installation via Get-Docker-Script..."
    curl -sSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
fi

# ==========================================================================================
# Wichtig: Selbst-Registrierung als Systemd-Service (Autostart)
# cat für Voll-automatisches Durchreichen des SERVICE_FILE    WICHTIG: Nicht nano!!!
# ==========================================================================================
SERVICE_FILE="/etc/systemd/system/psp-dienstplan.service"

if [ ! -f "$SERVICE_FILE" ]; then
    echo "[INFO] Erstelle Systemd-Service für Autostart..."
    sudo bash -c "cat > $SERVICE_FILE" <<EOF
[Unit]
Description=PSP-Dienstplan Start-Automatisierung
After=network-online.target docker.service  
Wants=network-online.target    

[Service]   
Type=oneshot
WorkingDirectory=$(pwd)
ExecStart=/bin/bash $(realpath "$0")
User=$(whoami)      
RemainAfterExit=yes   

[Install]
WantedBy=multi-user.target
EOF

    echo "[INFO] Aktiviere Service..."
    sudo systemctl daemon-reload
    sudo systemctl enable psp-dienstplan.service
    echo "[OK] Autostart wurde erfolgreich eingerichtet!"
fi





# Wichtig: Zertifikate erstellen (falls nicht vorhanden)
if [ ! -d "$CERTS_DIR" ]; then
    mkdir -p "$CERTS_DIR"
fi

# FIX: Ist IP = IP? Damit des nach dem Setup alte IP verwirft (flexibler Einsatzort)
if [ -f "$CERTS_DIR/cert.pem" ]; then
    # Extrahiert die IP (CN) aus dem vorhandenen Zertifikat
    OLD_IP=$(openssl x509 -noout -subject -in "$CERTS_DIR/cert.pem" | sed -n '/CN=/s/^.*CN=\(.*\)$/\1/p')
    
    if [ "$OLD_IP" != "$RP_IP" ]; then
        echo "[WARN] IP-Änderung erkannt! (Alt: $OLD_IP -> Neu: $RP_IP)"
        echo "[INFO] Lösche veraltete Zertifikate..."
        rm -f "$CERTS_DIR/cert.pem" "$CERTS_DIR/key.pem"
    fi
fi


# Zertifikate Erstellen
if [ ! -f "$CERTS_DIR/cert.pem" ]; then
    echo "[INFO] Generiere selbstsignierte Zertifikate für IP: $RP_IP"

    openssl req -x509 -newkey rsa:4096 -keyout "$CERTS_DIR/key.pem" -out "$CERTS_DIR/cert.pem" \
    -sha256 -days 365 -nodes -subj "/CN=$RP_IP"
    echo "[OK] Zertifikate erstellt."
   # Damit der Neustart nach löschen passiert
    RESTART_REQUIRED=true
fi

 # WICHTIG: Damit Docker neu startet (NGINX muss 'neue' certs einlesen!)
if [ "$RESTART_REQUIRED" = true ]; then
    echo "[INFO] Starte Container neu, um neue Zertifikate anzuwenden..."
    docker compose down && docker compose up -d
else  # NEU: Docker Compose starten wenn certs vorhanden und IP = IP -_-
    echo "[INFO] Starte Container..."
    docker compose up -d
fi


#  Healthcheck (Warten bis Nginx und Backend antworten !!)
echo "[INFO] Warte auf Server-Response..."
retry_count=0
max_retries=30 # NEU: Erhöht auf 30, Pi braucht beim ersten Start etwas länger 

while [ $retry_count -lt $max_retries ]; do
    # -k ignoriert die Warnung wegen des selbstsignierten Zertifikats
    status=$(curl -k -s -o /dev/null -w "%{http_code}" https://localhost)

    if [ "$status" == "200" ]; then
        echo ""
        echo "======================================================="
        echo "[OK] System ist ONLINE und über HTTPS erreichbar!"
        echo "URL: https://$RP_IP"
        echo "======================================================="
        break
    elif [ "$status" == "502" ]; then
        echo "[WAIT] Nginx bereit, Backend (Express) startet noch... ($retry_count)"
    else
        echo "[WAIT] Warte auf Netzwerk/Container... Status: $status ($retry_count)"
    fi
    
    retry_count=$((retry_count+1))
    sleep 3 # für Pi  3 Sekunden Pause zwischen Checks besser -> Longlife
done

if [ $retry_count -eq $max_retries ]; then
    echo "[FEHLER] System konnte nicht rechtzeitig starten. Prüfe 'docker compose logs'!"
fi
