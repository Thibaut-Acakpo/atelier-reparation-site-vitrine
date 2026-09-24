const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const { requireRole } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/avis?statut=en_attente
// Consultation ouverte aux deux rôles.
router.get('/', async (req, res, next) => {
  try {
    const { statut } = req.query;

    let query = `
      SELECT *
      FROM avis
    `;

    const params = [];

    if (
      statut &&
      ['en_attente', 'valide', 'refuse'].includes(statut)
    ) {
      query += ` WHERE statut = $1`;
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
        RETURNING id
        `,
        [statut, req.params.id]
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
router.delete(
  '/:id',
  requireRole('technicien'),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        DELETE FROM avis
        WHERE id = $1
        RETURNING id
        `,
        [req.params.id]
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