const express = require('express');
const db = require('../../db');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const { requireRole } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/avis?statut=en_attente — consultation ouverte aux deux rôles.
router.get('/', (req, res, next) => {
  try {
    const { statut } = req.query;
    let query = `SELECT * FROM avis`;
    const params = [];
    if (statut && ['en_attente', 'valide', 'refuse'].includes(statut)) {
      query += ` WHERE statut = ?`;
      params.push(statut);
    }
    query += ` ORDER BY created_at DESC`;
    return ok(res, db.prepare(query).all(...params));
  } catch (err) {
    next(err);
  }
});

// La modération engage l'image publique de l'atelier : réservée au compte
// "Technicien" (gérant). L'Assistant technicien peut consulter les avis
// mais ne peut ni les valider, ni les refuser, ni les supprimer.

// PATCH /api/admin/avis/:id — valider ou refuser un avis
router.patch('/:id', requireRole('technicien'), (req, res, next) => {
  try {
    const statut = cleanText(req.body.statut || '');
    if (!['en_attente', 'valide', 'refuse'].includes(statut)) {
      return fail(res, 'Statut invalide.', 422, ['statut']);
    }
    const result = db.prepare(`UPDATE avis SET statut = ? WHERE id = ?`).run(statut, req.params.id);
    if (result.changes === 0) return fail(res, 'Avis introuvable.', 404);
    return ok(res, null, 'Avis mis à jour.');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/avis/:id
router.delete('/:id', requireRole('technicien'), (req, res, next) => {
  try {
    db.prepare(`DELETE FROM avis WHERE id = ?`).run(req.params.id);
    return ok(res, null, 'Avis supprimé.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
