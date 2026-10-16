const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');

const router = express.Router();

// ============================================================
// GET /api/admin/contacts?traite=0
// Liste les messages de contact de l'atelier connecté.
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const { traite } = req.query;

    let query = `
      SELECT *
      FROM contacts
      WHERE atelier_id = $1
    `;

    const params = [req.admin.atelier_id];

    if (traite === '0' || traite === '1') {
      query += `
        AND traite = $2
      `;

      params.push(Number(traite));
    }

    query += `
      ORDER BY created_at DESC
    `;

    const result = await db.query(
      query,
      params
    );

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/admin/contacts/:id
// Marquer un message comme traité / non traité.
// ============================================================
router.patch('/:id', async (req, res, next) => {
  try {
    const traite = req.body.traite ? 1 : 0;

    const result = await db.query(
      `
      UPDATE contacts
      SET traite = $1
      WHERE id = $2
        AND atelier_id = $3
      RETURNING id
      `,
      [
        traite,
        req.params.id,
        req.admin.atelier_id,
      ]
    );

    if (result.rowCount === 0) {
      return fail(
        res,
        'Message introuvable.',
        404
      );
    }

    return ok(
      res,
      null,
      'Message mis à jour.'
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;