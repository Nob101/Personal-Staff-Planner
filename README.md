# Personal-Staff-Planner

Dieses Projekt entsteht im Rahmen der Diplomarbeit an der **HTL Pinkafeld (Fachbereich Informatik)**. Es handelt sich um eine Softwarelösung zur automatisierten Dienstplanerstellung und effizienten Verwaltung von Arbeitszeiten.

##  Zielsetzung

Die Anwendung ermöglicht die Verwaltung von Mitarbeitern und Filialen (Bezirke Hartberg, Feldbach, Fürstenfeld, uvm). Unter Berücksichtigung gesetzlicher Regelungen und individueller Kapazitäten bietet das System:

- **Intelligente, automatische Dienstplanerstellung**: Das System verfügt über eine im Backend implementierte Logik-Engine, die eine automatisierte Dienstplanerstellung ermöglicht. Dabei werden komplexe Validierungsprozesse direkt während der Generierung durchgeführt.
- **Flexible Anpassungen**: Bei kurzfristigen Ausfällen (Krankheit, Urlaub) auf den Springer-Pool und liefert geeignete Vorschläge für den Ersatz
- **Ersatzvorschläge**: Das System schlägt proaktiv verfügbare Mitarbeiter vor, die für den jeweiligen Standort qualifiziert sind.
- **Optimierte UX für Multi-Filial-Betrieb**: Durch ein konfigurierbares Farbleitsystem  können Nutzer jede Filiale individuell Farben zuweisen.Dies ermöglicht eine intuitive visuelle Trennung der Bezirke und minimiert das Risiko von Fehlbuchungen.

---

##  Projektstruktur

```

Personal-Staff-Planner/
├── .github/                # GitHub-Infrastruktur (Dependabot & CI/CD Pipelines)
│   ├── workflows/
│   │   └── release.yml      # GitHub Actions Pipeline für automatisierte SemVer-Releases
│   └── dependabot.yml      # Automatisierte Paket-Updates für Frontend, Backend & Docker
├── .idea/                  # IntelliJ/WebStorm Projekt-Einstellungen (wird via .gitignore ignoriert)
├── Backend/                # Node.js & Express REST-API / Datenbank-Aufbau
├── Frontend/               # Vue 3 (Composition API) & Tailwind CSS
├── certs/                  # Selbstsignierte SSL-Zertifikate (HTTPS) (wird via .gitignore ignoriert)
├── postgres/               # Lokale Datenbank-Daten (wird via .gitignore ignoriert)
├── .dockerignore           # Schließt Dateien vom Docker-Build aus
├── .env                    # Umgebungsvariablen (wird via .gitignore ignoriert)
├── .env.example            # Vorlage für Umgebungsvariablen
├── .gitignore              # Schließt Dateien von Git aus
├── docker-compose.yml      # Container-Orchestrierung
├── nginx.conf              # Reverse-Proxy Konfiguration
├── NOTICE                   # Rechtliche Hinweise zu Drittanbieter-Lizenzen
├── README.md                # Projektdokumentation
├── release.config.js        # Konfiguration für Semantic Release (Conventional Commits)
├── gui.ps1                 # PowerShell-GUI für den System-Check
├── run.vbs                 # Silent-Starter (verhindert CMD-Fenster)
├── setup_and_run.bat       # Zentrale Start-Logik
├── start-linux.sh           # Start-Skript für Linux-Systeme (z. B. Raspberry Pi)
└── start-mac.sh             # Start-Skript für macOS-Umgebungen



```
---

<h1>NEUHEITEN</h1>

# Wichtig!: Git Commit Regeln (Semantic Release)

Um automatisierte Releases, Versions-Tags (z. B. v1.0.1) und Changelogs zu generieren, ist jetzt Semantic Release auf Basis von Conventional Commits integriert. 

> [!INFO]

> Diese Regeln haben **keinen** Einfluss auf den Code selbst! Sie steuern lediglich die automatische Versionsnummer. Jede Commit-Message muss diesem Format folgen, damit die Pipeline fehlerfrei läuft. Bei nicht einhaltung wird lediglich die versionierung Ignoriert.


### Auswirkung auf die Versionsnummer (Beispiel ausgehend von v1.0.0):

* **Bugfix / Patch** (`v1.0.1`) – Erhöht die letzte Stelle:
  `git commit -m "fix(frontend): farbcode korrigiert"`
  `git commit -m "fix(backend): validierung fuer stunden korrigiert"`

* **Minor / Feature** (`v1.1.0`) – Erhöht die mittlere Stelle:
  `git commit -m "feat(backend): algorithmus fuer springer-pool hinzugefuegt"`
  `git commit -m "feat(frontend): neue tabellenansicht fuer oliver"`

* **Major / Breaking Change** (`v2.0.0`) – Erhöht die erste Stelle (Große, nicht abwärtskompatible Änderungen):
  `git commit -m "feat(db)!: tabellenstruktur fuer dienstplan komplett umgestellt"`

* **Kein Release** (`v1.0.0`) – Dokumentation oder Refactoring ohne Auswirkung für den Nutzer:
  `git commit -m "docs(readme): commit regeln ergaenzt"`
  `git commit -m "chore: formatting angepasst"`


---

# Wichtig!: Dependabot Workflow
>[!INFO]

> Dies verhindert veraltete Softwarestände und schützt die Anwendung vor bekannten Angriffsvektoren.

Über die Konfigurationsdatei `.github/dependabot.yml` ist der GitHub Dependabot fest in die CI/CD-Pipeline integriert. 
* **Funktionsweise:** Das Tool scannt in regelmäßigen Intervallen die Abhängigkeiten im `Backend/` (package.json) und `Frontend/` (package.json) sowie die verwendeten Basis-Images in der `docker-compose.yml`.
* **Nutzen:** Sobald Sicherheitslücken (CVEs) oder Updates für genutzte Bibliotheken vorliegen, erstellt Dependabot automatisch Pull Requests. 


---

# Wichtig!: Watchtower Container 
>[!INFO]

>Während Dependabot den Quellcode vor dem Deployment absichert, übernimmt **Watchtower** die automatisierte Wartung der bereits laufenden Docker-Container auf dem Zielserver (z. B. dem Raspberry Pi).

* **Funktionsweise:** Watchtower läuft als isolierter Hintergrunddienst innerhalb der Container-Infrastruktur. Er kommuniziert direkt über den Docker-Socket (`docker.sock`) und gleicht die Hashes der lokal ausgeführten Images mit der Remote-Registry ab.
* **Sicherheits- & Ressourcen-Features:** 
  * `WATCHTOWER_LABEL_ENABLE=true`: Watchtower aktualisiert ausschließlich Container, die explizit über das Label `com.centurylinklabs.watchtower.enable=true` dafür freigegeben wurden. Dies verhindert unvorhergesehene Breaking Changes an kritischen Core-Diensten während des Betriebs.
  * `WATCHTOWER_CLEANUP=true`: Nach einem erfolgreichen Update werden alte, ungenutzte Image-Fragmente sofort von der Festplatte gelöscht, um den Speicherplatz des Host-Systems (insbesondere bei embedded Systemen wie dem Raspberry Pi) zu schonen.


---

##  Tech Stack

* **Frontend**: Vue 3, Tailwind CSS, Vite
* **Backend**: Node.js, Express, PostgreSQL
* **Infrastruktur**: Nginx (HTTPS), Docker Desktop
* **Tools**: PowerShell (GUI), OpenSSL, Bcrypt, Dotenv



---

##  Projektteam & Rollen

### Backend-Bereich

* **Alexander Haupt**: Backend-Frameworks, Algorithmus & Implementierung der Serviceschicht.
* **Lukas Atzmüller**: Datenmodellierung, Infrastruktur & Docker Setup.

### Frontend-Bereich
* **Oliver Bauer**: Frontend-Technologien & Kern-Anwendung.
* **Dumitru Jelezneac**: Design der Benutzeroberfläche & GUI-Komponenten.

---

**Lukas: Notizbereich Datenbank-Struktur**
## Datenmodell (Struktur)

Das System nutzt ein relationales PostgreSQL-Datenbanksystem. Die Struktur ist für Springer-Einsätze optimiert.

---

### Kern-Tabellen

* **filiale**: Stammdaten inkl. UI-Farbcodes.
* **mitarbeiter**: Personalstammdaten mit integriertem Stundenmodell.
* **dienstplaene**: Zentrale Planung. Unique-Constraint `(datum, mnr, fnr)` für präzise Springer-Zuweisungen.
* **stunden_konto**: Monatlicher Snapshot für den Soll/Ist-Abgleich.
* **users**: Authentifizierung via verschlüsselten Passwort-Hashes.

> **Integrität & Validierung:** `ON DELETE CASCADE` sichert die Datenkonsistenz. Die logische Prüfung der Arbeitszeitregeln erfolgt in der Validierungsschicht des Backends.

---

<h3>Setup Anleitung</h3>

>**Wichtig!**
> Unter Windows muss WSL2 aktiv sein (Windows Subsystem for Linux) und
> Docker Desktop muss installiert sein. Sowie OpenSSL (meist über Git Bash bereits im System-Pfad verfügbar)



---

### Manueller Setup 

Wenn Änderungen am Schema oder den Abhängigkeiten vorgenommen werden:

1. **Abhängigkeiten installieren**: `npm run install-all`
2. **System zurücksetzen**:
   
```bash
docker compose down -v          # Löscht alte Daten & Volumes
docker compose up --build -d    # Baut Images neu und startet im Hintergrund


# Wichtig: Manuelle Daten-Inserts (Testing) #
# Da wir keine Mock-Daten mehr verwenden, ist die App beim ersten Start (ohne Seeds) leer. Du kannst Test-Filialen manuell via Terminal anlegen, damit danach Mitarbeiter erstellt werden können!!! (wegen der Pflicht-Verknüpfung):


Da die App initial leer ist, können Test-Filialen via Terminal angelegt werden:

docker exec -it psp_database psql -U postgres -d dienstplan -c "INSERT INTO filiale (filialname, ort, farbe) VALUES ('Hauptzentrale', 'Wien', '#3b82f6');"

```

##  Troubleshooting

* **Zertifikatswarnung**: Da selbstsignierte Zertifikate genutzt werden, im Browser auf "Erweitert" -> "Weiter zu localhost" klicken.
* **Encoding**: Falls das Ladefenster (`run.vbs`) seltsame Zeichen anzeigt, stelle sicher, dass die `gui.ps1` im Format **UTF-8 mit BOM** gespeichert ist.
* **Port-Belegung**: Falls der Start fehlschlägt, prüfe ob Port 443 (HTTPS) oder 5432 (Postgres) durch andere Programme belegt sind.

---


## Erste Schritte

### Installation
Um alle notwendigen Abhängigkeiten für das gesamte Projekt (Root, Frontend und Backend) zu installieren:

npm run install-all

---

### Datenbank & Container starten
Damit die App funktioniert, müssen die Docker-Container laufen.

Wichtig: Wenn du neue Seeds (Testdaten) oder Änderungen am Schema (Tabellen-Struktur) gepullt hast, muss  die Datenbank einmalig "plattgemacht" werden. Nur so wird die Initialisierung neu getriggert:

***Stoppt Container und löscht die alten Daten (Volumes)***
docker compose down -v 

***Startet die Container neu und baut das Backend/Datenbank frisch auf***
docker compose up --build

---

**Applikation starten**
Dank concurrently startest du Backend und Frontend gleichzeitig mit einem Befehl:**

npm run dev



___Daten überprüfen___

```

-Filialen anzeigen
docker exec -it psp_database psql -U postgres -d dienstplan -c "SELECT * FROM filiale;"

-Mitarbeiter anzeigen
docker exec -it psp_database psql -U postgres -d dienstplan -c "SELECT * FROM mitarbeiter;"

```


***Troubleshooting***

``Projekt stoppen``

Um die laufenden Server im Terminal zu beenden: Strg + C (Windows/Linux) bzw. Cmd + C (macOS).

Um die Docker-Container sauber herunterzufahren (ohne die Daten zu löschen):

---
**Auftraggeber:** HTL Pinkafeld | **Auftraggeber:** Markus Luif
