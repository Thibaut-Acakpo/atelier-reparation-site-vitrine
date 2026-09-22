const express = require('express');
const fs = require('fs');
const path = require('path');
const db = require('../../db');
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
// Liste toutes les demandes de réparation
// ============================================================
router.get('/', (req, res, next) => {
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
      JOIN clients c ON c.id = d.client_id
      JOIN appareils a ON a.id = d.appareil_id
    `;

    const params = [];

    if (statut && STATUTS_TRAITEMENT.includes(statut)) {
      query += ` WHERE d.statut_traitement = ?`;
      params.push(statut);
    }

    query += ` ORDER BY d.created_at DESC`;

    const rows = db.prepare(query).all(...params);

    return ok(res, rows);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// GET /api/admin/demandes/:id
// Afficher une demande précise
// ============================================================
router.get('/:id', (req, res, next) => {
  try {
    const row = db
      .prepare(
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
        JOIN clients c ON c.id = d.client_id
        JOIN appareils a ON a.id = d.appareil_id
        WHERE d.id = ?
        `
      )
      .get(req.params.id);

    if (!row) {
      return fail(res, 'Demande introuvable.', 404);
    }

    return ok(res, row);
  } catch (err) {
    next(err);
  }
});

// ============================================================
// PATCH /api/admin/demandes/:id
// Modifier le statut de traitement de la demande
// ============================================================
router.patch('/:id', (req, res, next) => {
  try {
    const statut = cleanText(
      req.body.statut_traitement || ''
    );

    if (!STATUTS_TRAITEMENT.includes(statut)) {
      return fail(
        res,
        'Statut de traitement invalide.',
        422,
        ['statut_traitement']
      );
    }

    const result = db
      .prepare(
        `
        UPDATE demandes_reparation
        SET statut_traitement = ?
        WHERE id = ?
        `
      )
      .run(statut, req.params.id);

    if (result.changes === 0) {
      return fail(res, 'Demande introuvable.', 404);
    }

    return ok(res, null, 'Statut mis à jour.');
  } catch (err) {
    next(err);
  }
});

// ============================================================
// POST /api/admin/demandes/:id/convertir
// Convertir une demande en fiche de réparation
// ============================================================
router.post('/:id/convertir', (req, res, next) => {
  try {
    const demande = db
      .prepare(
        `
        SELECT *
        FROM demandes_reparation
        WHERE id = ?
        `
      )
      .get(req.params.id);

    if (!demande) {
      return fail(res, 'Demande introuvable.', 404);
    }

    const dejaConvertie = db
      .prepare(
        `
        SELECT id
        FROM reparations
        WHERE demande_id = ?
        `
      )
      .get(demande.id);

    if (dejaConvertie) {
      return fail(
        res,
        'Cette demande a déjà été convertie en fiche de réparation.',
        409
      );
    }

    const premierStatut = db
      .prepare(
        `
        SELECT id, code
        FROM statuts_reparation
        ORDER BY ordre ASC
        LIMIT 1
        `
      )
      .get();

    if (!premierStatut) {
      return fail(
        res,
        "Aucun statut n'est configuré. Lancez le seed des statuts.",
        500
      );
    }

    const codePublic = generateCodePublic();

    const insertion = db
      .prepare(
        `
        INSERT INTO reparations
        (
          numero_fiche,
          code_public,
          client_id,
          appareil_id,
          demande_id,
          statut_id,
          visible_publiquement
        )
        VALUES (?, ?, ?, ?, ?, ?, 1)
        `
      )
      .run(
        'TEMP',
        codePublic,
        demande.client_id,
        demande.appareil_id,
        demande.id,
        premierStatut.id
      );

    const numeroFiche = generateNumeroFiche(
      insertion.lastInsertRowid
    );

    db.prepare(
      `
      UPDATE reparations
      SET numero_fiche = ?
      WHERE id = ?
      `
    ).run(
      numeroFiche,
      insertion.lastInsertRowid
    );

    db.prepare(
      `
      INSERT INTO historique_reparation
      (
        reparation_id,
        statut_id,
        commentaire
      )
      VALUES (?, ?, ?)
      `
    ).run(
      insertion.lastInsertRowid,
      premierStatut.id,
      'Fiche créée à partir de la demande en ligne.'
    );

    db.prepare(
      `
      UPDATE demandes_reparation
      SET statut_traitement = 'convertie'
      WHERE id = ?
      `
    ).run(demande.id);

    return ok(
      res,
      {
        id: insertion.lastInsertRowid,
        numero_fiche: numeroFiche,
        code_public: codePublic,
      },
      'Fiche de réparation créée. Communiquez le code de suivi au client.',
      201
    );
  } catch (err) {
    next(err);
  }
});

// ============================================================
// DELETE /api/admin/demandes/:id
// Supprimer une demande de réparation
//
// Si la demande avait déjà été convertie en fiche de réparation,
// la fiche liée est également supprimée.
//
// L'historique et les pièces liées à la réparation sont supprimés
// automatiquement grâce aux ON DELETE CASCADE de la base.
// ============================================================
router.delete('/:id', (req, res, next) => {
  try {
    const demande = db
      .prepare(
        `
        SELECT *
        FROM demandes_reparation
        WHERE id = ?
        `
      )
      .get(req.params.id);

    if (!demande) {
      return fail(res, 'Demande introuvable.', 404);
    }

    // Chercher les éventuelles fiches de réparation liées.
    const reparations = db
      .prepare(
        `
        SELECT id
        FROM reparations
        WHERE demande_id = ?
        `
      )
      .all(demande.id);

    // ----------------------------------------------------------
    // Début de la transaction SQLite.
    //
    // Avec node:sqlite, DatabaseSync ne possède pas
    // db.transaction() comme better-sqlite3.
    // On utilise donc BEGIN / COMMIT / ROLLBACK.
    // ----------------------------------------------------------
    db.exec('BEGIN');

    try {
      // --------------------------------------------------------
      // 1. Supprimer les fiches de réparation liées
      // --------------------------------------------------------
      for (const reparation of reparations) {
        db.prepare(
          `
          DELETE FROM reparations
          WHERE id = ?
          `
        ).run(reparation.id);
      }

      // --------------------------------------------------------
      // 2. Supprimer la demande
      // --------------------------------------------------------
      db.prepare(
        `
        DELETE FROM demandes_reparation
        WHERE id = ?
        `
      ).run(demande.id);

      // --------------------------------------------------------
      // 3. Vérifier si le client est encore utilisé ailleurs
      // --------------------------------------------------------
      const clientUtilise = db
        .prepare(
          `
          SELECT 1
          FROM demandes_reparation
          WHERE client_id = ?

          UNION

          SELECT 1
          FROM reparations
          WHERE client_id = ?

          UNION

          SELECT 1
          FROM rendez_vous
          WHERE client_id = ?

          LIMIT 1
          `
        )
        .get(
          demande.client_id,
          demande.client_id,
          demande.client_id
        );

      // --------------------------------------------------------
      // 4. Supprimer le client s'il n'est plus utilisé
      // --------------------------------------------------------
      if (!clientUtilise) {
        db.prepare(
          `
          DELETE FROM clients
          WHERE id = ?
          `
        ).run(demande.client_id);
      }

      // --------------------------------------------------------
      // 5. Valider la transaction
      // --------------------------------------------------------
      db.exec('COMMIT');
    } catch (transactionError) {
      // --------------------------------------------------------
      // En cas d'erreur, annuler toutes les suppressions.
      // --------------------------------------------------------
      try {
        db.exec('ROLLBACK');
      } catch {
        // Rien à faire si le rollback échoue.
      }

      throw transactionError;
    }

    // ----------------------------------------------------------
    // 6. Supprimer la photo jointe
    // ----------------------------------------------------------
    //
    // La suppression de la base est déjà terminée.
    // Si la photo n'existe plus, ce n'est pas une erreur.
    // ----------------------------------------------------------
    if (demande.photo_path) {
      try {
        const filename = path.basename(demande.photo_path);

        const uploadDir = path.resolve(
          process.env.UPLOAD_DIR || './uploads'
        );

        const filePath = path.join(
          uploadDir,
          filename
        );

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (photoError) {
        // La demande a bien été supprimée de la base.
        // Une éventuelle erreur sur la photo ne doit pas
        // provoquer une erreur 500.
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
    next(err);
  }
});

module.exports = router;