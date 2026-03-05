const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const usersRepo = require("../repositories/users.repo.pg");

// GET /api/users
router.get("/", async (_req, res) => {
  try {
    const users = await usersRepo.getAll();
    res.json(users);
  } catch (err) {
    console.error("Fehler GET /users:", err);
    res.status(500).json({ error: "Fehler beim Laden der Users" });
  }
});

// GET /api/users/:id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Ungültige id" });

    const user = await usersRepo.getById(id);
    if (!user) return res.status(404).json({ error: "User nicht gefunden" });

    res.json(user);
  } catch (err) {
    console.error("Fehler GET /users/:id:", err);
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

// POST /api/users
router.post("/", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "username und password sind Pflicht" });
    }

    const password_hash = await bcrypt.hash(String(password), 10);

    const created = await usersRepo.create({
      username: String(username).trim(),
      password_hash,
      role: role ? String(role) : "user",
    });

    res.status(201).json(created);
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "username existiert bereits" });
    }
    console.error("Fehler POST /users:", err);
    res.status(500).json({ error: "Fehler beim Anlegen" });
  }
});

// PUT /api/users/:id
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Ungültige id" });

    const updates = {};
    if ("username" in req.body) updates.username = String(req.body.username).trim();
    if ("role" in req.body) updates.role = String(req.body.role);

    // optional: password ändern
    if ("password" in req.body && req.body.password) {
      updates.password_hash = await bcrypt.hash(String(req.body.password), 10);
    }

    const updated = await usersRepo.updateById(id, updates);
    if (!updated) return res.status(404).json({ error: "User nicht gefunden" });

    res.json(updated);
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "username existiert bereits" });
    }
    console.error("Fehler PUT /users/:id:", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren" });
  }
});

// DELETE /api/users/:id
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) return res.status(400).json({ error: "Ungültige id" });

    const ok = await usersRepo.removeById(id);
    if (!ok) return res.status(404).json({ error: "User nicht gefunden" });

    res.json({ message: "User gelöscht" });
  } catch (err) {
    console.error("Fehler DELETE /users/:id:", err);
    res.status(500).json({ error: "Fehler beim Löschen" });
  }
});

module.exports = router;