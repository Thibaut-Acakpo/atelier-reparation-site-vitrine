const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db-postgres');
const { ok, fail } = require('../utils/response');
const { validateAvis } = require('../utils/validation');

const router = express.Router();

const avisLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop d'avis envoyés. Réessayez plus tard.",
    data: null,
    errors: [],
  },
});

// POST /api/avis — l'avis est toujours créé "en_attente" (modération future)
router.post('/', avisLimiter, async (req, res, next) => {
  try {
    if (req.body.site_web) {
      return ok(res, null, 'Avis envoyé.', 201);
    }

    const { valid, errors, data } = validateAvis(req.body);

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
      INSERT INTO avis
        (nom, note, commentaire, statut)
      VALUES
        ($1, $2, $3, 'en_attente')
      RETURNING id
      `,
      [
        data.nom,
        data.note,
        data.commentaire,
      ]
    );

    const avisId = result.rows[0].id;

    return ok(
      res,
      { id: avisId },
      'Merci pour votre avis. Il sera publié après validation.',
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;