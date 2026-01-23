
/**
 * Lukas
 * 
 * 
 * Endpunkt für Oliver um die Export funktion zu finden.
 * 
 * const exportRouter = require('./routes/export.routes.js')
 * app.use('/api/download', exportRouter);
 */

const express = require('express');
const router = express.Router();

const {Parser } = require('json2csv');
const { getExportData } = require('../repositories/export.repo.pg');



router.get('/csv', async (req, res) => {
    try {
        const { jahr, monat, fnr } = req.query;

     // NEU: überprüfung damit server nicht crasht
        if (!jahr || !monat || !fnr) {
            return res.status(400).send("Jahr, Monat und Filial Nummer sind Pflichtfelder.");
    }

        const data = await getExportData(Number(jahr), Number(monat), Number(fnr));

        if(!data || data.length === 0){
            return res.status(404).send('Keine daten gefunden');
        }

        // NEU: fnr in Namen umwandeln  -> in select steht name an erster Stelle
        const fName = data[0].filialname;
        const saveName = fName.replace(/[^a-z0-9]/gi, '_');    //RegEx entfernt Sonderzeichen im Dateinamen /von ..bis/ ^ = not -> [alles außer in klammer kleinbuchstaben und ziffern] gi = global(alle Zeichen) und case sensetive also auch A-Z

        // in CSV umwandeln
        const json2csvParser = new Parser( {
            delimiter: ';'
        });
        const csv = json2csvParser.parse(data);

        // Header setzen damit der Browser weiß, das er daten speichern soll (content txt/csv)

        res.header('Content-Type', 'text/csv');
        res.attachment(`dienstplan_${jahr}_${saveName}_${monat}.csv`);
        return res.send(csv);

    } catch (err){
        res.status(500).send("Fehler beim Export!!")
    }
    // res.send('Export-Route Test');
});

module.exports = router;