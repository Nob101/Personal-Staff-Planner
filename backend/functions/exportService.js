/**
 * Lukas
 * Wichitg: Dead-Code aus dem ersten Export in ein csv.file. Es bleibt zu dokumentations
 * Zwecken und für den Fall das der Bedarf an einen Export im CSV-Format entsteht.
 * 
 */



const exportRepo = require('../repositories/export.repo.pg.js');

const getDienstplanRawData = async (jahr, monat, fnr) => {
    try {
        const data = await exportRepo.getExportData(jahr, monat, fnr);
        return data; // Einfach nur die Zeilen aus der DB zurückgeben
    } catch (err) {
        console.error('Fehler im Service:', err.message);
        throw err;
    }
}

module.exports = { getDienstplanRawData };
