
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
        const data = await exportRepo.getExportData(jahr, monat, fnr);

        if (!data || data.length === 0){
            return null;  // Abbruch wenn keine Daten gefunden werden
        }

        // Der parser sucht die values aus dem Repo !!!!
        const fields = [
            {label: 'Standort', value: 'filialname'},
             {label: 'Nachname', value: 'nachname'},
              {label: 'Vorname', value: 'vorname'},
               {label: 'Datum', value: 'datum' },
                {label: 'Schicht', value: 'kürzel'}
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
        const rawFileName = data[0].filialname.replace(/[^a-z0-9]/gi, '_');
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

