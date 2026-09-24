const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const { requireRole } = require('../../middleware/auth');

const router = express.Router();

// Champs financiers/commerciaux invisibles pour le compte "Assistant
// technicien" : coût, décision du devis. Un apprenti n'a pas à connaître
// les prix pratiqués par l'atelier.
const CHAMPS_RESERVES_TECHNICIEN = [
  'cout',
  'devis_decision',
  'devis_decision_date',
];

function masquerChampsReserves(objet, role) {
  if (role === 'technicien') return objet;

  const copie = { ...objet };

  CHAMPS_RESERVES_TECHNICIEN.forEach((champ) => {
    delete copie[champ];
  });

  return copie;
}

// GET /api/admin/reparations?q=REP-2026&statut=diagnostic_termine
router.get('/', async (req, res, next) => {
  try {
    const { q, statut } = req.query;

    let query = `
      SELECT
        r.id,
        r.numero_fiche,
        r.code_public,
        r.cout,
        r.devis_decision,
        r.date_estimee_recuperation,
        r.visible_publiquement,
        r.created_at,
        r.updated_at,
        s.code AS statut_code,
        s.libelle AS statut_libelle,
        c.nom_complet,
        c.telephone,
        a.type AS appareil_type,
        a.marque AS appareil_marque,
        a.modele AS appareil_modele
      FROM reparations r
      JOIN statuts_reparation s ON s.id = r.statut_id
      JOIN clients c ON c.id = r.client_id
      JOIN appareils a ON a.id = r.appareil_id
    `;

    const clauses = [];
    const params = [];

    if (q) {
      clauses.push(
        `(r.numero_fiche ILIKE $${params.length + 1}
          OR c.nom_complet ILIKE $${params.length + 2}
          OR c.telephone ILIKE $${params.length + 3})`
      );

      const like = `%${q}%`;
      params.push(like, like, like);
    }

    if (statut) {
      clauses.push(`s.code = $${params.length + 1}`);
      params.push(statut);
    }

    if (clauses.length) {
      query += ` WHERE ${clauses.join(' AND ')}`;
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await db.query(query, params);

    return ok(
      res,
      result.rows.map((r) =>
        masquerChampsReserves(r, req.admin.role)
      )
    );
  } catch (err) {
    next(err);
  }
});

async function getReparationDetaillee(id) {
  const reparationResult = await db.query(
    `SELECT
       r.*,
       s.code AS statut_code,
       s.libelle AS statut_libelle,
       c.nom_complet,
       c.telephone,
       c.email,
       a.type AS appareil_type,
       a.marque AS appareil_marque,
       a.modele AS appareil_modele
     FROM reparations r
     JOIN statuts_reparation s ON s.id = r.statut_id
     JOIN clients c ON c.id = r.client_id
     JOIN appareils a ON a.id = r.appareil_id
     WHERE r.id = $1`,
    [id]
  );

  if (reparationResult.rowCount === 0) {
    return null;
  }

  const reparation = reparationResult.rows[0];

  const historiqueResult = await db.query(
    `SELECT
       h.id,
       h.commentaire,
       h.created_at,
       s.libelle AS statut
     FROM historique_reparation h
     JOIN statuts_reparation s ON s.id = h.statut_id
     WHERE h.reparation_id = $1
     ORDER BY h.created_at ASC`,
    [id]
  );

  reparation.historique = historiqueResult.rows;

  const piecesResult = await db.query(
    `SELECT
       rp.id AS reparation_piece_id,
       p.id AS piece_id,
       p.nom,
       p.reference,
       rp.quantite
     FROM reparation_pieces rp
     JOIN pieces p ON p.id = rp.piece_id
     WHERE rp.reparation_id = $1`,
    [id]
  );

  reparation.pieces = piecesResult.rows;

  return reparation;
}

// GET /api/admin/reparations/:id
router.get('/:id', async (req, res, next) => {
  try {
    const reparation = await getReparationDetaillee(req.params.id);

    if (!reparation) {
      return fail(res, 'Fiche introuvable.', 404);
    }

    return ok(
      res,
      masquerChampsReserves(reparation, req.admin.role)
    );
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/reparations/:id — mise à jour du statut, diagnostic, coût,
// date estimée, visibilité publique. Un changement de statut ajoute
// automatiquement une entrée à l'historique (section 25).
//
// Le compte "Assistant technicien" peut modifier le statut, la description,
// le diagnostic et la date estimée, mais jamais le coût ni la visibilité
// publique de la fiche (décisions réservées au compte "Technicien").
router.patch('/:id', async (req, res, next) => {
  try {
    const reparationResult = await db.query(
      `SELECT * FROM reparations WHERE id = $1`,
      [req.params.id]
    );

    if (reparationResult.rowCount === 0) {
      return fail(res, 'Fiche introuvable.', 404);
    }

    const reparation = reparationResult.rows[0];

    const champsAutorises =
      req.admin.role === 'technicien'
        ? [
            'statut_id',
            'description_statut',
            'diagnostic',
            'cout',
            'date_estimee_recuperation',
            'visible_publiquement',
          ]
        : [
            'statut_id',
            'description_statut',
            'diagnostic',
            'date_estimee_recuperation',
          ];

    const updates = {};

    if (req.body.statut_id !== undefined) {
      const statutResult = await db.query(
        `SELECT id FROM statuts_reparation WHERE id = $1`,
        [req.body.statut_id]
      );

      if (statutResult.rowCount === 0) {
        return fail(res, 'Statut invalide.', 422, ['statut_id']);
      }

      updates.statut_id = statutResult.rows[0].id;
    }

    if (req.body.description_statut !== undefined) {
      updates.description_statut = cleanText(
        req.body.description_statut
      );
    }

    if (req.body.diagnostic !== undefined) {
      updates.diagnostic = cleanText(req.body.diagnostic);
    }

    if (req.body.cout !== undefined) {
      const cout =
        req.body.cout === null || req.body.cout === ''
          ? null
          : Number(req.body.cout);

      if (cout !== null && (Number.isNaN(cout) || cout < 0)) {
        return fail(res, 'Coût invalide.', 422, ['cout']);
      }

      updates.cout = cout;
    }

    if (req.body.date_estimee_recuperation !== undefined) {
      updates.date_estimee_recuperation =
        req.body.date_estimee_recuperation
          ? cleanText(req.body.date_estimee_recuperation)
          : null;
    }

    if (req.body.visible_publiquement !== undefined) {
      updates.visible_publiquement =
        req.body.visible_publiquement ? 1 : 0;
    }

    // Ne retient que les champs effectivement autorisés pour ce rôle — un
    // champ interdit envoyé quand même est silencieusement ignoré.
    const cles = Object.keys(updates).filter((k) =>
      champsAutorises.includes(k)
    );

    if (cles.length === 0) {
      return fail(
        res,
        'Aucune modification valide fournie.',
        422
      );
    }

    const values = cles.map((k) => updates[k]);

    const setClause = cles
      .map((k, index) => `${k} = $${index + 1}`)
      .join(', ');

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE reparations
         SET ${setClause},
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $${values.length + 1}`,
        [...values, req.params.id]
      );

      // Historique automatique en cas de changement de statut.
      if (
        updates.statut_id &&
        updates.statut_id !== reparation.statut_id
      ) {
        const commentaire =
          cleanText(req.body.commentaire_historique || '') || null;

        await client.query(
          `INSERT INTO historique_reparation
             (reparation_id, statut_id, commentaire)
           VALUES ($1, $2, $3)`,
          [
            req.params.id,
            updates.statut_id,
            commentaire,
          ]
        );
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    const reparationMiseAJour =
      await getReparationDetaillee(req.params.id);

    return ok(
      res,
      masquerChampsReserves(
        reparationMiseAJour,
        req.admin.role
      ),
      'Fiche mise à jour.'
    );
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/reparations/:id/devis — enregistrer l'acceptation ou le
// refus du devis, communiqué par le client via WhatsApp (section 12).
// Réservé au compte "Technicien" : décision commerciale.
router.patch(
  '/:id/devis',
  requireRole('technicien'),
  async (req, res, next) => {
    try {
      const decision = cleanText(
        req.body.devis_decision || ''
      );

      if (
        !['accepte', 'refuse', 'en_attente'].includes(decision)
      ) {
        return fail(
          res,
          'Décision invalide.',
          422,
          ['devis_decision']
        );
      }

      const result = await db.query(
        `UPDATE reparations
         SET devis_decision = $1,
             devis_decision_date = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [decision, req.params.id]
      );

      if (result.rowCount === 0) {
        return fail(res, 'Fiche introuvable.', 404);
      }

      return ok(
        res,
        null,
        'Décision du devis enregistrée.'
      );
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/admin/reparations/:id/pieces — ajouter une pièce utilisée.
// Ouvert aux deux rôles : c'est un geste opérationnel du quotidien.
router.post(
  '/:id/pieces',
  async (req, res, next) => {
    try {
      const reparationResult = await db.query(
        `SELECT id FROM reparations WHERE id = $1`,
        [req.params.id]
      );

      if (reparationResult.rowCount === 0) {
        return fail(res, 'Fiche introuvable.', 404);
      }

      const pieceId = Number(req.body.piece_id);
      const quantite = Number(req.body.quantite) || 1;

      const pieceResult = await db.query(
        `SELECT id FROM pieces WHERE id = $1`,
        [pieceId]
      );

      if (pieceResult.rowCount === 0) {
        return fail(res, 'Pièce invalide.', 422, ['piece_id']);
      }

      await db.query(
        `INSERT INTO reparation_pieces
           (reparation_id, piece_id, quantite)
         VALUES ($1, $2, $3)`,
        [
          req.params.id,
          pieceId,
          quantite,
        ]
      );

      const reparation =
        await getReparationDetaillee(req.params.id);

      return ok(
        res,
        masquerChampsReserves(
          reparation,
          req.admin.role
        ),
        'Pièce ajoutée.',
        201
      );
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/admin/reparations/:id/pieces/:reparationPieceId
// Ouvert aux deux rôles, au même titre que l'ajout.
router.delete(
  '/:id/pieces/:reparationPieceId',
  async (req, res, next) => {
    try {
      await db.query(
        `DELETE FROM reparation_pieces
         WHERE id = $1
           AND reparation_id = $2`,
        [
          req.params.reparationPieceId,
          req.params.id,
        ]
      );

      const reparation =
        await getReparationDetaillee(req.params.id);

      return ok(
        res,
        masquerChampsReserves(
          reparation,
          req.admin.role
        ),
        'Pièce retirée.'
      );
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;