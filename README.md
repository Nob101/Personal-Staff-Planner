

# Personal-Staff-Planner (PSP)

Dieses Projekt entsteht im Rahmen der Diplomarbeit an der **HTL Pinkafeld (Fachbereich Informatik)**. Es handelt sich um eine Softwarelösung zur automatisierten Dienstplanerstellung und effizienten Verwaltung von Arbeitszeiten.

##  Zielsetzung

Die Anwendung ermöglicht die Verwaltung von Mitarbeitern und Filialen (Bezirke Hartberg, Feldbach, Fürstenfeld, uvm). Unter Berücksichtigung gesetzlicher Regelungen bietet das System:

- **Intelligente Dienstplanerstellung**: Logik-Engine im Backend für automatisierte Planung mit komplexen Validierungsprozessen.
- **Flexibles Springer-Management**: Proaktive Ersatzvorschläge bei kurzfristigen Ausfällen (Krankheit, Urlaub).
- **Optimierte UX**: Konfigurierbares Farbleitsystem zur visuellen Trennung der Filialbezirke.

---

##  Projektstruktur

```

Personal-Staff-Planner/
├── .idea/                  # IntelliJ/WebStorm Projekt-Einstellungen (wird via .gitignore ignoriert)
├── Backend/                # Node.js & Express REST-API
├── Frontend/               # Vue 3 (Composition API) & Tailwind CSS
├── certs/                  # Selbstsignierte SSL-Zertifikate (HTTPS) (wird via .gitignore ignoriert)
├── postgres/               # Lokale Datenbank-Daten (wird via .gitignore ignoriert)
├── .dockerignore           # Schließt Dateien vom Docker-Build aus
├── .env                    # Umgebungsvariablen (wird via .gitignore ignoriert)
├── .env.example            # Vorlage für Umgebungsvariablen
├── .gitignore              # Schließt Dateien von Git aus
├── docker-compose.yml      # Container-Orchestrierung
├── nginx.conf              # Reverse-Proxy Konfiguration
├── gui.ps1                 # PowerShell-GUI für den System-Check
├── setup_and_run.bat       # Zentrale Start-Logik
└── run.vbs                 # Silent-Starter (verhindert CMD-Fenster)


```
---


##  Tech Stack

* **Frontend**: Vue 3, Tailwind CSS, Vite
* **Backend**: Node.js, Express, PostgreSQL
* **Infrastruktur**: Nginx (HTTPS), Docker Desktop
* **Tools**: PowerShell (GUI), OpenSSL, Bcrypt, Dotenv

---

## Datenmodell (Struktur)

Das System nutzt ein relationales PostgreSQL-Datenbanksystem. Die Struktur ist für Springer-Einsätze optimiert.

---

### Kern-Tabellen

* **filiale**: Stammdaten inkl. UI-Farbcodes.
* **mitarbeiter**: Personalstammdaten mit integriertem Stundenmodell.
* **dienstplaene**: Zentrale Planung. Unique-Constraint `(datum, mnr, fnr)` für präzise Springer-Zuweisungen.
* **stunden_konto**: Monatlicher Snapshot für den Soll/Ist-Abgleich.
* **user**: Authentifizierung via verschlüsselten Passwort-Hashes.

> **Integrität & Validierung:** `ON DELETE CASCADE` sichert die Datenkonsistenz. Die logische Prüfung der Arbeitszeitregeln erfolgt in der Validierungsschicht des Backends.

---

##  Erste Schritte (Startanleitung)

### Schneller Start (Windows)

Für den täglichen Betrieb ist **keine** manuelle Installation von Datenbanken erforderlich (Docker Desktop und aktive WSL2 vorausgesetzt):

1. **Docker Desktop** starten.
2. Die Datei **`run.vbs`** im Hauptverzeichnis per Doppelklick ausführen.
* Das System prüft die Umgebung, startet die Container und öffnet die App automatisch unter `https://localhost`.


---


### Manueller Setup (Entwickler)

Wenn du Änderungen am Schema oder den Abhängigkeiten vornimmst:

1. **Abhängigkeiten installieren**: `npm run install-all`
2. **System zurücksetzen**:
   
```bash
docker compose down -v          # Löscht alte Daten & Volumes
docker compose up --build -d    # Baut Images neu und startet im Hintergrund



### Manuelle Daten-Inserts (Testing)

Da die App initial leer ist, können Test-Filialen via Terminal angelegt werden:

docker exec -it psp_database psql -U postgres -d dienstplan -c "INSERT INTO filiale (filialname, ort, farbe) VALUES ('Hauptzentrale', 'Wien', '#3b82f6');"

```

---

## Projektteam & Rollen

* **Alexander Haupt**: Backend-Frameworks & Implementierung der Serviceschicht.
* **Lukas Atzmüller**: Datenmodellierung, Infrastruktur & Docker.
* **Oliver Bauer**: Frontend-Technologien & Kern-Anwendung.
* **Dumitru Jelezneac**: Design der Benutzeroberfläche & GUI-Komponenten.

---

##  Troubleshooting

* **Zertifikatswarnung**: Da selbstsignierte Zertifikate genutzt werden, im Browser auf "Erweitert" -> "Weiter zu localhost" klicken.
* **Encoding**: Falls das Ladefenster (`run.vbs`) seltsame Zeichen anzeigt, stelle sicher, dass die `gui.ps1` im Format **UTF-8 mit BOM** gespeichert ist.
* **Port-Belegung**: Falls der Start fehlschlägt, prüfe ob Port 443 (HTTPS) oder 5432 (Postgres) durch andere Programme belegt sind.

---

**Auftraggeber:** HTL Pinkafeld | **Betreuer:** Markus Luif



