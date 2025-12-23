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

**Lukas: Notizbereich Datenbank-Struktur**

> **Info!**
> __Integrität:__ ON DELETE CASCADE stellt sicher, dass alle Mitarbeiterdaten automatisch gelöscht werden.
> __Springer-Logik:__ Das Design verzichtet bewusst auf einen `UNIQUE`-Constraint über (Datum, Mitarbeiter). Dies ermöglicht es, Mitarbeiter am selben Tag in mehreren Filialen einzuteilen (z.B. Vormittag Filiale A, Nachmittag Filiale B) oder mehrere Schicht-Typen zu hinterlegen.
> __Dienstplanung:__ Zentrale Tabelle für Schichtzuweisungen; ein Unique-Constraint verhindert doppelte Einträge und sichert die logische Korrektheit der Tagesplanung.
> __Stunden-Berechnung:__ Die Spalte `wochenstunden_vertrag` ist das Führungsfeld. Das `stunden_konto` dient als monatlicher 'Snapshot' (Soll/Ist/Differenz), um die Performance-historie zu sichern, ohne bei jeder Abfrage das gesamte Jahr neu berechnen zu müssen.
> __Arbeits-Validierung:__ Da die Datenbank Mehrfacheinträge erlaubt, liegt die logische Prüfung (z.B. "Hat der Mitarbeiter an Tag X insgesamt zu viele Stunden?") in der Validierungsschicht des Backends.

---

<h3>Setup Anleitung</h3>

**Einmalig**
___Installation:___ Ladet PostgreSQL von `postgresql.org/download` herunter und installiert es.
___WICHTIG:___ Das Passwort, das ihr bei der Installation für den User postgres vergebt, ist das `DB_PASSWORD`. Merken!
___DB anlegen:___ Öffne pgAdmin 4, Rechtsklick auf "Databases" -> "Create" -> "Database". Name: `dienstplan` (Muss exakt so heißen).
___Im Backend-ordenr:___ `npm install` ausführen
___Umgebungsvariablen:___  Kopiert die Datei .env.example. und bennent sie um in `.env` ohne name oder Ähnliches und tragt das lokale Postgres passwort in  `DB_PASSWORD` ein.

>Wenn Postgres nicht startet: mit windowstast + r nach services.msc suchen; und in der liste zu postgres scrollen [starten, beenden, neustarten] Näheres steht in der .env.example Datei

---

---

<h3>Setup Anleitung</h3>

**Einmalig**
___Installation:___ Ladet PostgreSQL von `postgresql.org/download` herunter und installiert es.
___WICHTIG:___ Das Passwort, das ihr bei der Installation für den User postgres vergebt, ist das `DB_PASSWORD`. Merken!
___DB anlegen:___ Öffne pgAdmin 4, Rechtsklick auf "Databases" -> "Create" -> "Database". Name: `dienstplan` (Muss exakt so heißen).
___Im Backend-ordenr:___ `npm install` ausführen
___Umgebungsvariablen:___  Kopiert die Datei .env.example. und bennent sie um in `.env` ohne name oder Ähnliches und tragt das lokale Postgres passwort in  `DB_PASSWORD` ein.

>Wenn Postgres nicht startet: mit windowstast + r nach services.msc suchen; und in der liste zu postgres scrollen [starten, beenden, neustarten] Näheres steht in der .env.example Datei

---

````


Tabelle filiale
Spalten:
    fnr (PK)          Integer
    filialname        string
    fkurzl (unique)   string
    strasse           string
    plz               string
    ort               string
    land              string (Default: 'Österreich')
    telefon           string
    email             string
    farbe             string (Default: '#3498db')


Tabelle arbeitstyp      (Wird mit einem Insert direkt befüllt)
Spalten:
    akurzl (PK)       string
    text              string  




Tabelle mitarbeiter
Spalten:
    mnr (PK)                    Integer
    vorname                     string
    nachname                    string
    hauptfiliale_fnr            integer (FK -> filiale)
    wochenstunden_vertrag       Integer (NOT NULL)
    springer                    Boolean (Default: FALSE)


Tabelle mitarbeiter_kontakt
Spalten:
    knr (PK)          Integer
    mnr               Integer (FK -> mitarbeiter, ON DELETE CASCADE)
    strasse           string
    plz               string
    ort               string
    land              string

Tabelle mitarbeiter_telefon
Spalten:
    mnr               Integer (FK -> mitarbeiter, ON DELETE CASCADE)
    telefon_typ       string  -- telefon 1, telefon 2, etc.
    nummer            string  -- nummer 1, nummer 2, etc.
    (PK: mnr, telefon_typ)

Tabelle mitarbeiter_email
Spalten:
    mnr               Integer (FK -> mitarbeiter, ON DELETE CASCADE)
    email_typ         string  -- email 1, email 2, etc.
    email_adresse     string  -- adresse 1, adresse 2, etc.
    (PK: mnr, email_typ)



Tabelle stunden_konto
Spalten:
    id (PK)                 Integer
    mnr                     Integer (FK -> mitarbeiter)
    jahr                    Integer
    monat                   Integer
    soll_stunden_monat      integer
    ist_stunden_monat       Integer 
    differenz               Integer
    (Unique mnr, jahr, monat)



Tabelle dienstplaene
Spalten:
    id (PK)           Integer
    jahr              Integer
    monat             Integer
    datum             Date
    mnr               Integer (FK -> mitarbeiter)
    fnr               Integer (FK -> filiale)
    schicht_typ       string (FK -> arbeitstyp)
    anmerkung         String
    erstellt_am       Timestamp (Default: now())


Tabelle user
    id (PK)         Integer
    username        String (UNIQUE)
    password_hash   String
    role            String (Default 'user')

````


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
**Auftraggeber:** HTL Pinkafeld | **Auftraggeber:** Markus Luif
