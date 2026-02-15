
/**
 * Lukas Atzmüller
 * INTERVAL  -> in Postgres ein spezieller Datentyp für Zeitspannen
 * mit 
 *   - Intervall '13 months' rechnet Postgres im Kalender zurück.
 *      Vorteil: Schaltjahre und Monatslängen werden Automatisch berücksichtigt
 *      und CURRENT_DATE nimmt die Uhrzeit des Servers = sehr präzise
 */

const pool = require('../db/pool');

const deleteOldShifts = async () => {
    try {

        // NEU: Nur bei zuvielen Rows ausführen. 
        // Gelöscht wird ab einem Zeitstempel im server.js
        const count = await pool.query('SELECT COUNT(*) FROM dienstplaene');
        const totalRows = parseInt(count.rows[0].count);

        if(totalRows > 70000){

             const query = `
            DELETE FROM dienstplaene
            WHERE datum < CURRENT_DATE - INTERVAL '13 months';
        `;

        // NEU: Inaktive MA löschen EXISTS macht es 'fehlerfrei'
           const maDelete = await client.query(`
                DELETE FROM mitarbeiter 
                WHERE aktiv = FALSE 
                AND NOT EXISTS (SELECT 1 FROM dienstplaene WHERE mnr = mitarbeiter.mnr);
            `); 
            // Inaktive Filialen löschen
            const filialeDelete = await client.query(`
                DELETE FROM filiale 
                WHERE aktiv = FALSE 
                AND NOT EXISTS (SELECT 1 FROM dienstplaene WHERE fnr = filiale.fnr);
            `);
            await client.query('COMMIT');
        } else {
            console.log(`Cleanup übersprungen: Aktuell nur ${totalRows} Zeilen.`);
        }
    } catch (err) {
        console.error('Fehler beim automatischen Cleanup:', err.message);
    }
  
};

module.exports = { deleteOldShifts };