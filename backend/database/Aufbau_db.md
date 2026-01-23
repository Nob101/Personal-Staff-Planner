
<h2>Architekur-Aufbau für die Datenbank</h2>

**In dem Ordner 'schema' sind:**
-reine SQL Scripte welche die tabellen und Datenstruktur definieren

**In dem ordner 'functions' sind:**
-eigene funktionen, welche für die individuelle Abfragen/verarbeitungen verantwortlich sind


<u>___Wichtig___</u>

`Um Backend-code und Datenbankcode klar zu trennen.`



<h4>Was als nächstes kommt</h4>


````

Erstellen und Aufabu der Demo DB für erste Testzwecke
(Minimal)


````
`[Wichtig!! performance berücksichtigen]`



__Ablauf vom Aufruf der DB im JS__
````
-Der Aufruf zum Erstellen der DB erfolgt über eine HTTP-Route im Backend.
-Im Backend wird die DB per SQL-Befehl erstellt.
-JavaScript im Backend (Node.js) verwaltet die DB-Verbindung und SQL-Ausführung.
-Das Frontend ruft über fetch() eine Backend-URL auf, um die DB zu erstellen.



<h3> Notiz</h3>

__1.)__ Tabellen müssen an ER-Modell angepasst werden
__2.)__ ER-Modell muss AG Anforderungen/Vorgaben entsprechen
__3.)__ Route -> Port identisch!
__4.)__ Create Database in JavaScript und/oder postgresdirekt (PSP.db vielleicht)
__5.)__ DML Befehle in ein Extra File
