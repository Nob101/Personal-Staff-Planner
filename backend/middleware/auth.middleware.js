/**
 * NEU:
 * Middleware die verhindert das man ohne login (via routen)
 * das Programm errreichen kann
 */

// Gästeliste holen & erstellen
const crypto = require('crypto');

const sessionTrue = new Map();

const loginAllowness = (req, res, next) => {
    console.log(`Autho-test: ${req.path} | token da: ${req.headers['authorization']}` );
    const token = req.headers['authorization'];   // Über metadaten !!!

    if (token && sessionTrue.has(token)){
        next();
    } else {
        res.status(403).json( {
            error: "'Nicht autorisiert'"
        });
    }
};

module.exports = {
    
    loginAllowness,
    sessionTrue
}
