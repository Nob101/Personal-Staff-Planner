# Personal-Staff-Planner
Im Rahmen der Diplomarbeit für die HTL Pinkafeld;
Abschluss relevant;





**Alexander: Notizbereich Allgemein**
````
routen/mitarbeiter:
api/mitarbeiter //GET gibt alle mitarbeiter zurück
api/mitarbeiter/:mnr //GET einen mitarbeiter mit der gegeben id
api/mitarbeiter   //POST erstellt einen neuen Mitarbeiter
api/mitarbeiter/:mnr //PUT aktualisiert den Mitarbeiter mit der id
api/mitarbeiter/:mnr // DELETE löscht den Mitarbeiter mit der eingegeben id
 
````

**Lukas: Notizbereich Datenbank-Struktur**

> **Info!**
> __Integrität:__ ON DELETE CASCADE stellt sicher, dass alle Mitarbeiterdaten automatisch gelöscht werden.
> __Springer-Logik:__ Das Design erlaubt mehrere Schichten pro Tag/Mitarbeiter in unterschiedlichen Filialen. (<i>Performance via Counter</i>)
> __Dienstplanung:__ Zentrale Tabelle für Schichtzuweisungen; ein Unique-Constraint verhindert doppelte Einträge und sichert die logische Korrektheit der Tagesplanung.

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

Tabelle algorithmen
Spalten:
    id (PK)           Integer
    name              string
    stunden           Integer (Default: 9)

Tabelle algorithmus_muster
Spalten:
    id (PK)           Integer
    algorithmus_id    Integer (FK -> algorithmen)
    reihenfolge       Integer
    akurzl            string (FK -> arbeitstyp)



Tabelle mitarbeiter
Spalten:
    mnr (PK)          Integer
    vorname           string
    nachname          string
    fkurzl            string (FK -> filiale)
    akurzl            string (FK -> arbeitstyp)
    counter           Integer (Default: 0)
    hauptfiliale_fnr  Integer (FK -> filiale)
    stunden_soll      Integer (Default: 160)
    springer          Boolean (Default: FALSE)
    algorithmus_id    Integer (FK -> algorithmen)

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

Tabelle mitarbeiter_arbeitet_in_Filiale (N:M)
Spalten:
    mnr               Integer (FK -> mitarbeiter)
    fnr               Integer (FK -> filiale)
    (PK: mnr, fnr)

Tabelle dienstplaene
Spalten:
    id (PK)           Integer
    jahr              Integer
    monat             Integer
    datum             Date
    mnr               Integer (FK -> mitarbeiter)
    fnr               Integer (FK -> filiale)
    schicht_typ       string (FK -> arbeitstyp)
    anmerkung         string
    erstellt_am       Timestamp (Default: now())
    (Unique: datum, mnr, fnr, schicht_typ)

````

**Oliver: Notizbereich Allgemein**
 
 ````
# Projektstruktur – Vue 3 Frontend

src/
 ├─ assets/                            # Bilder, Icons, Fonts, Stylesheets etc.
 │    ├─ images/
 │    ├─ icons/
 │    └─ styles/
│
├─ views/
│   ├─ MitarbeiterView.vue       # Container für /mitarbeiter Route
│   ├─ FilialView.vue            # Container für /filialen Route
│   └─ ...                       
│
 ├─ components/
 │   ├─ global/                        # Globale Komponenten die mehrmals verwendet werden               
 │   │    ├─ Navbar.vue
 │   │    ├─ ModalBase.vue (allg. Modalvorlage)
 │   │    ├─ ModalConfirmDelete.vue (allgemeines Löschbestätigungs Modal)
 │   │    ├─ InputField.vue (allgemeine Inputfeldvorlage)
 │   │    └─ ButtonPrimary.vue (allg. Buttonvorlage)
 │
 │   ├─ mitarbeiter/                   # Alle Mitarbeiter-Komponenten   
 │   │    ├─ MitarbeiterActionBar.vue
 │   │    ├─ MitarbeiterList.vue
 │   │    ├─ MitarbeiterCard.vue
 │   │    ├─ ModalMitarbeiterCreate.vue
 │   │    ├─ ModalMitarbeiterEdit.vue (Button in MitarbeiterCard)
 │   │    └─ nutzt ModalConfirmDelete.vue (Button in MitarbeiterCard)
 │
 │   ├─ filialen/                      # Alle Filialen-Komponenten   
 │   │    ├─ FilialActionBar.vue
 │   │    ├─ FilialList.vue
 │   │    ├─ FilialCard.vue
 │   │    ├─ ModalFilialCreate.vue
 │   │    ├─ ModalFilialEdit.vue (Button in FilialenCard)
 │   │    └─ nutzt ModalConfirmDelete.vue (Button in FilialenCard)
 │   └─ ...

````

**Dumitru: Notizbereich Allgemein**
````

````








Auftraggeber: 
-HTL Pinkafeld [Fachbereich Informatik]
-Markus Luif 
`Dienstplan_verwaltungs_programm/service;`


__Backend-Bereich__
<u>Alexander Haupt:</u>
Evaluierung verschiedener Backend
Frameworks sowie Implementierung 
von großen Teilen der Serviceschicht

<u>Lukas Atzmüller:</u>
Evaluierung verschiedener 
Datenbanksysteme, Erstellung des 
Datenmodells sowie 
Implementierung der Infrastruktur


__Frontend-Bereich__
<u>Oliver Bauer:</u>
Evaluierung verschiedener Frontend
Technologien sowie die 
Implementierung des Frontends

<u>Dumitru Jelezneac:</u>
Evaluierung verschiedener Frontend
Design-Frameworks; Design der 
Benutzeroberfläche sowie 
Implementierung von Teilen der GUI 


<u>___Zielsetzung:___</u>

````

Eine Softwarelösung zur automatischen Dienstplan Erstellung und der effizienten 
Verwaltung der Arbeitszeiten einzelner Mitarbeiter und den jeweils zugehörigen Filialen in 
den Bezirken, Hartberg, Feldbach und Fürstenfeld. Die Anwendung soll, unter 
Berücksichtigung gesetzlicher Regelungen, der Monatsstunden und der Verfügbarkeit 
einzelner Mitarbeiter flexible Anpassungen ermöglichen. Zudem soll die Software im 
Ausfall und/oder Fernbleibens eines Mitarbeiters, zum Beispiel Krankheitsfall oder Urlaub 
automatisch Ersatzmitarbeiter vorschlagen und sich flexibel an Änderungen anpassen. 

````
