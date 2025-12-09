const express = require('express');
const router = express.Router();

const authRepo = require('../repositories/auth.repo.pg');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await authRepo.authenticate(username, password);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Ungültige Anmeldedaten' });
    }

    res.json({
      success: true,
      message: 'Login erfolgreich',
      user
    });
  } catch (err) {
    console.error('Fehler /auth/login:', err);
    res.status(500).json({ success: false, error: 'Fehler bei der Anmeldung' });
  }
});



module.exports = router;