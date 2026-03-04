
/**
 * Lukas
 * Export-Logik für Dienstpläne
 * Die Schichtkürzel (A, E, F, K) bleiben  -> Excel darstellung Zentrale
 * Welcher Mitarbeiter hatte welche Schicht in welchem Jahr/monat
 * und in welcher Filiale
 * 
 * Wichitg: Dead-Code aus dem ersten Export in ein csv.file. Es bleibt zu dokumentations
 * Zwecken und für den Fall, dass der Bedarf an einen Export im CSV-Format entsteht.
 * 
 */

const pool = require('../db/pool.js');

const getExportData = async (jahr, monat, fnr) => {
const query = `
     SELECT 
            f.filialname,           -- Der  Name aus Tabelle filiale
            m.nachname, 
            m.vorname, 
            to_char(d.datum::date, 'DD.MM.YYYY') AS datum,
            d.schicht_typ AS kürzel,                         
            m.arbeitnehmertyp AS wochenstunden,             
            sk.differenz AS saldo                           
    
        FROM dienstplaene d
        JOIN mitarbeiter m ON d.mnr = m.mnr
        JOIN filiale f ON d.fnr = f.fnr

            LEFT JOIN stunden_konto sk ON sk.mnr = m.mnr 
                AND sk.jahr = d.jahr 
                AND sk.monat = d.monat
            WHERE d.jahr = $1 
            AND d.monat = $2 
            AND d.fnr = $3
            ORDER BY d.datum ASC, m.nachname ASC;
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

