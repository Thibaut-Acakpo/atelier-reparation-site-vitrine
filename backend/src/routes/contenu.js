const express = require('express');
const db = require('../db-postgres');
const { ok } = require('../utils/response');

const router = express.Router();

// GET /api/realisations
router.get('/realisations', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        titre,
        type_appareil,
        marque,
        modele,
        probleme,
        intervention,
        image_avant,
        image_apres
      FROM realisations
      WHERE publie = 1
      ORDER BY created_at DESC
    `);

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/services
router.get('/services', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        titre,
        description,
        icone
      FROM services
      ORDER BY ordre ASC
    `);

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/appareils
router.get('/appareils', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        code,
        titre,
        description,
        icone
      FROM categories_appareils
      ORDER BY ordre ASC
    `);

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/faq
router.get('/faq', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        question,
        reponse
      FROM faq
      ORDER BY ordre ASC
    `);

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/avis-valides
// Utilisé par l'accueil : uniquement les avis validés.
router.get('/avis-valides', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        nom,
        note,
        commentaire,
        created_at
      FROM avis
      WHERE statut = 'valide'
      ORDER BY created_at DESC
      LIMIT 12
    `);

    return ok(res, result.rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;