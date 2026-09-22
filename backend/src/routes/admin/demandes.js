const express = require('express');
const db = require('../../db');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');
const { generateNumeroFiche, generateCodePublic } = require('../../utils/tracking');

const router = express.Router();

const STATUTS_TRAITEMENT = ['nouvelle', 'en_cours_examen', 'convertie', 'refusee'];

// GET /api/admin/demandes?statut=nouvelle
router.get('/', (req, res, next) => {
  try {
    const { statut } = req.query;
    let query = `
      SELECT d.*, c.nom_complet, c.telephone, c.email, a.type, a.marque, a.modele
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

// GET /api/admin/demandes/:id
router.get('/:id', (req, res, next) => {
  try {
    const row = db
      .prepare(
        `SELECT d.*, c.nom_complet, c.telephone, c.email, a.type, a.marque, a.modele
         FROM demandes_reparation d
         JOIN clients c ON c.id = d.client_id
         JOIN appareils a ON a.id = d.appareil_id
         WHERE d.id = ?`
      )
      .get(req.params.id);
    if (!row) return fail(res, 'Demande introuvable.', 404);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/admin/demandes/:id — changer le statut de traitement interne (pas le statut de réparation)
router.patch('/:id', (req, res, next) => {
  try {
    const statut = cleanText(req.body.statut_traitement || '');
    if (!STATUTS_TRAITEMENT.includes(statut)) {
      return fail(res, 'Statut de traitement invalide.', 422, ['statut_traitement']);
    }
    const result = db.prepare(`UPDATE demandes_reparation SET statut_traitement = ? WHERE id = ?`).run(statut, req.params.id);
    if (result.changes === 0) return fail(res, 'Demande introuvable.', 404);
    return ok(res, null, 'Statut mis à jour.');
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/demandes/:id/convertir — crée une fiche de réparation
// suivable à partir d'une demande reçue (section 25 : création automatique des numéros).
router.post('/:id/convertir', (req, res, next) => {
  try {
    const demande = db.prepare(`SELECT * FROM demandes_reparation WHERE id = ?`).get(req.params.id);
    if (!demande) return fail(res, 'Demande introuvable.', 404);

    const dejaConvertie = db.prepare(`SELECT id FROM reparations WHERE demande_id = ?`).get(demande.id);
    if (dejaConvertie) {
      return fail(res, 'Cette demande a déjà été convertie en fiche de réparation.', 409);
    }

    const premierStatut = db.prepare(`SELECT id, code FROM statuts_reparation ORDER BY ordre ASC LIMIT 1`).get();
    if (!premierStatut) return fail(res, "Aucun statut n'est configuré. Lancez le seed des statuts.", 500);

    const codePublic = generateCodePublic();

    const insertion = db
      .prepare(
        `INSERT INTO reparations
           (numero_fiche, code_public, client_id, appareil_id, demande_id, statut_id, visible_publiquement)
         VALUES (?, ?, ?, ?, ?, ?, 1)`
      )
      .run('TEMP', codePublic, demande.client_id, demande.appareil_id, demande.id, premierStatut.id);

    const numeroFiche = generateNumeroFiche(insertion.lastInsertRowid);
    db.prepare(`UPDATE reparations SET numero_fiche = ? WHERE id = ?`).run(numeroFiche, insertion.lastInsertRowid);

    db.prepare(`INSERT INTO historique_reparation (reparation_id, statut_id, commentaire) VALUES (?, ?, ?)`).run(
      insertion.lastInsertRowid,
      premierStatut.id,
      'Fiche créée à partir de la demande en ligne.'
    );

    db.prepare(`UPDATE demandes_reparation SET statut_traitement = 'convertie' WHERE id = ?`).run(demande.id);

    return ok(
      res,
      { id: insertion.lastInsertRowid, numero_fiche: numeroFiche, code_public: codePublic },
      'Fiche de réparation créée. Communiquez le code de suivi au client.',
      201
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
