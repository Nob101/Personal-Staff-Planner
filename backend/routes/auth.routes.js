const express = require('express');
const router = express.Router();

const crypto = require('crypto');
const authRepo = require('../repositories/auth.repo.pg');

const {sessionTrue} = require('../middleware/auth.middleware');




router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authRepo.authenticate(username, password);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Ungültige Anmeldedaten' });
    }

    // NEU: token erstellen und speichern
    const token = crypto.randomBytes(24).toString('hex');
    sessionTrue.set(token, user.mnr);

    res.json({
      success: true,
      token: token,   //NEU: sendet token ans frontend mit -> Oliver
      message: 'Login erfolgreich',
      user
    });
  } catch (err) {
    console.error('Fehler /auth/login:', err);
    res.status(500).json({ success: false, error: 'Fehler bei der Anmeldung' });
  }
});



module.exports = router;