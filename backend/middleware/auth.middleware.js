/**
 * NEU:
 * Middleware die verhindert das man ohne login (via routen)
 * das Programm errreichen kann
 */

// Gästeliste holen & erstellen
const crypto = require('crypto');

const sessionTrue = new Map();

const loginAllowness = (req, res, next) => {
    //console.log(`Autho-test: ${req.path} | token da: ${req.headers['authorization']}` );

    const token = req.headers['authorization'];   // Über metadaten !!!
    const session = sessionTrue.get(token);  //WICHTIG: mit get die new Map direkt ansprechen

    // NEU: Token prüfen
<<<<<<< HEAD
        // console.log("TOKEN:", token);
        // console.log("SESSION-MAP-TREFFER:", session);     
=======
       // console.log("TOKEN:", token);
      //  console.log("SESSION-MAP-TREFFER:", session);     
>>>>>>> 0ab0c04 (backend_inkl.users)

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
