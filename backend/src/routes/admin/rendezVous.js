const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const {
  cleanText,
  isFutureDate,
  isWithinBusinessHours,
} = require('../../utils/validation');

const router = express.Router();

const STATUTS = ['en_attente', 'confirme', 'modifie', 'refuse'];

// GET /api/admin/rendez-vous?statut=en_attente
router.get('/', async (req, res, next) => {
  try {
    const { statut } = req.query;

    let query = `
      SELECT r.*, c.nom_complet, c.telephone, c.email
      FROM rendez_vous r
      JOIN clients c ON c.id = r.client_id
    `;

    const params = [];

    if (statut && STATUTS.includes(statut)) {
      query += ` WHERE r.statut = $1`;
      params.push(statut);
    }

    query += ` ORDER BY r.date_souhaitee ASC, r.heure_souhaitee ASC`;

    const result = await db.query(query, params);

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/rendez-vous/:id — confirmer, refuser, ou proposer une nouvelle date/heure
router.patch('/:id', async (req, res, next) => {
  try {
    const existantResult = await db.query(
      `SELECT * FROM rendez_vous WHERE id = $1`,
      [req.params.id]
    );

    if (existantResult.rowCount === 0) {
      return fail(res, 'Rendez-vous introuvable.', 404);
    }

    const existant = existantResult.rows[0];

    const statut = cleanText(req.body.statut || existant.statut);

    if (!STATUTS.includes(statut)) {
      return fail(res, 'Statut invalide.', 422, ['statut']);
    }

    let dateSouhaitee = existant.date_souhaitee;
    let heureSouhaitee = existant.heure_souhaitee;

    if (statut === 'modifie') {
      dateSouhaitee = cleanText(req.body.date_souhaitee || '');
      heureSouhaitee = cleanText(req.body.heure_souhaitee || '');

      if (!isFutureDate(dateSouhaitee)) {
        return fail(
          res,
          'Nouvelle date invalide.',
          422,
          ['date_souhaitee']
        );
      }

      if (!isWithinBusinessHours(dateSouhaitee, heureSouhaitee)) {
        return fail(
          res,
          "Nouvelle heure hors des horaires de l'atelier.",
          422,
          ['heure_souhaitee']
        );
      }
    }

    await db.query(
      `UPDATE rendez_vous
       SET statut = $1,
           date_souhaitee = $2,
           heure_souhaitee = $3
       WHERE id = $4`,
      [
        statut,
        dateSouhaitee,
        heureSouhaitee,
        req.params.id,
      ]
    );

    return ok(res, null, 'Rendez-vous mis à jour.');
  } catch (err) {
    next(err);
  }
});

module.exports = router;