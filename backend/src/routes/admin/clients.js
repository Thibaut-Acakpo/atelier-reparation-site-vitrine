const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');

const router = express.Router();

// ============================================================
// GET /api/admin/clients?q=nom-ou-telephone
// Liste les clients de l'atelier connecté.
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const { q } = req.query;

    let query = `
      SELECT *
      FROM clients
      WHERE atelier_id = $1
    `;

    const params = [req.admin.atelier_id];

    if (q) {
      query += `
        AND (
          nom_complet ILIKE $2
          OR telephone ILIKE $3
        )
      `;

      const like = `%${q}%`;
      params.push(like, like);
    }

    query += `
      ORDER BY created_at DESC
      LIMIT 200
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
// GET /api/admin/clients/:id
// Fiche client avec ses appareils,
// réparations et rendez-vous.
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    // ----------------------------------------------------------
    // 1. Récupérer le client de l'atelier connecté.
    // ----------------------------------------------------------
    const clientResult = await db.query(
      `
      SELECT *
      FROM clients
      WHERE id = $1
        AND atelier_id = $2
      `,
      [
        req.params.id,
        req.admin.atelier_id,
      ]
    );

    const client = clientResult.rows[0];

    if (!client) {
      return fail(
        res,
        'Client introuvable.',
        404
      );
    }

    // ----------------------------------------------------------
    // 2. Appareils du client dans cet atelier.
    // ----------------------------------------------------------
    const appareilsResult =
      await db.query(
        `
        SELECT *
        FROM appareils
        WHERE client_id = $1
          AND atelier_id = $2
        ORDER BY created_at DESC
        `,
        [
          req.params.id,
          req.admin.atelier_id,
        ]
      );

    client.appareils =
      appareilsResult.rows;

    // ----------------------------------------------------------
    // 3. Réparations du client dans cet atelier.
    // ----------------------------------------------------------
    const reparationsResult =
      await db.query(
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
          AND r.atelier_id = $2
        ORDER BY r.created_at DESC
        `,
        [
          req.params.id,
          req.admin.atelier_id,
        ]
      );

    client.reparations =
      reparationsResult.rows;

    // ----------------------------------------------------------
    // 4. Rendez-vous du client dans cet atelier.
    // ----------------------------------------------------------
    const rendezVousResult =
      await db.query(
        `
        SELECT *
        FROM rendez_vous
        WHERE client_id = $1
          AND atelier_id = $2
        ORDER BY date_souhaitee DESC
        `,
        [
          req.params.id,
          req.admin.atelier_id,
        ]
      );

    client.rendez_vous =
      rendezVousResult.rows;

    return ok(res, client);
  } catch (err) {
    next(err);
  }
});

module.exports = router;