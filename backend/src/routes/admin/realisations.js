const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const { upload, verifyUploadedImage } = require('../../middleware/upload');
const { requireRole } = require('../../middleware/auth');

const router = express.Router();

const photosFields = upload.fields([
  { name: 'photo_avant', maxCount: 1 },
  { name: 'photo_apres', maxCount: 1 },
]);

// GET /api/admin/realisations — inclut les réalisations non publiées.
// Consultation ouverte aux deux rôles.
router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(
      `SELECT * FROM realisations ORDER BY created_at DESC`
    );

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// La galerie publique est une vitrine commerciale : sa création, sa
// modification et sa suppression sont réservées au compte "Technicien"
// (gérant). Le compte "Assistant technicien" peut la consulter mais pas la
// modifier.

// POST /api/admin/realisations
router.post(
  '/',
  requireRole('technicien'),
  photosFields,
  verifyUploadedImage,
  async (req, res, next) => {
    try {
      const data = {
        titre: cleanText(req.body.titre || ''),
        type_appareil: cleanText(req.body.type_appareil || ''),
        marque: cleanText(req.body.marque || ''),
        modele: cleanText(req.body.modele || ''),
        probleme: cleanText(req.body.probleme || ''),
        intervention: cleanText(req.body.intervention || ''),
        publie: req.body.publie === 'false' ? 0 : 1,
      };

      if (
        !data.titre ||
        !data.type_appareil ||
        !data.probleme ||
        !data.intervention
      ) {
        return fail(
          res,
          'Titre, type d’appareil, problème et intervention sont requis.',
          422
        );
      }

      const imageAvant = req.files?.photo_avant?.[0]
        ? `/uploads/${req.files.photo_avant[0].filename}`
        : null;

      const imageApres = req.files?.photo_apres?.[0]
        ? `/uploads/${req.files.photo_apres[0].filename}`
        : null;

      const result = await db.query(
        `INSERT INTO realisations (
          titre,
          type_appareil,
          marque,
          modele,
          probleme,
          intervention,
          image_avant,
          image_apres,
          publie
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          data.titre,
          data.type_appareil,
          data.marque,
          data.modele,
          data.probleme,
          data.intervention,
          imageAvant,
          imageApres,
          data.publie,
        ]
      );

      return ok(
        res,
        { id: result.rows[0].id },
        'Réalisation ajoutée.',
        201
      );
    } catch (err) {
      next(err);
    }
  }
);

// PATCH /api/admin/realisations/:id
router.patch(
  '/:id',
  requireRole('technicien'),
  photosFields,
  verifyUploadedImage,
  async (req, res, next) => {
    try {
      const existant = await db.query(
        `SELECT * FROM realisations WHERE id = $1`,
        [req.params.id]
      );

      if (existant.rowCount === 0) {
        return fail(res, 'Réalisation introuvable.', 404);
      }

      const champsTexte = [
        'titre',
        'type_appareil',
        'marque',
        'modele',
        'probleme',
        'intervention',
      ];

      const updates = {};

      champsTexte.forEach((champ) => {
        if (req.body[champ] !== undefined) {
          updates[champ] = cleanText(req.body[champ]);
        }
      });

      if (req.body.publie !== undefined) {
        updates.publie =
          req.body.publie === 'false' || req.body.publie === false ? 0 : 1;
      }

      if (req.files?.photo_avant?.[0]) {
        updates.image_avant =
          `/uploads/${req.files.photo_avant[0].filename}`;
      }

      if (req.files?.photo_apres?.[0]) {
        updates.image_apres =
          `/uploads/${req.files.photo_apres[0].filename}`;
      }

      const cles = Object.keys(updates);

      if (cles.length === 0) {
        return fail(res, 'Aucune modification fournie.', 422);
      }

      const valeurs = cles.map((cle) => updates[cle]);

      const setClause = cles
        .map((cle, index) => `${cle} = $${index + 1}`)
        .join(', ');

      await db.query(
        `UPDATE realisations
         SET ${setClause}
         WHERE id = $${valeurs.length + 1}`,
        [...valeurs, req.params.id]
      );

      const updated = await db.query(
        `SELECT * FROM realisations WHERE id = $1`,
        [req.params.id]
      );

      return ok(
        res,
        updated.rows[0],
        'Réalisation mise à jour.'
      );
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/admin/realisations/:id
router.delete(
  '/:id',
  requireRole('technicien'),
  async (req, res, next) => {
    try {
      await db.query(
        `DELETE FROM realisations WHERE id = $1`,
        [req.params.id]
      );

      return ok(res, null, 'Réalisation supprimée.');
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;