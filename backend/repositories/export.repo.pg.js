
/**
 * Lukas
 * Export-Logik für Dienstpläne
 * Die Schichtkürzel (A, E, F, K) bleiben  -> Excel darstellung Zentrale
 * Welcher Mitarbeiter hatte welche Schicht in welchem Jahr/monat
 * und in welcher Filiale
 * 
 */

const pool = require('../db/pool.js');

const getExportData = async (jahr, monat, fnr) => {
const query = `
    SELECT 
            f.filialname,           -- Der  Name aus Tabelle filiale
            m.nachname, 
            m.vorname, 
            d.datum, 
            d.schicht_typ AS kürzel             --  Kürzel für das Excel-Layout
    
        FROM dienstplaene d
        JOIN mitarbeiter m ON d.mnr = m.mnr
        JOIN filiale f ON d.fnr = f.fnr
            WHERE d.jahr = $1 AND d.monat = $2
            ORDER BY f.filialname ASC,   d.datum ASC, m.nachname ASC;
`;

try{
    const result = await pool.query(query, [jahr, monat, fnr]);
    return result.rows;

} catch (err){
    console.error('Fehler beim Export', err.message);
    throw err;   //Wichtig: Fehlerbehandlung in der Route oder Controller
}

};

module.exports = {getExportData };

