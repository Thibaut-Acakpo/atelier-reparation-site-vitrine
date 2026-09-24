const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');

const router = express.Router();

// Fabrique un jeu de routes CRUD génériques pour une table de contenu simple.
function crudSimple({ table, champsTexte, champObligatoire }) {
  const sousRouter = express.Router();

  sousRouter.get('/', async (req, res, next) => {
    try {
      const result = await db.query(
        `SELECT * FROM ${table} ORDER BY ordre ASC, id ASC`
      );

      return ok(res, result.rows);
    } catch (err) {
      next(err);
    }
  });

  sousRouter.post('/', async (req, res, next) => {
    try {
      const data = {};

      champsTexte.forEach((c) => {
        data[c] = cleanText(req.body[c] || '');
      });

      if (!data[champObligatoire]) {
        return fail(
          res,
          `Le champ "${champObligatoire}" est requis.`,
          422,
          [champObligatoire]
        );
      }

      data.ordre = Number(req.body.ordre) || 0;

      const colonnes = [...champsTexte, 'ordre'];

      const placeholders = colonnes
        .map((_, index) => `$${index + 1}`)
        .join(', ');

      const result = await db.query(
        `
        INSERT INTO ${table} (${colonnes.join(', ')})
        VALUES (${placeholders})
        RETURNING id
        `,
        colonnes.map((c) => data[c])
      );

      return ok(
        res,
        {
          id: result.rows[0].id,
          ...data,
        },
        'Élément créé.',
        201
      );
    } catch (err) {
      next(err);
    }
  });

  sousRouter.patch('/:id', async (req, res, next) => {
    try {
      const updates = {};

      champsTexte.forEach((c) => {
        if (req.body[c] !== undefined) {
          updates[c] = cleanText(req.body[c]);
        }
      });

      if (req.body.ordre !== undefined) {
        updates.ordre = Number(req.body.ordre) || 0;
      }

      const cles = Object.keys(updates);

      if (cles.length === 0) {
        return fail(
          res,
          'Aucune modification fournie.',
          422
        );
      }

      const valeurs = cles.map((k) => updates[k]);

      const setClause = cles
        .map((k, index) => `${k} = $${index + 1}`)
        .join(', ');

      const result = await db.query(
        `
        UPDATE ${table}
        SET ${setClause}
        WHERE id = $${valeurs.length + 1}
        RETURNING *
        `,
        [...valeurs, req.params.id]
      );

      if (result.rowCount === 0) {
        return fail(
          res,
          'Élément introuvable.',
          404
        );
      }

      return ok(
        res,
        result.rows[0],
        'Élément mis à jour.'
      );
    } catch (err) {
      next(err);
    }
  });

  sousRouter.delete('/:id', async (req, res, next) => {
    try {
      const result = await db.query(
        `
        DELETE FROM ${table}
        WHERE id = $1
        RETURNING id
        `,
        [req.params.id]
      );

      if (result.rowCount === 0) {
        return fail(
          res,
          'Élément introuvable.',
          404
        );
      }

      return ok(
        res,
        null,
        'Élément supprimé.'
      );
    } catch (err) {
      next(err);
    }
  });

  return sousRouter;
}

router.use(
  '/services',
  crudSimple({
    table: 'services',
    champsTexte: ['titre', 'description', 'icone'],
    champObligatoire: 'titre',
  })
);

router.use(
  '/appareils',
  crudSimple({
    table: 'categories_appareils',
    champsTexte: [
      'code',
      'titre',
      'description',
      'icone',
    ],
    champObligatoire: 'titre',
  })
);

router.use(
  '/faq',
  crudSimple({
    table: 'faq',
    champsTexte: ['question', 'reponse'],
    champObligatoire: 'question',
  })
);

module.exports = router;