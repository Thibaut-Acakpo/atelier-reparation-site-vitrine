const express = require('express');
const db = require('../../db-postgres');
const { ok, fail } = require('../../utils/response');
const { cleanText } = require('../../utils/validation');

const router = express.Router();

// Fabrique un jeu de routes CRUD génériques
// pour une table de contenu simple.
function crudSimple({
  table,
  champsTexte,
  champObligatoire,
}) {
  const sousRouter = express.Router();

  // ==========================================================
  // GET /
  // Récupérer uniquement le contenu de l'atelier connecté.
  // ==========================================================
  sousRouter.get('/', async (req, res, next) => {
    try {
      const result = await db.query(
        `
        SELECT *
        FROM ${table}
        WHERE atelier_id = $1
        ORDER BY ordre ASC, id ASC
        `,
        [req.admin.atelier_id]
      );

      return ok(res, result.rows);
    } catch (err) {
      next(err);
    }
  });

  // ==========================================================
  // POST /
  // Créer un élément pour l'atelier connecté.
  // ==========================================================
  sousRouter.post('/', async (req, res, next) => {
    try {
      const data = {};

      champsTexte.forEach((champ) => {
        data[champ] = cleanText(
          req.body[champ] || ''
        );
      });

      if (!data[champObligatoire]) {
        return fail(
          res,
          `Le champ "${champObligatoire}" est requis.`,
          422,
          [champObligatoire]
        );
      }

      data.ordre =
        Number(req.body.ordre) || 0;

      const colonnes = [
        ...champsTexte,
        'ordre',
        'atelier_id',
      ];

      const placeholders = colonnes
        .map((_, index) => `$${index + 1}`)
        .join(', ');

      const valeurs = [
        ...champsTexte.map(
          (champ) => data[champ]
        ),
        data.ordre,
        req.admin.atelier_id,
      ];

      const result = await db.query(
        `
        INSERT INTO ${table}
        (${colonnes.join(', ')})
        VALUES (${placeholders})
        RETURNING id
        `,
        valeurs
      );

      return ok(
        res,
        {
          id: result.rows[0].id,
          ...data,
          atelier_id:
            req.admin.atelier_id,
        },
        'Élément créé.',
        201
      );
    } catch (err) {
      next(err);
    }
  });

  // ==========================================================
  // PATCH /:id
  // Modifier uniquement un élément
  // appartenant à l'atelier connecté.
  // ==========================================================
  sousRouter.patch(
    '/:id',
    async (req, res, next) => {
      try {
        const updates = {};

        champsTexte.forEach((champ) => {
          if (
            req.body[champ] !== undefined
          ) {
            updates[champ] =
              cleanText(
                req.body[champ]
              );
          }
        });

        if (
          req.body.ordre !== undefined
        ) {
          updates.ordre =
            Number(req.body.ordre) || 0;
        }

        const cles =
          Object.keys(updates);

        if (cles.length === 0) {
          return fail(
            res,
            'Aucune modification fournie.',
            422
          );
        }

        const valeurs =
          cles.map(
            (cle) => updates[cle]
          );

        const setClause = cles
          .map(
            (cle, index) =>
              `${cle} = $${index + 1}`
          )
          .join(', ');

        const idParametre =
          valeurs.length + 1;

        const atelierParametre =
          valeurs.length + 2;

        const result =
          await db.query(
            `
            UPDATE ${table}
            SET ${setClause}
            WHERE id = $${idParametre}
              AND atelier_id = $${atelierParametre}
            RETURNING *
            `,
            [
              ...valeurs,
              req.params.id,
              req.admin.atelier_id,
            ]
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
    }
  );

  // ==========================================================
  // DELETE /:id
  // Supprimer uniquement un élément
  // appartenant à l'atelier connecté.
  // ==========================================================
  sousRouter.delete(
    '/:id',
    async (req, res, next) => {
      try {
        const result =
          await db.query(
            `
            DELETE FROM ${table}
            WHERE id = $1
              AND atelier_id = $2
            RETURNING id
            `,
            [
              req.params.id,
              req.admin.atelier_id,
            ]
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
    }
  );

  return sousRouter;
}

// ============================================================
// SERVICES
// ============================================================
router.use(
  '/services',
  crudSimple({
    table: 'services',
    champsTexte: [
      'titre',
      'description',
      'icone',
    ],
    champObligatoire: 'titre',
  })
);

// ============================================================
// CATÉGORIES D'APPAREILS
// ============================================================
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

// ============================================================
// FAQ
// ============================================================
router.use(
  '/faq',
  crudSimple({
    table: 'faq',
    champsTexte: [
      'question',
      'reponse',
    ],
    champObligatoire: 'question',
  })
);

module.exports = router;