const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db-postgres');
const { ok, fail } = require('../utils/response');
const { validateRendezVous } = require('../utils/validation');

const router = express.Router();

const rdvLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de demandes envoyées. Réessayez plus tard.',
    data: null,
    errors: [],
  },
});

// POST /api/rendez-vous
router.post('/', rdvLimiter, async (req, res, next) => {
  try {
    const { valid, errors, data } = validateRendezVous(req.body);

    if (!valid) {
      return fail(
        res,
        'Certains champs sont invalides ou manquants.',
        422,
        errors
      );
    }

    // Création du client
    const clientResult = await db.query(
      `
      INSERT INTO clients (nom_complet, telephone, email)
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [
        data.nom_complet,
        data.telephone,
        data.email,
      ]
    );

    const clientId = clientResult.rows[0].id;

    // Création du rendez-vous
    const rdvResult = await db.query(
      `
      INSERT INTO rendez_vous
        (
          client_id,
          date_souhaitee,
          heure_souhaitee,
          motif,
          statut
        )
      VALUES ($1, $2, $3, $4, 'en_attente')
      RETURNING id
      `,
      [
        clientId,
        data.date_souhaitee,
        data.heure_souhaitee,
        data.motif,
      ]
    );

    const rdvId = rdvResult.rows[0].id;

    return ok(
      res,
      { id: rdvId },
      "Votre demande de rendez-vous a été enregistrée. Elle sera confirmée par l'atelier.",
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;