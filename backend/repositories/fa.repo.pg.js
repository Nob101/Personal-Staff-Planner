/**
 * 
 * Under construction
 * 
 */


const pool = require('../db/pool');



const COLUMNS = `fnr, fkurzl, strasse, plz, ort, land, telefon, email`;

async function list(offset = 0, limit = 10){
    const {rows } = await pool.query(
        `SELECT ${COLUMNS} FROM filiale ORDER BY fnr LIMIT $1 OFFSET $2`,
        [limit, offset]
    );
    return rows;
}

async function get(fnr){
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM filiale WHERE fnr = $1`, [fnr]
    );
    return rows[0] || null;
}

async function searchByName(name){
    const pattern = `%${name}%`.toLowerCase();
    const { rows } = await pool.query(
        `SELECT ${COLUMNS} FROM filiale
        WHERE LOWER(fkurzl) LIKE $1`,
        [pattern]
    );
    return rows;
}


module.exports ={
    list,
    get,
    searchByName

}