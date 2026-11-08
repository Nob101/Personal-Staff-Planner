
/**
 * NEU:
 * Middleware die verhindert das man ohne login (via routen)
 * das Programm errreichen kann
 */

const crypto = require('crypto');

const sessionTrue = new Map();

const loginAllowness = (req, res, next) => {


    const token = req.headers['authorization'];   // Über Metadaten !!!
    const session = sessionTrue.get(token);  //WICHTIG: mit get die new Map direkt ansprechen

    // NEU: Token prüfen


    if (token && session){
      const alterInStunden = (Date.now() - session.createdAt) / (1000 * 60 * 60);
        const limit = 16; //  Limit (16 Stunden)  Server zählt im Hintergrund mit

        if (alterInStunden < limit) {
            return next();      // Wenn Session noch keine 16 Stunden her ist
        } else {
            // Token zu alt -> aus der Liste werfen
            sessionTrue.delete(token);
            console.log(`Token abgelaufen: ${token}`);
        }
    }

             // Wenn kein Token -> Session ungültig oder alt:
    res.status(403).json({
        error: "Sitzung abgelaufen. Bitte neu anmelden."
    });
};

module.exports = {
    
    loginAllowness,
    sessionTrue
}