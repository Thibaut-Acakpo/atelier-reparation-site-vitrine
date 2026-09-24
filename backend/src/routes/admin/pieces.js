const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const { requireRole } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/pieces — consultation ouverte aux deux rôles.
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM pieces ORDER BY nom ASC`
    );

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pieces — ajouter une pièce au catalogue.
// Ouvert aux deux rôles : l'Assistant technicien doit pouvoir ajouter une
// pièce qu'il vient d'utiliser, sans attendre le gérant.
router.post('/', async (req, res, next) => {
  try {
    const nom = cleanText(req.body.nom || '');
    const reference = cleanText(req.body.reference || '') || null;

    if (!nom) {
      return fail(res, 'Le nom de la pièce est requis.', 422, ['nom']);
    }

    const result = await db.query(
      `INSERT INTO pieces (nom, reference)
       VALUES ($1, $2)
       RETURNING id`,
      [nom, reference]
    );

    return ok(
      res,
      {
        id: result.rows[0].id,
        nom,
        reference,
      },
      'Pièce ajoutée au catalogue.',
      201
    );
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/pieces/:id — suppression réservée au compte "Technicien"
// pour éviter qu'une pièce encore utilisée sur d'anciennes fiches ne soit
// retirée par erreur par le compte partagé.
router.delete('/:id', requireRole('technicien'), async (req, res, next) => {
  try {
    await db.query(
      `DELETE FROM pieces WHERE id = $1`,
      [req.params.id]
    );

    return ok(res, null, 'Pièce supprimée du catalogue.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;