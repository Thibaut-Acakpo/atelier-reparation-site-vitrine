const express = require('express');
const db = require('../db-postgres');
const { ok } = require('../utils/response');

const router = express.Router();

// GET /api/settings — paramètres publics de l'atelier identifié.
// La modification se fait uniquement depuis l'espace développeur
// (/api/gestion/ateliers/:id/settings), jamais depuis une route publique.
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT cle, valeur FROM settings WHERE atelier_id = $1 ORDER BY cle`,
      [req.atelier.id]
    );

    const settings = {};
    for (const row of result.rows) settings[row.cle] = row.valeur;

    if (settings.horaires) {
      try {
        settings.horaires = JSON.parse(settings.horaires);
      } catch {
        // valeur conservée telle quelle
      }
    }

    // Le nom et le logo font foi dans la table `ateliers`.
    settings.nom = req.atelier.nom;
    settings.logo_url = req.atelier.logo_url || '';
    settings.slug = req.atelier.slug;

    return ok(res, settings, 'Paramètres récupérés avec succès.');
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
