const express = require('express');
const router = express.Router();

const authRepo = require('../repositories/auth.repo.pg');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authRepo.authenticate(username, password);

    if (!user) {
      return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }

    res.json({
      message: 'Login erfolgreich',
      user
    });
  } catch (err) {
    console.error('Fehler /auth/login:', err);
    res.status(500).json({ error: 'Fehler bei der Anmeldung' });
  }
});



module.exports = router;