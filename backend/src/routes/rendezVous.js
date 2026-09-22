const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { ok, fail } = require('../utils/response');
const { validateRendezVous } = require('../utils/validation');

const router = express.Router();

const rdvLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de demandes envoyées. Réessayez plus tard.', data: null, errors: [] },
});

// POST /api/rendez-vous
router.post('/', rdvLimiter, (req, res, next) => {
  try {
    const { valid, errors, data } = validateRendezVous(req.body);
    if (!valid) {
      return fail(res, 'Certains champs sont invalides ou manquants.', 422, errors);
    }

    const insertClient = db.prepare(
      `INSERT INTO clients (nom_complet, telephone, email) VALUES (?, ?, ?)`
    );
    const clientResult = insertClient.run(data.nom_complet, data.telephone, data.email);

    const insertRdv = db.prepare(`
      INSERT INTO rendez_vous (client_id, date_souhaitee, heure_souhaitee, motif, statut)
      VALUES (?, ?, ?, ?, 'en_attente')
    `);
    const rdvResult = insertRdv.run(clientResult.lastInsertRowid, data.date_souhaitee, data.heure_souhaitee, data.motif);

    return ok(
      res,
      { id: rdvResult.lastInsertRowid },
      "Votre demande de rendez-vous a été enregistrée. Elle sera confirmée par l'atelier.",
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
