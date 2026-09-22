const express = require('express');
const db = require('../../db');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');

const router = express.Router();

// Fabrique un jeu de routes CRUD génériques pour une table de contenu simple.
function crudSimple({ table, champsTexte, champObligatoire }) {
  const sousRouter = express.Router();

  sousRouter.get('/', (req, res, next) => {
    try {
      return ok(res, db.prepare(`SELECT * FROM ${table} ORDER BY ordre ASC, id ASC`).all());
    } catch (err) {
      next(err);
    }
  });

  sousRouter.post('/', (req, res, next) => {
    try {
      const data = {};
      champsTexte.forEach((c) => {
        data[c] = cleanText(req.body[c] || '');
      });
      if (!data[champObligatoire]) return fail(res, `Le champ "${champObligatoire}" est requis.`, 422, [champObligatoire]);
      data.ordre = Number(req.body.ordre) || 0;

      const colonnes = [...champsTexte, 'ordre'];
      const placeholders = colonnes.map(() => '?').join(', ');
      const result = db
        .prepare(`INSERT INTO ${table} (${colonnes.join(', ')}) VALUES (${placeholders})`)
        .run(...colonnes.map((c) => data[c]));

      return ok(res, { id: result.lastInsertRowid, ...data }, 'Élément créé.', 201);
    } catch (err) {
      next(err);
    }
  });

  sousRouter.patch('/:id', (req, res, next) => {
    try {
      const updates = {};
      champsTexte.forEach((c) => {
        if (req.body[c] !== undefined) updates[c] = cleanText(req.body[c]);
      });
      if (req.body.ordre !== undefined) updates.ordre = Number(req.body.ordre) || 0;

      const cles = Object.keys(updates);
      if (cles.length === 0) return fail(res, 'Aucune modification fournie.', 422);

      const setClause = cles.map((k) => `${k} = ?`).join(', ');
      const result = db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`).run(...cles.map((k) => updates[k]), req.params.id);
      if (result.changes === 0) return fail(res, 'Élément introuvable.', 404);

      return ok(res, db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id), 'Élément mis à jour.');
    } catch (err) {
      next(err);
    }
  });

  sousRouter.delete('/:id', (req, res, next) => {
    try {
      db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
      return ok(res, null, 'Élément supprimé.');
    } catch (err) {
      next(err);
    }
  });

  return sousRouter;
}

router.use('/services', crudSimple({ table: 'services', champsTexte: ['titre', 'description', 'icone'], champObligatoire: 'titre' }));
router.use(
  '/appareils',
  crudSimple({ table: 'categories_appareils', champsTexte: ['code', 'titre', 'description', 'icone'], champObligatoire: 'titre' })
);
router.use('/faq', crudSimple({ table: 'faq', champsTexte: ['question', 'reponse'], champObligatoire: 'question' }));

module.exports = router;
