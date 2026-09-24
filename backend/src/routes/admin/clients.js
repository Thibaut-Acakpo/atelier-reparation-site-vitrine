const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');

const router = express.Router();

// GET /api/admin/clients?q=nom-ou-telephone
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;

    let query = `
      SELECT *
      FROM clients
    `;

    const params = [];

    if (q) {
      query += `
        WHERE nom_complet ILIKE $1
           OR telephone ILIKE $2
      `;

      const like = `%${q}%`;
      params.push(like, like);
    }

    query += `
      ORDER BY created_at DESC
      LIMIT 200
    `;

    const result = await db.query(query, params);

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/clients/:id
// Fiche client avec ses appareils, réparations et rendez-vous.
router.get('/:id', async (req, res, next) => {
  try {
    const clientResult = await db.query(
      `
      SELECT *
      FROM clients
      WHERE id = $1
      `,
      [req.params.id]
    );

    const client = clientResult.rows[0];

    if (!client) {
      return fail(res, 'Client introuvable.', 404);
    }

    const appareilsResult = await db.query(
      `
      SELECT *
      FROM appareils
      WHERE client_id = $1
      ORDER BY created_at DESC
      `,
      [req.params.id]
    );

    client.appareils = appareilsResult.rows;

    const reparationsResult = await db.query(
      `
      SELECT
        r.id,
        r.numero_fiche,
        r.created_at,
        s.libelle AS statut
      FROM reparations r
      JOIN statuts_reparation s
        ON s.id = r.statut_id
      WHERE r.client_id = $1
      ORDER BY r.created_at DESC
      `,
      [req.params.id]
    );

    client.reparations = reparationsResult.rows;

    const rendezVousResult = await db.query(
      `
      SELECT *
      FROM rendez_vous
      WHERE client_id = $1
      ORDER BY date_souhaitee DESC
      `,
      [req.params.id]
    );

    client.rendez_vous = rendezVousResult.rows;

    return ok(res, client);
  } catch (err) {
    next(err);
  }
});

module.exports = router;