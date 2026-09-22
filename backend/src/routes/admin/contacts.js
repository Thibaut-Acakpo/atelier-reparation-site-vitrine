const express = require('express');
const db = require('../../db');
const { ok, fail } = require('../../utils/response');

const router = express.Router();

// GET /api/admin/contacts?traite=0
router.get('/', (req, res, next) => {
  try {
    const { traite } = req.query;
    let query = `SELECT * FROM contacts`;
    const params = [];
    if (traite === '0' || traite === '1') {
      query += ` WHERE traite = ?`;
      params.push(Number(traite));
    }
    query += ` ORDER BY created_at DESC`;
    return ok(res, db.prepare(query).all(...params));
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/contacts/:id — marquer comme traité / non traité
router.patch('/:id', (req, res, next) => {
  try {
    const traite = req.body.traite ? 1 : 0;
    const result = db.prepare(`UPDATE contacts SET traite = ? WHERE id = ?`).run(traite, req.params.id);
    if (result.changes === 0) return fail(res, 'Message introuvable.', 404);
    return ok(res, null, 'Message mis à jour.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
