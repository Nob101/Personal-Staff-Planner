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

**Lukas: Notizbereich Allgemein**
````
Demo Version
Tabelle mitarbeiter
Spalten:
    Mnr (PK)        Integer
    Vorname         string
    Nachname        string
    Fkurzl          string 
    Akurzl          string 
    Counter         Integer

Tabelle filiale
Spalten:
    Fnr (PK)        Integer
    Fkurzl (unique) string
    Strasse         string
    PLZ             string
    Ort             string
    Land            string
    telefon         string
    email           string

Tabelle mitarbieter_arbeitet_in_Filiale
Spalte:
    Mnr            Integer
    Fnr            Integer

Tabelle arbietstyp      (wird mit einem Insert direkt befüllt)
Spalte:
    Akurzl         string
    Text           string  


Tabelle mitarbeiter_kontakt
Spalten:
    Knr (PK)       Integer
    Mnr            Integer
    Strasse         string
    PLZ             string
    Ort             string
    Land            string


Tabelle mitarbieter_telefon
Spalte:
    Mnr            Integer
    telefon_typ    string   --telefon 1, telefon 2, etc.
    nummer         string   --nummer 1, nummer 2, etc.

Tabelle mitarbieter_email
Spalte:
    Mnr            Integer
    email_typ      string   --email 1, email 2, etc.
    email_adresse  string   --adresse 1, adresse 2, etc.


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
