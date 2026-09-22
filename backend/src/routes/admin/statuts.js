const express = require('express');
const db = require('../../db');
const { ok } = require('../../utils/response');

const router = express.Router();

// GET /api/admin/statuts — référentiel des statuts (section 11), utilisé
// pour peupler les menus déroulants de l'espace admin.
router.get('/', (req, res, next) => {
  try {
    return ok(res, db.prepare(`SELECT * FROM statuts_reparation ORDER BY ordre ASC`).all());
  } catch (err) {
    next(err);
  }
});

module.exports = router;
