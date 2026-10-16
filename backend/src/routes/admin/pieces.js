const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const { requireRole } = require('../../middleware/auth');

const router = express.Router();

// ============================================================
// GET /api/admin/pieces
// Consultation ouverte aux deux rôles.
// Uniquement les pièces de l'atelier connecté.
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT *
      FROM pieces
      WHERE atelier_id = $1
      ORDER BY nom ASC
      `,
      [req.admin.atelier_id]
    );

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/admin/pieces
// Ajouter une pièce au catalogue de l'atelier connecté.
// ============================================================
router.post('/', async (req, res, next) => {
  try {
    const nom = cleanText(
      req.body.nom || ''
    );

    const reference =
      cleanText(
        req.body.reference || ''
      ) || null;

    if (!nom) {
      return fail(
        res,
        'Le nom de la pièce est requis.',
        422,
        ['nom']
      );
    }

    const result = await db.query(
      `
      INSERT INTO pieces (
        nom,
        reference,
        atelier_id
      )
      VALUES ($1, $2, $3)
      RETURNING id
      `,
      [
        nom,
        reference,
        req.admin.atelier_id,
      ]
    );

    return ok(
      res,
      {
        id: result.rows[0].id,
        nom,
        reference,
        atelier_id:
          req.admin.atelier_id,
      },
      'Pièce ajoutée au catalogue.',
      201
    );
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/admin/pieces/:id
// Suppression réservée au compte Technicien.
// La pièce doit appartenir à l'atelier connecté.
// ============================================================
router.delete(
  '/:id',
  requireRole('technicien'),
  async (req, res, next) => {
    try {
      const result = await db.query(
        `
        DELETE FROM pieces
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
        return fail(
          res,
          'Pièce introuvable.',
          404
        );
      }

      return ok(
        res,
        null,
        'Pièce supprimée du catalogue.'
      );
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
