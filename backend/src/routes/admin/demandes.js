const express = require('express');
const fs = require('fs');
const path = require('path');

const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const {
  generateNumeroFiche,
  generateCodePublic,
} = require('../../utils/tracking');

const router = express.Router();

const STATUTS_TRAITEMENT = [
  'nouvelle',
  'en_cours_examen',
  'convertie',
  'refusee',
];

// ============================================================
// GET /api/admin/demandes
// Liste les demandes de réparation de l'atelier connecté.
// ============================================================
router.get('/', async (req, res, next) => {
  try {
    const { statut } = req.query;

    let query = `
      SELECT
        d.*,
        c.nom_complet,
        c.telephone,
        c.email,
        a.type,
        a.marque,
        a.modele
      FROM demandes_reparation d
      JOIN clients c
        ON c.id = d.client_id
       AND c.atelier_id = d.atelier_id
      JOIN appareils a
        ON a.id = d.appareil_id
       AND a.atelier_id = d.atelier_id
      WHERE d.atelier_id = $1
    `;

    const params = [req.admin.atelier_id];

    if (
      statut &&
      STATUTS_TRAITEMENT.includes(statut)
    ) {
      query += `
        AND d.statut_traitement = $2
      `;

      params.push(statut);
    }

    query += `
      ORDER BY d.created_at DESC
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
// GET /api/admin/demandes/:id
// Afficher une demande précise de l'atelier connecté.
// ============================================================
router.get('/:id', async (req, res, next) => {
  try {
    const result = await db.query(
      `
      SELECT
        d.*,
        c.nom_complet,
        c.telephone,
        c.email,
        a.type,
        a.marque,
        a.modele
      FROM demandes_reparation d
      JOIN clients c
        ON c.id = d.client_id
       AND c.atelier_id = d.atelier_id
      JOIN appareils a
        ON a.id = d.appareil_id
       AND a.atelier_id = d.atelier_id
      WHERE d.id = $1
        AND d.atelier_id = $2
      `,
      [
        req.params.id,
        req.admin.atelier_id,
      ]
    );

    const row = result.rows[0];

    if (!row) {
      return fail(
        res,
        'Demande introuvable.',
        404
      );
    }

    return ok(res, row);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/admin/demandes/:id
// Modifier le statut de traitement.
// ============================================================
router.patch('/:id', async (req, res, next) => {
  try {
    const statut = cleanText(
      req.body.statut_traitement || ''
    );

    if (
      !STATUTS_TRAITEMENT.includes(statut)
    ) {
      return fail(
        res,
        'Statut de traitement invalide.',
        422,
        ['statut_traitement']
      );
    }

    const result = await db.query(
      `
      UPDATE demandes_reparation
      SET statut_traitement = $1
      WHERE id = $2
        AND atelier_id = $3
      RETURNING id
      `,
      [
        statut,
        req.params.id,
        req.admin.atelier_id,
      ]
    );

    if (result.rowCount === 0) {
      return fail(
        res,
        'Demande introuvable.',
        404
      );
    }

    return ok(
      res,
      null,
      'Statut mis à jour.'
    );
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/admin/demandes/:id/convertir
// Convertir une demande en fiche de réparation.
// ============================================================
router.post(
  '/:id/convertir',
  async (req, res, next) => {
    const client = await db.connect();

    try {
      await client.query('BEGIN');

      const demandeResult =
        await client.query(
          `
          SELECT *
          FROM demandes_reparation
          WHERE id = $1
            AND atelier_id = $2
          FOR UPDATE
          `,
          [
            req.params.id,
            req.admin.atelier_id,
          ]
        );

      const demande =
        demandeResult.rows[0];

      if (!demande) {
        await client.query('ROLLBACK');

        return fail(
          res,
          'Demande introuvable.',
          404
        );
      }

      const dejaConvertieResult =
        await client.query(
          `
          SELECT id
          FROM reparations
          WHERE demande_id = $1
            AND atelier_id = $2
          `,
          [
            demande.id,
            req.admin.atelier_id,
          ]
        );

      const dejaConvertie =
        dejaConvertieResult.rows[0];

      if (dejaConvertie) {
        await client.query('ROLLBACK');

        return fail(
          res,
          'Cette demande a déjà été convertie en fiche de réparation.',
          409
        );
      }

      const premierStatutResult =
        await client.query(
          `
          SELECT id, code
          FROM statuts_reparation
          ORDER BY ordre ASC
          LIMIT 1
          `
        );

      const premierStatut =
        premierStatutResult.rows[0];

      if (!premierStatut) {
        await client.query('ROLLBACK');

        return fail(
          res,
          "Aucun statut n'est configuré. Lancez le seed des statuts.",
          500
        );
      }

      const codePublic =
        generateCodePublic();

      const insertionResult =
        await client.query(
          `
          INSERT INTO reparations
          (
            numero_fiche,
            code_public,
            client_id,
            appareil_id,
            demande_id,
            statut_id,
            visible_publiquement,
            atelier_id
          )
          VALUES
          ($1, $2, $3, $4, $5, $6, 1, $7)
          RETURNING id
          `,
          [
            'TEMP',
            codePublic,
            demande.client_id,
            demande.appareil_id,
            demande.id,
            premierStatut.id,
            req.admin.atelier_id,
          ]
        );

      const reparationId =
        insertionResult.rows[0].id;

      const numeroFiche =
        generateNumeroFiche(
          reparationId
        );

      await client.query(
        `
        UPDATE reparations
        SET numero_fiche = $1
        WHERE id = $2
          AND atelier_id = $3
        `,
        [
          numeroFiche,
          reparationId,
          req.admin.atelier_id,
        ]
      );

      await client.query(
        `
        INSERT INTO historique_reparation
        (
          reparation_id,
          statut_id,
          commentaire
        )
        VALUES ($1, $2, $3)
        `,
        [
          reparationId,
          premierStatut.id,
          'Fiche créée à partir de la demande en ligne.',
        ]
      );

      await client.query(
        `
        UPDATE demandes_reparation
        SET statut_traitement = 'convertie'
        WHERE id = $1
          AND atelier_id = $2
        `,
        [
          demande.id,
          req.admin.atelier_id,
        ]
      );

      await client.query('COMMIT');

      return ok(
        res,
        {
          id: reparationId,
          numero_fiche: numeroFiche,
          code_public: codePublic,
        },
        'Fiche de réparation créée. Communiquez le code de suivi au client.',
        201
      );
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // Rien à faire si le rollback échoue.
      }

      next(err);
    } finally {
      client.release();
    }
  }
);

// ============================================================
// DELETE /api/admin/demandes/:id
// Supprimer une demande de réparation.
//
// La demande et les éventuelles réparations liées doivent
// appartenir au même atelier que l'administrateur connecté.
// ============================================================
router.delete('/:id', async (req, res, next) => {
  const client = await db.connect();

  try {
    const demandeResult =
      await client.query(
        `
        SELECT *
        FROM demandes_reparation
        WHERE id = $1
          AND atelier_id = $2
        `,
        [
          req.params.id,
          req.admin.atelier_id,
        ]
      );

    const demande =
      demandeResult.rows[0];

    if (!demande) {
      client.release();

      return fail(
        res,
        'Demande introuvable.',
        404
      );
    }

    const reparationsResult =
      await client.query(
        `
        SELECT id
        FROM reparations
        WHERE demande_id = $1
          AND atelier_id = $2
        `,
        [
          demande.id,
          req.admin.atelier_id,
        ]
      );

    const reparations =
      reparationsResult.rows;

    await client.query('BEGIN');

    try {
      // --------------------------------------------------------
      // 1. Supprimer les fiches de réparation liées.
      // --------------------------------------------------------
      for (const reparation of reparations) {
        await client.query(
          `
          DELETE FROM reparations
          WHERE id = $1
            AND atelier_id = $2
          `,
          [
            reparation.id,
            req.admin.atelier_id,
          ]
        );
      }

      // --------------------------------------------------------
      // 2. Supprimer la demande.
      // --------------------------------------------------------
      await client.query(
        `
        DELETE FROM demandes_reparation
        WHERE id = $1
          AND atelier_id = $2
        `,
        [
          demande.id,
          req.admin.atelier_id,
        ]
      );

      // --------------------------------------------------------
      // 3. Vérifier si le client est encore utilisé.
      // --------------------------------------------------------
      const clientUtiliseResult =
        await client.query(
          `
          SELECT 1
          FROM demandes_reparation
          WHERE client_id = $1
            AND atelier_id = $2

          UNION

          SELECT 1
          FROM reparations
          WHERE client_id = $1
            AND atelier_id = $2

          UNION

          SELECT 1
          FROM rendez_vous
          WHERE client_id = $1
            AND atelier_id = $2

          LIMIT 1
          `,
          [
            demande.client_id,
            req.admin.atelier_id,
          ]
        );

      const clientUtilise =
        clientUtiliseResult.rows.length > 0;

      // --------------------------------------------------------
      // 4. Supprimer le client s'il n'est plus utilisé
      // dans cet atelier.
      // --------------------------------------------------------
      if (!clientUtilise) {
        await client.query(
          `
          DELETE FROM clients
          WHERE id = $1
            AND atelier_id = $2
          `,
          [
            demande.client_id,
            req.admin.atelier_id,
          ]
        );
      }

      await client.query('COMMIT');
    } catch (transactionError) {
      try {
        await client.query(
          'ROLLBACK'
        );
      } catch {
        // Rien à faire si le rollback échoue.
      }

      throw transactionError;
    }

    // ----------------------------------------------------------
    // 5. Supprimer la photo jointe.
    // ----------------------------------------------------------
    if (demande.photo_path) {
      try {
        const filename =
          path.basename(
            demande.photo_path
          );

        const uploadDir =
          path.resolve(
            process.env.UPLOAD_DIR ||
              './uploads'
          );

        const filePath =
          path.join(
            uploadDir,
            filename
          );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (photoError) {
        console.error(
          '[Suppression photo] Erreur :',
          photoError
        );
      }
    }

    return ok(
      res,
      null,
      'Demande supprimée.'
    );
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Rien à faire si le rollback échoue.
    }

    next(err);
  } finally {
    // Important : le client ne doit être libéré
    // qu'une seule fois.
    client.release();
  }
});

module.exports = router;