
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
const { konvertDienstplan2CSV } = require('../services/exportService');




router.get('/csv', async (req, res) => {
    try {
        const { jahr, monat, fnr } = req.query;

     // NEU: überprüfung damit server nicht crasht
        if (!jahr || !monat || !fnr) {
            return res.status(400).send("Jahr, Monat und Filial Nummer sind Pflichtfelder.");
    }

        // NEU: Service aufrufen (optimiert)
        const result = await konvertDienstplan2CSV(Number(jahr), Number(monat), Number(fnr));

        if(!result){
            return res.status(404).send('Keine Daten gefunden');
        }

        // NEU: fnr in Namen umwandeln  -> in select steht name an erster Stelle
       // Header setzen für den Browser-Download
        res.header('Content-Type', 'text/csv; charset=utf-8');
        res.attachment(`dienstplan_${jahr}_${monat}_${result.fileNamePart}.csv`);
        
        return res.send(result.csvContent);



    } catch (err){
        console.error('Export-Route Fehler:', err);
        res.status(500).send("Fehler beim Export!!")
    }
    // res.send('Export-Route Test');
});

module.exports = router;