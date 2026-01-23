# Personal-Staff-Planner

Dieses Projekt entsteht im Rahmen der Diplomarbeit an der **HTL Pinkafeld (Fachbereich Informatik)**. Es handelt sich um eine Softwarelösung zur automatisierten Dienstplanerstellung und effizienten Verwaltung von Arbeitszeiten.

## 🎯 Zielsetzung

Die Anwendung ermöglicht die Verwaltung von Mitarbeitern und Filialen (Bezirke Hartberg, Feldbach, Fürstenfeld, uvm). Unter Berücksichtigung gesetzlicher Regelungen und individueller Kapazitäten bietet das System:

- **Intelligente, automatische Dienstplanerstellung**: Das System verfügt über eine im Backend implementierte Logik-Engine, die eine automatisierte Dienstplanerstellung ermöglicht. Dabei werden komplexe Validierungsprozesse direkt während der Generierung durchgeführt.
- **Flexible Anpassungen**: Bei kurzfristigen Ausfällen (Krankheit, Urlaub) auf den Springer-Pool und liefert geeignete Vorschläge für den Ersatz
- **Ersatzvorschläge**: Das System schlägt proaktiv verfügbare Mitarbeiter vor, die für den jeweiligen Standort qualifiziert sind.
- **Optimierte UX für Multi-Filial-Betrieb**: Durch ein konfigurierbares Farbleitsystem  können Nutzer jede Filiale individuell Farben zuweisen.Dies ermöglicht eine intuitive visuelle Trennung der Bezirke und minimiert das Risiko von Fehlbuchungen.

---

## 🏗 Projektstruktur

Das Projekt folgt einer modernen Web-Architektur:
- **Frontend**: Vue 3 (Composition API) mit Tailwind CSS für ein responsives Design.
- **Backend**: Node.js & Express REST-API zur Bereitstellung der Geschäftslogik.
- **Datenbank**: Relationales PostgreSQL-System zur Sicherstellung der Datenintegrität.

---


## 📊 Datenmodell (Struktur) -Optimierte Version

Das System nutzt ein relationales PostgreSQL-Datenbanksystem. Die Struktur wurde im Vergleich zum ersten Entwurf für eine höhere Flexibilität (Springer-Einsätze) angepasst.

### Kern-Tabellen
- **filiale**: Stammdaten der Standorte inklusive UI-Metadaten (Farbcodes).
- **mitarbeiter**: Personalstammdaten mit integriertem Stundenmodell (`counter`, `arbeitnehmertyp`).
- **dienstplaene**: Zentrale Planungstabelle. Der Unique-Constraint `(datum, mnr, fnr)` ermöglicht präzise Springer-Zuweisungen (Einsätze in verschiedenen Filialen am selben Tag).
- **stunden_konto**: Dient als monatlicher Snapshot für den Soll/Ist-Abgleich der Arbeitsstunden.

### Integrität & Sicherheit
- **Cascading Deletes**: Durch `ON DELETE CASCADE` wird sichergestellt, dass bei Löschung eines Mitarbeiters alle verknüpften Kontakt- und Erreichbarkeitsdaten konsistent entfernt werden.
- **Validierung**: Die Logikschicht des Backends prüft tagesübergreifende Arbeitszeitregeln, da die Datenbankebene bewusste Flexibilität für Mehrfacheinträge (Springer) lässt.
- **Authentifizierung**: Der Zugriffsschutz erfolgt über gesicherte Benutzerkonten mit verschlüsselten Passwort-Hashes (`bcrypt`).

---

## 👥 Projektteam & Rollen

### Backend-Bereich

- **Alexander Haupt**: Evaluierung der Backend-Frameworks & Implementierung der Serviceschicht.
- 
- **Lukas Atzmüller**: Evaluierung der Datenbanksysteme, Datenmodellierung & Infrastruktur.

### Frontend-Bereich
- **Oliver Bauer**: Evaluierung der Frontend-Technologien & Implementierung der Kern-Anwendung.
- 
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

**Voraussetzung**
- Installiertes PostgreSQL (Lokal oder via Docker)
- Node.js Umgebung

<h2>Notiz: Setup muss an Finale version Angepasst werden start_projekt.bat</h2>

### Setup
1. **Abhängigkeiten installieren**: `npm run install-all`
2. **Datenbank-Initialisierung**: Erstellen Sie eine Datenbank namens `dienstplan`.
3. **Umgebungsvariablen**: Erstellen Sie eine `.env` Datei im Backend-Verzeichnis basierend auf der `.env.example`.
4. **Start der Applikation**: `npm run dev` (Startet Frontend und Backend simultan).

**Troubleshooting**
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
    algorithmid       Integer


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
    counter                     Integer
    wochenstunden_vertrag       Integer (NOT NULL)
    arbeitnehmertyp             Integer (Default: 40)
    springeralgorithmid         INTEGER
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




tabelle mitarbeiter_arbeitet_in_filiale 
    mnr               INTEGER  (FK -> mitarbeiter)
    fnr               INTEGER  (FK -> filiale)
    (PK: mnr, fnr)



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
    aktualisiert_am   Timestamp (Default: now())

    CONSTRAINT dienstplaene_unique_mnr_pro_tag (Unique datum, mnr, fnr)


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

***Wichtig: Manuelle Daten-Inserts (Testing)***
Da wir keine Mock-Daten mehr verwenden, ist die App beim ersten Start (ohne Seeds) leer. Du kannst Test-Filialen manuell via Terminal anlegen, damit danach Mitarbeiter erstellt werden können!!! (wegen der Pflicht-Verknüpfung):


___Testfilialen___

``docker exec -it psp_database psql -U postgres -d dienstplan -c "INSERT INTO filiale (filialname, ort, farbe) VALUES ('Hauptzentrale', 'Wien', '#3b82f6');"``

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
