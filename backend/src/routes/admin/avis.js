const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const { requireRole } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/avis?statut=en_attente
// Consultation ouverte aux deux rôles.
// Les avis sont limités à l'atelier connecté.
router.get('/', async (req, res, next) => {
  try {
    const { statut } = req.query;

    let query = `
      SELECT *
      FROM avis
      WHERE atelier_id = $1
    `;

    const params = [req.admin.atelier_id];

    if (
      statut &&
      ['en_attente', 'valide', 'refuse'].includes(statut)
    ) {
      query += ` AND statut = $2`;
      params.push(statut);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/avis/:id
// Seul le technicien peut valider ou refuser un avis.
// L'avis doit appartenir à l'atelier connecté.
router.patch(
  '/:id',
  requireRole('technicien'),
  async (req, res, next) => {
    try {
      const statut = cleanText(req.body.statut || '');

      if (!['en_attente', 'valide', 'refuse'].includes(statut)) {
        return fail(
          res,
          'Statut invalide.',
          422,
          ['statut']
        );
      }

      const result = await db.query(
        `
        UPDATE avis
        SET statut = $1
        WHERE id = $2
          AND atelier_id = $3
        RETURNING id
        `,
        [
          statut,
          req.params.id,
          req.admin.atelier_id,
        ]
      );

      if (result.rowCount === 0) {
        return fail(res, 'Avis introuvable.', 404);
      }

      return ok(res, null, 'Avis mis à jour.');
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/admin/avis/:id
// Seul le technicien peut supprimer un avis.
// L'avis doit appartenir à l'atelier connecté.
router.delete(
  '/:id',
  requireRole('technicien'),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        DELETE FROM avis
        WHERE id = $1
          AND atelier_id = $2
        RETURNING id
        `,
        [
          req.params.id,
          req.admin.atelier_id,
        ]
      );

      if (result.rowCount === 0) {
        return fail(res, 'Avis introuvable.', 404);
      }

      return ok(res, null, 'Avis supprimé.');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
