
/**
 * Lukas
 * Export json2csv  -> Excel Format der Zentrale !!!!
 * nimmt rohdaten aus der export.repo.pg.js und konvertiert diese zu csv
 * 
 */



const { Parser} = require('json2csv');    // Library mit der Klasse Parser
const exportRepo = require('../repositories/export.repo.pg.js');


const konvertDienstplan2CSV = async (jahr, monat, fnr) => {
    try {
        // DEBUG: Was kommt vom frontend an?
        console.log(`Export-Anfrage für: Jahr=${jahr}, Monat=${monat}, Filiale=${fnr}`);

        const data = await exportRepo.getExportData(jahr, monat, fnr);


        // DEBUG: Was gibt die Datenbank zurück?
        console.log('Daten von DB erhalten:', data ? data.length : 'null', 'Zeilen');
        if (data && data.length > 0) {
            console.log('Beispiel-Zeile (erste):', data[0]);
        }


        if (!data || data.length === 0){
            console.warn('Keine Daten für Export gefunden!!')
            return null;  // Abbruch wenn keine Daten gefunden werden
        }

        // Der parser sucht die values aus dem Repo !!!!
        const fields = [
            {label: 'Standort', value: 'filialname'},
             {label: 'Nachname', value: 'nachname'},
              {label: 'Vorname', value: 'vorname'},
               {label: 'Datum', value: 'datum' },
                {label: 'Schicht', value: 'kürzel'},
                // NEU: Leere Spalte, Stunden und Ist-Stunden
                { label: '----', value: () => '' },

                { 
                label: 'Wochenstunden', 
                    value: (row) => (row.wochenstunden != null ? row.wochenstunden.toString().replace('.', ',') : '40,00')
                
            },

            { 
                label: 'Ist Stunden', 
                value: (row) => {
                    if (row.saldo == null) return '0,00';
                    const val = parseFloat(row.saldo);
                    return isNaN(val) ? '0,00' : val.toFixed(2).replace('.', ',');
                }
            }
        
        
        ];

        // Neue Instanz
        const json2csvParser = new Parser({ 
            fields, 
            delimiter: ';',             //Wichtig: EXCEL erkennt Spalten meistens automatisch und sortiert   (, und . wären Fehleranfälliger [US,EU])
            quote: '' 
        });

  // Wandelt in CSV Format um
        const csv = json2csvParser.parse(data);
        
        // NEU: Data_Export
        const firstRow = data[0] || { filialname: 'Export' };
        const rawFileName = firstRow.filialname.replace(/[^a-z0-9]/gi, '_');
        // Wichtig: Damit Excel die Sonderzeichen erkennt (BOM) als ufeff zurückgeben
        return {
            csvContent: '\ufeff' + csv,
            fileNamePart: rawFileName
        };

    }catch (err){
        console.error('Fehler beim konvertieren der  Daten!', err.message);
        throw err;
    }
}


module.exports = { konvertDienstplan2CSV };

