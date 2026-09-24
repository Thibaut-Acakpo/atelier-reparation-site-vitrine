const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const db = require('../../db-postgres');
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
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez plus tard.',
    data: null,
    errors: [],
  },
});

// POST /api/admin/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const email = cleanText(req.body.email || '').toLowerCase();
    const motDePasse = String(req.body.mot_de_passe || '');

    if (!isValidEmail(email) || !motDePasse) {
      return fail(res, 'Identifiants invalides.', 401);
    }

    const result = await db.query(
      `
      SELECT *
      FROM admins
      WHERE email = $1
        AND actif = 1
      `,
      [email]
    );

    const admin = result.rows[0];

    if (!admin) {
      // Même message pour un email inconnu ou un mauvais mot de passe.
      return fail(res, 'Identifiants invalides.', 401);
    }

    const motDePasseValide = await bcrypt.compare(
      motDePasse,
      admin.mot_de_passe_hash
    );

    if (!motDePasseValide) {
      return fail(res, 'Identifiants invalides.', 401);
    }

    await db.query(
      `
      UPDATE admins
      SET derniere_connexion = NOW()
      WHERE id = $1
      `,
      [admin.id]
    );

    const token = signAdminToken(admin);

    return ok(
      res,
      {
        token,
        admin: {
          id: admin.id,
          nom: admin.nom,
          email: admin.email,
          role: admin.role,
        },
      },
      'Connexion réussie.'
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/auth/me
// Vérifie la validité du jeton stocké côté client.
router.get('/me', requireAuth, (req, res) => {
  return ok(res, { admin: req.admin });
});

// POST /api/admin/auth/changer-mot-de-passe
router.post(
  '/changer-mot-de-passe',
  requireAuth,
  async (req, res, next) => {
    try {
      const motDePasseActuel = String(
        req.body.mot_de_passe_actuel || ''
      );
      const nouveauMotDePasse = String(
        req.body.nouveau_mot_de_passe || ''
      );

      if (nouveauMotDePasse.length < 8) {
        return fail(
          res,
          'Le nouveau mot de passe doit contenir au moins 8 caractères.',
          422,
          ['nouveau_mot_de_passe']
        );
      }

      const result = await db.query(
        `
        SELECT *
        FROM admins
        WHERE id = $1
        `,
        [req.admin.id]
      );

      const admin = result.rows[0];

      if (
        !admin ||
        !(await bcrypt.compare(
          motDePasseActuel,
          admin.mot_de_passe_hash
        ))
      ) {
        return fail(
          res,
          'Mot de passe actuel incorrect.',
          401
        );
      }

      // Le nouveau mot de passe est hashé avant d'être enregistré.
      const hash = await bcrypt.hash(nouveauMotDePasse, 10);

      await db.query(
        `
        UPDATE admins
        SET mot_de_passe_hash = $1
        WHERE id = $2
        `,
        [hash, admin.id]
      );

      return ok(res, null, 'Mot de passe mis à jour.');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;