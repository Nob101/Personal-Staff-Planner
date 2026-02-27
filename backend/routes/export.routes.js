
/**
 * Lukas
 * Wichitg: Dead-Code aus dem ersten Export in ein csv.file. Es bleibt zu dokumentations
 * Zwecken und für den Fall das der Bedarf an einen Export im CSV-Format entsteht.
 * 
 * Die Route muss im server.js scharfgeschalten werden!
 * 
 */

const express = require('express');
const router = express.Router();
const { getDienstplanRawData } = require('../functions/exportService');




router.get('/data', async (req, res) => {
    try {
        const { jahr, monat, fnr } = req.query;

     // NEU: überprüfung damit server nicht crasht
        if (!jahr || !monat || !fnr) {
            return res.status(400).send("Jahr, Monat und Filial Nummer sind Pflichtfelder.");
    }

        // NEU: Service aufrufen (optimiert)
        const data = await getDienstplanRawData(Number(jahr), Number(monat), Number(fnr));

        if(!data){
            return res.status(404).send('Keine Daten gefunden');
        }

        // NEU: Das json-array wird ans Frontend geschickt
       
       
        return res.send(data);



    } catch (err){
        // console.error('Export-Route Fehler:', err);
        res.status(500).send("Fehler beim Export!!")
    }
    // res.send('Export-Route Test');
});

module.exports = router;