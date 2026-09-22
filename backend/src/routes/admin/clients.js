const express = require('express');
const db = require('../../db');
const { ok, fail } = require('../../utils/response');

const router = express.Router();

// GET /api/admin/clients?q=nom-ou-telephone
router.get('/', (req, res, next) => {
  try {
    const { q } = req.query;
    let query = `SELECT * FROM clients`;
    const params = [];
    if (q) {
      query += ` WHERE nom_complet LIKE ? OR telephone LIKE ?`;
      const like = `%${q}%`;
      params.push(like, like);
    }
    query += ` ORDER BY created_at DESC LIMIT 200`;
    return ok(res, db.prepare(query).all(...params));
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/clients/:id — fiche client avec ses appareils et réparations
router.get('/:id', (req, res, next) => {
  try {
    const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(req.params.id);
    if (!client) return fail(res, 'Client introuvable.', 404);

    client.appareils = db.prepare(`SELECT * FROM appareils WHERE client_id = ? ORDER BY created_at DESC`).all(req.params.id);
    client.reparations = db
      .prepare(
        `SELECT r.id, r.numero_fiche, r.created_at, s.libelle AS statut
         FROM reparations r JOIN statuts_reparation s ON s.id = r.statut_id
         WHERE r.client_id = ? ORDER BY r.created_at DESC`
      )
      .all(req.params.id);
    client.rendez_vous = db
      .prepare(`SELECT * FROM rendez_vous WHERE client_id = ? ORDER BY date_souhaitee DESC`)
      .all(req.params.id);

    return ok(res, client);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
