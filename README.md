# Personal-Staff-Planner

Dieses Projekt entsteht im Rahmen der Diplomarbeit an der **HTL Pinkafeld (Fachbereich Informatik)**. Es handelt sich um eine Softwarelösung zur automatisierten Dienstplanerstellung und effizienten Verwaltung von Arbeitszeiten.

## 🎯 Zielsetzung

Die Anwendung ermöglicht die Verwaltung von Mitarbeitern und Filialen (Bezirke Hartberg, Feldbach und Fürstenfeld). Unter Berücksichtigung gesetzlicher Regelungen, Monatsstunden und individueller Verfügbarkeiten bietet das System:
- **Automatische Dienstplanerstellung**
- **Flexible Anpassungen** bei Ausfällen (Krankheit, Urlaub)
- **Ersatzvorschläge** für fehlendes Personal

---

## 🏗 Projektstruktur

Das Projekt ist in ein **Backend (Express/Node.js)** und ein **Frontend (Vue 3)** unterteilt.

### Backend API (`/backend`)
Die Kommunikation erfolgt über eine REST-API:
- `GET /api/mitarbeiter` – Alle Mitarbeiter abrufen
- `GET /api/mitarbeiter/:mnr` – Einzelnen Mitarbeiter abrufen
- `POST /api/mitarbeiter` – Neuen Mitarbeiter erstellen
- `PUT /api/mitarbeiter/:mnr` – Mitarbeiter aktualisieren
- `DELETE /api/mitarbeiter/:mnr` – Mitarbeiter löschen

### Frontend (`/Frontend`)
Das Frontend basiert auf **Vue 3** mit einer komponentenbasierten Architektur:
- `src/views/` – Hauptansichten (MitarbeiterView, FilialView)
- `src/components/global/` – Wiederverwendbare Basis-Komponenten (Modals, Inputs, Buttons)
- `src/components/mitarbeiter/` & `filialen/` – Fachspezifische Komponenten

---

## 📊 Datenmodell (Auszug)

Das System nutzt ein relationales Datenbanksystem mit folgenden Kern-Tabellen:
- **mitarbeiter**: Stammdaten (PK: Mnr, Vorname, Nachname, etc.)
- **filiale**: Standortinformationen (PK: Fnr, PLZ, Ort, etc.)
- **mitarbeiter_arbeitet_in_Filiale**: Verknüpfung zwischen Personal und Standorten
- **arbeitstyp**: Definition der Arbeitsmodelle
- **mitarbeiter_kontakt/telefon/email**: Detailinformationen zur Erreichbarkeit

---

## 👥 Projektteam & Rollen

### Backend-Bereich
- **Alexander Haupt**: Evaluierung der Backend-Frameworks & Implementierung der Serviceschicht.
- **Lukas Atzmüller**: Evaluierung der Datenbanksysteme, Datenmodellierung & Infrastruktur.

### Frontend-Bereich
- **Oliver Bauer**: Evaluierung der Frontend-Technologien & Implementierung der Kern-Anwendung.
- **Dumitru Jelezneac**: Design der Benutzeroberfläche & Implementierung der GUI-Komponenten.

---

## 🛠 Tech Stack
- **Frontend**: Vue 3, Tailwind CSS, Vite
- **Backend**: Node.js, Express, PostgreSQL (`pg`)
- **Tools**: Nodemon, Dotenv, Cors, Bcrypt

---

## 🚀 Erste Schritte

### Installation
Um alle notwendigen Abhängigkeiten für das gesamte Projekt (Root, Frontend und Backend) zu installieren, führen Sie folgenden Befehl im Hauptverzeichnis aus:

npm run install-all

### Projekt starten
Dank `concurrently` können sowohl das Backend als auch das Frontend mit einem einzigen Befehl gleichzeitig gestartet werden.

**Entwicklungsmodus (mit Hot-Reload):**

npm run dev

*Dies startet das Vue-Frontend via Vite und den Express-Server via Nodemon.*

**Standard-Start:**

npm start

### Projekt stoppen
Um die laufenden Server und Prozesse zu beenden, nutzen Sie im Terminal die Tastenkombination:
`Strg + C` (Windows/Linux) bzw. `Cmd + C` (macOS).

---
**Auftraggeber:** HTL Pinkafeld | **Betreuer:** Markus Luif
