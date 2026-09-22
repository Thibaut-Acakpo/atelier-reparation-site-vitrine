const express = require('express');
const db = require('../../db');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const { requireRole } = require('../../middleware/auth');

const router = express.Router();

// GET /api/admin/pieces — consultation ouverte aux deux rôles.
router.get('/', (req, res, next) => {
  try {
    return ok(res, db.prepare(`SELECT * FROM pieces ORDER BY nom ASC`).all());
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/pieces — ajouter une pièce au catalogue.
// Ouvert aux deux rôles : l'Assistant technicien doit pouvoir ajouter une
// pièce qu'il vient d'utiliser, sans attendre le gérant.
router.post('/', (req, res, next) => {
  try {
    const nom = cleanText(req.body.nom || '');
    const reference = cleanText(req.body.reference || '') || null;
    if (!nom) return fail(res, 'Le nom de la pièce est requis.', 422, ['nom']);

    const result = db.prepare(`INSERT INTO pieces (nom, reference) VALUES (?, ?)`).run(nom, reference);
    return ok(res, { id: result.lastInsertRowid, nom, reference }, 'Pièce ajoutée au catalogue.', 201);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/pieces/:id — suppression réservée au compte "Technicien"
// pour éviter qu'une pièce encore utilisée sur d'anciennes fiches ne soit
// retirée par erreur par le compte partagé.
router.delete('/:id', requireRole('technicien'), (req, res, next) => {
  try {
    db.prepare(`DELETE FROM pieces WHERE id = ?`).run(req.params.id);
    return ok(res, null, 'Pièce supprimée du catalogue.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;
