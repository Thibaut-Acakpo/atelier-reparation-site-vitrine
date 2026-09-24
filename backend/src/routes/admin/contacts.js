const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');

const router = express.Router();

// GET /api/admin/contacts?traite=0
router.get('/', async (req, res, next) => {
  try {
    const { traite } = req.query;

    let query = `
      SELECT *
      FROM contacts
    `;

    const params = [];

    if (traite === '0' || traite === '1') {
      query += ` WHERE traite = $1`;
      params.push(Number(traite));
    }

    query += ` ORDER BY created_at DESC`;

    const result = await db.query(query, params);

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/contacts/:id
// Marquer comme traité / non traité
router.patch('/:id', async (req, res, next) => {
  try {
    const traite = req.body.traite ? 1 : 0;

    const result = await db.query(
      `
      UPDATE contacts
      SET traite = $1
      WHERE id = $2
      RETURNING id
      `,
      [traite, req.params.id]
    );

    if (result.rowCount === 0) {
      return fail(res, 'Message introuvable.', 404);
    }

    return ok(res, null, 'Message mis à jour.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;