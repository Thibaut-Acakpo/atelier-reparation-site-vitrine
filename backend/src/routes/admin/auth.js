const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const db = require('../../db');
const { ok, fail } = require('../../utils/response');
const { signAdminToken, requireAuth } = require('../../middleware/auth');
const { cleanText, isValidEmail } = require('../../utils/validation');

const router = express.Router();

// Limite les tentatives de connexion pour freiner le bruteforce.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de tentatives de connexion. Réessayez plus tard.', data: null, errors: [] },
});

// POST /api/admin/auth/login
router.post('/login', loginLimiter, (req, res, next) => {
  try {
    const email = cleanText(req.body.email || '').toLowerCase();
    const motDePasse = String(req.body.mot_de_passe || '');

    if (!isValidEmail(email) || !motDePasse) {
      return fail(res, 'Identifiants invalides.', 401);
    }

    const admin = db.prepare(`SELECT * FROM admins WHERE email = ? AND actif = 1`).get(email);
    if (!admin) {
      // Message identique en cas d'email inconnu ou de mot de passe erroné :
      // ne jamais révéler si un compte existe pour un email donné.
      return fail(res, 'Identifiants invalides.', 401);
    }

    const motDePasseValide = bcrypt.compareSync(motDePasse, admin.mot_de_passe_hash);
    if (!motDePasseValide) {
      return fail(res, 'Identifiants invalides.', 401);
    }

    db.prepare(`UPDATE admins SET derniere_connexion = datetime('now') WHERE id = ?`).run(admin.id);

    const token = signAdminToken(admin);
    return ok(res, { token, admin: { id: admin.id, nom: admin.nom, email: admin.email, role: admin.role } }, 'Connexion réussie.');
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/auth/me — vérifie la validité du jeton stocké côté client
router.get('/me', requireAuth, (req, res) => {
  return ok(res, { admin: req.admin });
});

// POST /api/admin/auth/changer-mot-de-passe
router.post('/changer-mot-de-passe', requireAuth, (req, res, next) => {
  try {
    const motDePasseActuel = String(req.body.mot_de_passe_actuel || '');
    const nouveauMotDePasse = String(req.body.nouveau_mot_de_passe || '');

    if (nouveauMotDePasse.length < 8) {
      return fail(res, 'Le nouveau mot de passe doit contenir au moins 8 caractères.', 422, ['nouveau_mot_de_passe']);
    }

    const admin = db.prepare(`SELECT * FROM admins WHERE id = ?`).get(req.admin.id);
    if (!admin || !bcrypt.compareSync(motDePasseActuel, admin.mot_de_passe_hash)) {
      return fail(res, 'Mot de passe actuel incorrect.', 401);
    }

    const hash = bcrypt.hashSync(nouveauMotDePasse, 10);
    db.prepare(`UPDATE admins SET mot_de_passe_hash = ? WHERE id = ?`).run(hash, admin.id);

    return ok(res, null, 'Mot de passe mis à jour.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
