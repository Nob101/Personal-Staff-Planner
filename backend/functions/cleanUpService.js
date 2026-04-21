
/**
 * Lukas Atzmüller
 * INTERVAL  -> in Postgres ein spezieller Datentyp für Zeitspannen
 * mit 
 *      Intervall '13 months' rechnet Postgres im Kalender zurück.
 *      Vorteil: Schaltjahre und Monatslängen werden Automatisch berücksichtigt
 *      und CURRENT_DATE nimmt die Uhrzeit des Servers = sehr präzise
 * 
 * NEU: Transaktion um Karteileichen (inaktive MA/FA) mit zu entfernen
 */

const pool = require('../db/pool');

const deleteOldShifts = async () => {
    const client = await pool.connect();
    try {

        // NEU: Nur bei 'zuvielen' Rows ausführen. Gelöscht wird ab einem Zeitstempel
        const count = await pool.query('SELECT COUNT(*) FROM dienstplaene');
        const totalRows = parseInt(count.rows[0].count);
        if(totalRows > 170000){
            await client.query('BEGIN');

            const shiftDelete = await client.query (`
            DELETE FROM dienstplaene
            WHERE datum < CURRENT_DATE - INTERVAL '13 months';
        `) ;

        // NEU: Inaktive MA löschen EXISTS macht die Logik 'fehlerfrei'
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
            await pool.query('CALL pr_refresh_indexes()');

        } else {
            console.log(`Cleanup übersprungen: Aktuell nur ${totalRows} Zeilen.`);
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Fehler beim automatischen Cleanup (Rollback ausgeführt):', err.message);
    } finally {
        client.release();       //NEU:  Verbindung zurück in den Pool geben
    }
  
};

module.exports = { deleteOldShifts };


