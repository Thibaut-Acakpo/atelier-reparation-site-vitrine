const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db-postgres');
const { ok, fail } = require('../utils/response');

const router = express.Router();

// Limite le nombre de recherches par IP pour empêcher l'énumération
// des codes de suivi.
const suiviLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Trop de recherches. Réessayez dans quelques minutes.',
    data: null,
    errors: [],
  },
});

const MESSAGE_NEUTRE =
  "Aucune réparation ne correspond à ce numéro. Vérifiez votre saisie ou contactez l'atelier.";

// GET /api/reparations/:numero
// :numero est le code public (non énumérable), pas l'identifiant interne.
router.get('/:numero', suiviLimiter, async (req, res, next) => {
  try {
    const codePublic = String(req.params.numero || '').trim();

    if (!codePublic || codePublic.length < 6 || codePublic.length > 40) {
      return fail(res, MESSAGE_NEUTRE, 404, []);
    }

    // Récupération de la réparation
    const result = await db.query(
      `
      SELECT
        r.numero_fiche,
        r.description_statut,
        r.diagnostic,
        r.cout,
        r.date_estimee_recuperation,
        r.updated_at,
        s.libelle AS statut,
        a.type AS appareil_type,
        a.marque AS appareil_marque,
        a.modele AS appareil_modele
      FROM reparations r
      JOIN statuts_reparation s ON s.id = r.statut_id
      JOIN appareils a ON a.id = r.appareil_id
      WHERE r.code_public = $1
        AND r.visible_publiquement = 1
      `,
      [codePublic]
    );

    const row = result.rows[0];

    if (!row) {
      return fail(res, MESSAGE_NEUTRE, 404, []);
    }

    // Historique de la réparation
    const historiqueResult = await db.query(
      `
      SELECT
        h.commentaire,
        h.created_at,
        s.libelle AS statut
      FROM historique_reparation h
      JOIN reparations rep ON rep.id = h.reparation_id
      JOIN statuts_reparation s ON s.id = h.statut_id
      WHERE rep.code_public = $1
      ORDER BY h.created_at ASC
      `,
      [codePublic]
    );

    // Pièces remplacées
    const piecesResult = await db.query(
      `
      SELECT
        p.nom,
        rp.quantite
      FROM reparation_pieces rp
      JOIN pieces p ON p.id = rp.piece_id
      JOIN reparations rep ON rep.id = rp.reparation_id
      WHERE rep.code_public = $1
      `,
      [codePublic]
    );

    return ok(res, {
      numero_fiche: row.numero_fiche,
      statut: row.statut,
      description_statut: row.description_statut,

      appareil: {
        type: row.appareil_type,
        marque: row.appareil_marque,
        modele: row.appareil_modele,
      },

      diagnostic: row.diagnostic,
      cout: row.cout,
      pieces_remplacees: piecesResult.rows,
      date_estimee_recuperation: row.date_estimee_recuperation,
      derniere_mise_a_jour: row.updated_at,
      historique: historiqueResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;