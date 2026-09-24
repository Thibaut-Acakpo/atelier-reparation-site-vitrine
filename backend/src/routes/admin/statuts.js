const express = require('express');
const db = require('../../db-postgres');
const { ok } = require('../../utils/response');

const router = express.Router();

// GET /api/admin/statuts — référentiel des statuts (section 11), utilisé
// pour peupler les menus déroulants de l'espace admin.
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM statuts_reparation ORDER BY ordre ASC`
    );

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;