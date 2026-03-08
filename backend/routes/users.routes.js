const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");

const usersRepo = require("../repositories/users.repo.pg");

/**
 * ============================================================================
 * Routen: /users
 * ----------------------------------------------------------------------------
 * Diese Routes kapseln alle HTTP-Endpunkte für die Verwaltung von Benutzern.
 *
 * Aufgaben:
 * - Benutzer laden
 * - Benutzer anlegen
 * - Benutzer bearbeiten
 * - Benutzer löschen
 *
 * Sicherheitsaspekt:
 * - Passwörter werden niemals im Klartext gespeichert
 * - Stattdessen wird bcrypt verwendet und der Hash in password_hash abgelegt
 * - Der Hash wird im Response bewusst nicht zurückgegeben
 * ============================================================================
 */

/**
 * Erzeugt ein "sicheres" User-Objekt für das Frontend.
 *
 * Zweck:
 * - password_hash soll niemals an das Frontend gesendet werden
 * - Response bleibt auf die wirklich benötigten Felder reduziert
 */
function toSafeUser(user) {
  if (!user) return user;

  const { password_hash, ...safeUser } = user;
  return safeUser;
}

/**
 * Erlaubte Rollen im System.
 *
 * Hinweis:
 * - Falls später weitere Rollen hinzukommen (z.B. editor, manager),
 *   kann diese Liste zentral erweitert werden.
 */
const ALLOWED_ROLES = new Set(["admin", "user"]);

/* ============================================================================
 * GET /api/users
 * ----------------------------------------------------------------------------
 * Liefert alle Benutzer.
 *
 * Wichtig:
 * - password_hash wird vor der Rückgabe entfernt
 * ============================================================================
 */
router.get("/", async (_req, res) => {
  try {
    const users = await usersRepo.getAll();
    res.json(users.map(toSafeUser));
  } catch (err) {
    console.error("Fehler GET /users:", err);
    res.status(500).json({ error: "Fehler beim Laden der Users" });
  }
});

/* ============================================================================
 * GET /api/users/:id
 * ----------------------------------------------------------------------------
 * Liefert einen einzelnen Benutzer anhand der ID.
 *
 * Validierung:
 * - id muss eine gültige Zahl sein
 *
 * HTTP-Status:
 * - 400 bei ungültiger id
 * - 404 wenn der User nicht existiert
 * ============================================================================
 */
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Ungültige id" });
    }

    const user = await usersRepo.getById(id);
    if (!user) {
      return res.status(404).json({ error: "User nicht gefunden" });
    }

    res.json(toSafeUser(user));
  } catch (err) {
    console.error("Fehler GET /users/:id:", err);
    res.status(500).json({ error: "Fehler beim Laden" });
  }
});

/* ============================================================================
 * POST /api/users
 * ----------------------------------------------------------------------------
 * Legt einen neuen Benutzer an.
 *
 * Validierung:
 * - username und password sind Pflicht
 * - role ist optional, Standard = "user"
 * - role muss in ALLOWED_ROLES enthalten sein
 *
 * Sicherheit:
 * - Das Passwort wird mit bcrypt gehasht und nur als password_hash gespeichert
 *
 * HTTP-Status:
 * - 400 bei ungültigen Eingaben
 * - 409 wenn der username bereits existiert
 * ============================================================================
 */
router.post("/", async (req, res) => {
  try {
    const { username, password, role } = req.body;

    const cleanUsername = String(username ?? "").trim();
    const cleanPassword = String(password ?? "").trim();
    const cleanRole = role ? String(role).trim() : "user";

    if (!cleanUsername || !cleanPassword) {
      return res.status(400).json({ error: "username und password sind Pflicht" });
    }

    if (!ALLOWED_ROLES.has(cleanRole)) {
      return res.status(400).json({ error: "Ungültige Rolle" });
    }

    const password_hash = await bcrypt.hash(cleanPassword, 10);

    const created = await usersRepo.create({
      username: cleanUsername,
      password_hash,
      role: cleanRole,
    });

    res.status(201).json(toSafeUser(created));
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "username existiert bereits" });
    }

    console.error("Fehler POST /users:", err);
    res.status(500).json({ error: "Fehler beim Anlegen" });
  }
});

/* ============================================================================
 * PUT /api/users/:id
 * ----------------------------------------------------------------------------
 * Aktualisiert einen bestehenden Benutzer.
 *
 * Änderbare Felder:
 * - username
 * - role
 * - password (optional)
 *
 * Hinweise:
 * - Es werden nur Felder übernommen, die tatsächlich gesendet wurden
 * - Wird ein neues Passwort gesendet, wird es erneut mit bcrypt gehasht
 *
 * HTTP-Status:
 * - 400 bei ungültiger id oder leerem Update
 * - 404 wenn der User nicht existiert
 * - 409 wenn der neue username bereits vergeben ist
 * ============================================================================
 */
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Ungültige id" });
    }

    const updates = {};

    if ("username" in req.body) {
      const cleanUsername = String(req.body.username ?? "").trim();
      if (!cleanUsername) {
        return res.status(400).json({ error: "username darf nicht leer sein" });
      }
      updates.username = cleanUsername;
    }

    if ("role" in req.body) {
      const cleanRole = String(req.body.role ?? "").trim();
      if (!ALLOWED_ROLES.has(cleanRole)) {
        return res.status(400).json({ error: "Ungültige Rolle" });
      }
      updates.role = cleanRole;
    }

    // optional: Passwort ändern
    if ("password" in req.body && req.body.password) {
      updates.password_hash = await bcrypt.hash(String(req.body.password), 10);
    }

    // Schutz gegen leere Updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "Keine gültigen Felder zum Aktualisieren" });
    }

    const updated = await usersRepo.updateById(id, updates);
    if (!updated) {
      return res.status(404).json({ error: "User nicht gefunden" });
    }

    res.json(toSafeUser(updated));
  } catch (err) {
    if (err?.code === "23505") {
      return res.status(409).json({ error: "username existiert bereits" });
    }

    console.error("Fehler PUT /users/:id:", err);
    res.status(500).json({ error: "Fehler beim Aktualisieren" });
  }
});

/* ============================================================================
 * DELETE /api/users/:id
 * ----------------------------------------------------------------------------
 * Löscht einen Benutzer anhand der ID.
 *
 * HTTP-Status:
 * - 400 bei ungültiger id
 * - 404 wenn der User nicht existiert
 * ============================================================================
 */
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: "Ungültige id" });
    }

    const ok = await usersRepo.removeById(id);
    if (!ok) {
      return res.status(404).json({ error: "User nicht gefunden" });
    }

    res.json({ message: "User gelöscht" });
  } catch (err) {
    console.error("Fehler DELETE /users/:id:", err);
    res.status(500).json({ error: "Fehler beim Löschen" });
  }
});

module.exports = router;