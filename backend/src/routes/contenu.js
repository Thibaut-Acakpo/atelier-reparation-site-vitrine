const express = require('express');
const db = require('../db');
const { ok } = require('../utils/response');

const router = express.Router();

// GET /api/realisations
router.get('/realisations', (req, res, next) => {
  try {
    const rows = db
      .prepare(
        `SELECT id, titre, type_appareil, marque, modele, probleme, intervention, image_avant, image_apres
         FROM realisations WHERE publie = 1 ORDER BY created_at DESC`
      )
      .all();
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/services
router.get('/services', (req, res, next) => {
  try {
    const rows = db.prepare(`SELECT id, titre, description, icone FROM services ORDER BY ordre ASC`).all();
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/appareils
router.get('/appareils', (req, res, next) => {
  try {
    const rows = db
      .prepare(`SELECT id, code, titre, description, icone FROM categories_appareils ORDER BY ordre ASC`)
      .all();
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/faq
router.get('/faq', (req, res, next) => {
  try {
    const rows = db.prepare(`SELECT id, question, reponse FROM faq ORDER BY ordre ASC`).all();
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/avis-valides — utilisé par l'accueil (section 8.1, uniquement les avis validés)
router.get('/avis-valides', (req, res, next) => {
  try {
    const rows = db
      .prepare(`SELECT id, nom, note, commentaire, created_at FROM avis WHERE statut = 'valide' ORDER BY created_at DESC LIMIT 12`)
      .all();
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
