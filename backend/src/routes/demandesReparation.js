const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db-postgres');
const { ok, fail } = require('../utils/response');
const { validateDemandeReparation } = require('../utils/validation');
const { upload, verifyUploadedImage } = require('../middleware/upload');

const router = express.Router();

// Limite les tentatives d'envoi de demandes depuis une même IP (anti-spam).
const demandeLimiter = rateLimit({
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

// POST /api/demandes-reparation
router.post(
  '/',
  demandeLimiter,
  upload.single('photo'),
  verifyUploadedImage,
  async (req, res, next) => {
    try {
      const { valid, errors, data } = validateDemandeReparation(req.body);

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
        [data.nom_complet, data.telephone, data.email]
      );

      const clientId = clientResult.rows[0].id;

      // Création de l'appareil
      const appareilResult = await db.query(
        `
        INSERT INTO appareils (client_id, type, marque, modele)
        VALUES ($1, $2, $3, $4)
        RETURNING id
        `,
        [
          clientId,
          data.type,
          data.marque,
          data.modele,
        ]
      );

      const appareilId = appareilResult.rows[0].id;

      const photoPath = req.file
        ? `/uploads/${req.file.filename}`
        : null;

      // Création de la demande de réparation
      const demandeResult = await db.query(
        `
        INSERT INTO demandes_reparation
          (
            client_id,
            appareil_id,
            panne,
            photo_path,
            date_souhaitee,
            heure_souhaitee,
            confidentialite_acceptee
          )
        VALUES ($1, $2, $3, $4, $5, $6, 1)
        RETURNING id
        `,
        [
          clientId,
          appareilId,
          data.panne,
          photoPath,
          data.date_souhaitee,
          data.heure_souhaitee,
        ]
      );

      const demandeId = demandeResult.rows[0].id;

      // Trace une notification à envoyer.
      await db.query(
        `
        INSERT INTO notifications
          (type, destinataire, contenu_resume, statut)
        VALUES ($1, $2, $3, 'a_envoyer')
        `,
        [
          'confirmation_demande',
          data.email || data.telephone,
          `Demande #${demandeId} reçue`,
        ]
      );

      return ok(
        res,
        { id: demandeId },
        'Votre demande a bien été enregistrée. Nous vous recontacterons rapidement.',
        201
      );
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;