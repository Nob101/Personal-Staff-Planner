import express from 'express';
const router = express.Router();

// Beispiel-Route
router.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Max' }]);
});

export default router;
