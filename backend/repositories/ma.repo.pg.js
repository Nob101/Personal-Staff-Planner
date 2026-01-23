
        /**
         * Ergänzung / Aufbauend zu Alexanders bisherigem code,
         * 
         * 
         * 
         * Repository-Module für die Tabelle 'mitarbeiter'
         * Enthält Funktionen zum Lesen, Einfügen, Aktualisieren und Löschen von Mitarbeitern
         * DML-CRUD
         * 
         * Nutzung vorbereiteter Statements 
         * mit festen Parametern zur Vermeidung von SQL-Injektionen
         * 
         * Hinweis: Jeder Funktionsparameter ist beschreiben, Rückgabewerte sind Promise-basiert
         * d.h. Funktionen liefern ein Promise-Objekt zurück, welches einen Wert repräsentiert
         * aber noch nicht "existiert" -> ein Promise halt
         */


//----------------------------------------------------------------------------------



const pool = require('../db/pool');

const COLUMNS = `mnr, vorname, nachname, fkurzl, akurzl, counter`;

        /**
         * Listet alle Mitarbeiter mit optionaler Pagination (Aufteilung großer Datensätze in kleine Teile)
         * @param {number} offset - Anzahl der zu überspringenden Datensätze (Standard 0)
         * @param {number} limit - Maximalzahl der zurückzugebenden Datensätze (Standard 10)
         * @returns {Promise<Array>} Array von Mitarbeiter-Objekten
         */

async function list(offset = 0, limit = 10) {
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM mitarbeiter ORDER BY mnr LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return rows;
}


//----------------------------------------------------------------------------------


        /**
         * Gibt den Mitarbeiter mit der angegebenen Mitarbeiternummer zurück
         * @param {number} mnr - Mitarbeiternummer
         * @returns {Promise<Object|null>} Mitarbeiter-Objekt oder null wenn nicht gefunden
         */
async function get(mnr) {
  const { rows } = await pool.query(`SELECT ${COLUMNS} FROM mitarbeiter WHERE mnr = $1`, [mnr]);
  return rows[0] || null;
}


//----------------------------------------------------------------------------------


        /**
         * Sucht Mitarbeiter nach Teilstring im Vor- oder Nachnamen (case-insensitive)
         * @param {string} name - Suchbegriff für Vor- oder Nachname
         * @returns {Promise<Array>} Array der passenden Mitarbeiter
         */
async function searchByName(name) {
  const pattern = `%${name}%`.toLowerCase();
  const { rows } = await pool.query(
    `SELECT ${COLUMNS} FROM mitarbeiter 
     WHERE LOWER(vorname) LIKE $1 OR LOWER(nachname) LIKE $1 ORDER BY mnr`,
    [pattern]
  );
  return rows;
}

//----------------------------------------------------------------------------------



        /**
         * Fügt mehrere Mitarbeiter auf einmal in die Datenbank ein (Bulk Insert)
         * Bulk Insert -> gleichzeitiges Einfügen mehrerer Datensätze in einem VVorgang
         * Pflichtfelder: vorname, nachname (müssen gesetzt sein)
         * counter muss Zahl [10..999] sein, fkurzl und akurzl können NULL und sind unique
         * @param {Array<Object>} mitarbeiterArray - Array mit Mitarbeiter-Objekten
         * @returns {Promise<Array>} Array der eingefügten Mitarbeiterobjekte mit allen Spalten
         */
async function createMany(mitarbeiterArray) {
  if (!Array.isArray(mitarbeiterArray) || mitarbeiterArray.length === 0) return [];
  
  const values = [];
  const placeholders = mitarbeiterArray.map((_, i) => {
    const index = i * 5;
    const m = mitarbeiterArray[i];

    //Prüfung der Pflichtfelder welche nicht NULL sein dürfen
    if(!m.vorname || !m.nachname){
        throw new Error(`Mitarbietr ${i + 1}: 'vorname' und 'nachname' sind Pflichtfelder`)
    }
    if(typeof m.counter !== 'number' || m.counter > 999){
        throw new Error(`Mitarbeiter Counter `)
    }


    values.push(m.vorname, 
        m.nachname,
        m.fkurzl || null,
        m.akurzl || null,
        m.counter ?? 0          //Nullish Coalescing Operator -> wenn kein wert zugewiesen wird, counter  ist automatisch 0 
    );

    return `($${index + 1}, $${index + 2}, $${index + 3}, $${index + 4}, $${index + 5})`;
  }).join(',');

  const query = `INSERT INTO mitarbeiter (vorname, nachname, fkurzl, akurzl, counter) VALUES ${placeholders} RETURNING ${COLUMNS}`;
  const { rows } = await pool.query(query, values);
  return rows;
}


//----------------------------------------------------------------------------------



        /**
         * Legt einen neuen Mitarbeiter an
         * @param {Object} dto - Datenobjekt mit Mitarbeiterdaten
         * @param {string} dto.vorname - Vorname (optional, aber empfohlen)
         * @param {string} dto.nachname - Nachname (optional, aber empfohlen)
         * @param {string|null} dto.fkurzl - Optionales Feld, kann NULL oder unique sein
         * @param {string|null} dto.akurzl - Optionales Feld, kann NULL oder unique sein
         * @param {number} dto.counter - Zahl im Bereich 0.. maximal 999 (Default 0)
         * @returns {Promise<Object>} Eingerüftetes Mitarbeiter-Objekt mit allen Spalten
         */
async function create(dto = {}) {
  const { vorname, nachname, fkurzl, akurzl, counter } = dto;
  const { rows } = await pool.query(
    `INSERT INTO mitarbeiter (vorname, nachname, fkurzl, akurzl, counter)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING ${COLUMNS}`,
    [vorname || null, nachname || null, fkurzl || null, akurzl || null, counter ?? 0]
  );
  return rows[0];
}


//----------------------------------------------------------------------------------


        /**
         * Aktualisiert einen bestehenden Mitarbeiter
         * @param {number} mnr - Mitarbeiternummer, der aktualisiert werden soll
         * @param {Object} dto - Datenobjekt mit zu aktualisierenden Feldern (alle optional)
         * @param {string} [dto.vorname]
         * @param {string} [dto.nachname]
         * @param {string|null} [dto.fkurzl]
         * @param {string|null} [dto.akurzl]
         * @param {number} [dto.counter]
         * @returns {Promise<Object|null>} Aktualisiertes Mitarbeiter-Objekt oder null wenn nicht gefunden
         */
async function update(mnr, dto = {}) {
  const { vorname, nachname, fkurzl, akurzl, counter } = dto;

  const { rows } = await pool.query(
    `UPDATE mitarbeiter SET
       vorname = COALESCE($2, vorname),
       nachname = COALESCE($3, nachname),
       fkurzl = COALESCE($4, fkurzl),
       akurzl = COALESCE($5, akurzl),
       counter = COALESCE($6, counter)
     WHERE mnr = $1
     RETURNING ${COLUMNS}`,
    [mnr, vorname, nachname, fkurzl, akurzl, counter]
  );

  return rows[0] || null;
}


//----------------------------------------------------------------------------------

        /**
         * Löscht einen Mitarbeiter anhand der Mitarbeiternummer
         * @param {number} mnr - Mitarbeiternummer des zu löschenden Datensatzes
         * @returns {Promise<boolean>} true, wenn Datensatz gelöscht wurde, sonst false
         */
async function remove(mnr) {
  const res = await pool.query(`DELETE FROM mitarbeiter WHERE mnr = $1`, [mnr]);
  return res.rowCount > 0;
}


//----------------------------------------------------------------------------------


        /**
         *  Funktionen als module.exports defineiren -> best Practice 
         *  Macht ein mögliches debuggen leichter
         */

module.exports = {
 
  list,
  get,
  searchByName,
  createMany,
  create,
  update,
  remove,

};

