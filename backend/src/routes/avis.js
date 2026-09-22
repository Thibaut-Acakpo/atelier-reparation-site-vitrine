const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { ok, fail } = require('../utils/response');
const { validateAvis } = require('../utils/validation');

const router = express.Router();

const avisLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop d\'avis envoyés. Réessayez plus tard.', data: null, errors: [] },
});

// POST /api/avis — l'avis est toujours créé "en_attente" (modération future)
router.post('/', avisLimiter, (req, res, next) => {
  try {
    if (req.body.site_web) {
      return ok(res, null, 'Avis envoyé.', 201);
    }

    const { valid, errors, data } = validateAvis(req.body);
    if (!valid) {
      return fail(res, 'Certains champs sont invalides ou manquants.', 422, errors);
    }

    const insert = db.prepare(`
      INSERT INTO avis (nom, note, commentaire, statut) VALUES (?, ?, ?, 'en_attente')
    `);
    const result = insert.run(data.nom, data.note, data.commentaire);

    return ok(res, { id: result.lastInsertRowid }, 'Merci pour votre avis. Il sera publié après validation.', 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
