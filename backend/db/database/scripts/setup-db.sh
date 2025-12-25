# Aktuell nicht mehr nötig (Docker) bleibt aber zur Einsicht bestehen
#--Lukas
# [alternativer installationsweg zu node.js]



# Zum Starten der fertgien Softwarelösung auf 
# dem Rechner unseres AGs
#



# entweder über das Terminal auf dem Rechner starten
# oder alternativ eine Ausführbare Datei(installer) abuen
# die intern das bash-script startet  Zum Beispiel [node.js-Script]


# Beispiel code
#!/bin/bash



# Variablen für die DB-Verbindung
DB_NAME="diesntplan"
DB_USER="markus"

# Prüfen, ob die DB existiert
DB_EXISTS=$(psql -U $DB_USER -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")

if [ "$DB_EXISTS" != "1" ]; then
  echo "Datenbank $DB_NAME existiert nicht. Erzeuge neue DB..."
  createdb -O $DB_USER $DB_NAME
else
  echo "Datenbank $DB_NAME existiert bereits."
fi


# SQL-Skripte nacheinander ausführen
psql -d $DB_NAME -f ./database/schema/create_tables.sql
#usw.
psql -d $DB_NAME -f ./database/functions/listEmployeesByFiliale.sql
#usw.
psql -d $DB_NAME -f ./pfad_zum_algorithmus/functions/alg_file.js
#usw.


# Seed-Daten einfügen, [befüllen von daten zB user]
# psql -d $DB_NAME -f ./database/scripts/user_role.sql

echo "Datenbank $DB_NAME wurde erfolgreich initialisiert."



