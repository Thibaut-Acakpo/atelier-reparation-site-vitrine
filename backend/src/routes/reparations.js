const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { ok, fail } = require('../utils/response');

const router = express.Router();

// Limite le nombre de recherches par IP pour empêcher l'énumération des
// codes de suivi (voir section 18.1 du cahier des charges).
const suiviLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de recherches. Réessayez dans quelques minutes.', data: null, errors: [] },
});

const MESSAGE_NEUTRE = "Aucune réparation ne correspond à ce numéro. Vérifiez votre saisie ou contactez l'atelier.";

// GET /api/reparations/:numero
// :numero est le code public (non énumérable), pas l'identifiant interne.
router.get('/:numero', suiviLimiter, (req, res, next) => {
  try {
    const codePublic = String(req.params.numero || '').trim();

    if (!codePublic || codePublic.length < 6 || codePublic.length > 40) {
      // Message neutre : ne jamais indiquer si le format est "presque bon".
      return fail(res, MESSAGE_NEUTRE, 404, []);
    }

    const row = db
      .prepare(
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
      WHERE r.code_public = ? AND r.visible_publiquement = 1
    `
      )
      .get(codePublic);

    if (!row) {
      // Même code et même structure de réponse qu'un vrai "non trouvé" :
      // aucune fuite d'information sur l'existence ou non d'une fiche proche.
      return fail(res, MESSAGE_NEUTRE, 404, []);
    }

    const historique = db
      .prepare(
        `
      SELECT h.commentaire, h.created_at, s.libelle AS statut
      FROM historique_reparation h
      JOIN reparations rep ON rep.id = h.reparation_id
      JOIN statuts_reparation s ON s.id = h.statut_id
      WHERE rep.code_public = ?
      ORDER BY h.created_at ASC
    `
      )
      .all(codePublic);

    const pieces = db
      .prepare(
        `
      SELECT p.nom, rp.quantite
      FROM reparation_pieces rp
      JOIN pieces p ON p.id = rp.piece_id
      JOIN reparations rep ON rep.id = rp.reparation_id
      WHERE rep.code_public = ?
    `
      )
      .all(codePublic);

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
      pieces_remplacees: pieces,
      date_estimee_recuperation: row.date_estimee_recuperation,
      derniere_mise_a_jour: row.updated_at,
      historique,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
