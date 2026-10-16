const express = require('express');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');

const db = require('../db-postgres');
const { ok, fail } = require('../utils/response');
const {
  requireDeveloperAuth,
  signDeveloperToken,
} = require('../middleware/developerAuth');
const {
  cleanText,
  isValidEmail,
} = require('../utils/validation');

const router = express.Router();

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

// POST /api/gestion/auth/login
router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const email = cleanText(req.body.email || '')
      .toLowerCase();

    const motDePasse = String(
      req.body.mot_de_passe || ''
    );

    if (!isValidEmail(email) || !motDePasse) {
      return fail(
        res,
        'Identifiants invalides.',
        401
      );
    }

    const result = await db.query(
      `
      SELECT *
      FROM developer_accounts
      WHERE email = $1
        AND actif = 1
      `,
      [email]
    );

    const developer = result.rows[0];

    if (!developer) {
      return fail(
        res,
        'Identifiants invalides.',
        401
      );
    }

    const motDePasseValide =
      await bcrypt.compare(
        motDePasse,
        developer.mot_de_passe_hash
      );

    if (!motDePasseValide) {
      return fail(
        res,
        'Identifiants invalides.',
        401
      );
    }

    await db.query(
      `
      UPDATE developer_accounts
      SET derniere_connexion = NOW()
      WHERE id = $1
      `,
      [developer.id]
    );

    const token = signDeveloperToken(
      developer
    );

    return ok(
      res,
      {
        token,
        developer: {
          id: developer.id,
          nom: developer.nom,
          email: developer.email,
          type: 'developer',
        },
      },
      'Connexion développeur réussie.'
    );
  } catch (err) {
    next(err);
  }
});

// GET /api/gestion/auth/me
router.get(
  '/me',
  requireDeveloperAuth,
  (req, res) => {
    return ok(
      res,
      {
        developer: req.developer,
      }
    );
  }
);

module.exports = router;