const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db-postgres');
const { ok, fail } = require('../utils/response');
const { validateContact } = require('../utils/validation');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de messages envoyés. Réessayez plus tard.',
    data: null,
    errors: [],
  },
});

// POST /api/contact
router.post('/', contactLimiter, async (req, res, next) => {
  try {
    // Honeypot anti-spam simple
    if (req.body.site_web) {
      return ok(res, null, 'Message envoyé.', 201);
    }

    const { valid, errors, data } = validateContact(req.body);

    if (!valid) {
      return fail(
        res,
        'Certains champs sont invalides ou manquants.',
        422,
        errors
      );
    }

    const result = await db.query(
      `
      INSERT INTO contacts
        (nom, email, telephone, sujet, message)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING id
      `,
      [
        data.nom,
        data.email,
        data.telephone,
        data.sujet,
        data.message,
      ]
    );

    const contactId = result.rows[0].id;

    return ok(
      res,
      { id: contactId },
      'Votre message a bien été envoyé.',
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;