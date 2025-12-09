# Backend-Struktur

- server.js: Startet Express, bindet Routen ein
- routes/
  - mitarbeiter.js: CRUD für Mitarbeiter
  - filialen.js: Filialen + Mitarbeiter der Filiale
  - dienstplan.js: Dienstplan-Preview (noch POC)
- functions/
  - fileStore.js: JSON lesen/schreiben
  - dateUtils.js: Tage im Monat, Arbeitstage, Monatsstunden
- services/
  - mitarbeiterService.js: Mitarbeiter nach Filiale filtern
- data/
  - *.json: POC-Daten, ersetzen später DB
