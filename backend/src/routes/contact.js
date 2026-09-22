const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { ok, fail } = require('../utils/response');
const { validateContact } = require('../utils/validation');

const router = express.Router();

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de messages envoyés. Réessayez plus tard.', data: null, errors: [] },
});

// POST /api/contact
router.post('/', contactLimiter, (req, res, next) => {
  try {
    // Honeypot anti-spam simple : un champ caché côté frontend, invisible pour
    // un humain, mais souvent rempli automatiquement par les robots.
    if (req.body.site_web) {
      return ok(res, null, 'Message envoyé.', 201);
    }

    const { valid, errors, data } = validateContact(req.body);
    if (!valid) {
      return fail(res, 'Certains champs sont invalides ou manquants.', 422, errors);
    }

    const insert = db.prepare(`
      INSERT INTO contacts (nom, email, telephone, sujet, message) VALUES (?, ?, ?, ?, ?)
    `);
    const result = insert.run(data.nom, data.email, data.telephone, data.sujet, data.message);

    return ok(res, { id: result.lastInsertRowid }, 'Votre message a bien été envoyé.', 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
