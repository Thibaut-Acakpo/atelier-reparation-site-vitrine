const express = require('express');
const db = require('../../db-postgres');
const { ok } = require('../../utils/response');

const router = express.Router();

// GET /api/admin/dashboard
// Indicateurs clés pour la page d'accueil de l'espace admin.
router.get('/', async (req, res, next) => {
  try {
    const atelierId = req.admin.atelier_id;

    const demandesNouvellesResult =
      await db.query(
        `
        SELECT COUNT(*) AS n
        FROM demandes_reparation
        WHERE statut_traitement = 'nouvelle'
          AND atelier_id = $1
        `,
        [atelierId]
      );

    const rendezVousEnAttenteResult =
      await db.query(
        `
        SELECT COUNT(*) AS n
        FROM rendez_vous
        WHERE statut = 'en_attente'
          AND atelier_id = $1
        `,
        [atelierId]
      );

    const reparationsEnCoursResult =
      await db.query(
        `
        SELECT COUNT(*) AS n
        FROM reparations r
        JOIN statuts_reparation s
          ON s.id = r.statut_id
        WHERE r.atelier_id = $1
          AND s.code NOT IN (
            'appareil_recupere',
            'reparation_impossible',
            'reparation_annulee'
          )
        `,
        [atelierId]
      );

    const avisEnAttenteResult =
      await db.query(
        `
        SELECT COUNT(*) AS n
        FROM avis
        WHERE statut = 'en_attente'
          AND atelier_id = $1
        `,
        [atelierId]
      );

    const contactsNonTraitesResult =
      await db.query(
        `
        SELECT COUNT(*) AS n
        FROM contacts
        WHERE traite = 0
          AND atelier_id = $1
        `,
        [atelierId]
      );

    const totalClientsResult =
      await db.query(
        `
        SELECT COUNT(*) AS n
        FROM clients
        WHERE atelier_id = $1
        `,
        [atelierId]
      );

    const dernieresDemandesResult =
      await db.query(
        `
        SELECT
          d.id,
          d.panne,
          d.created_at,
          d.statut_traitement,
          c.nom_complet,
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
        ORDER BY d.created_at DESC
        LIMIT 5
        `,
        [atelierId]
      );

    return ok(res, {
      demandes_nouvelles: Number(
        demandesNouvellesResult.rows[0].n
      ),

      rendez_vous_en_attente: Number(
        rendezVousEnAttenteResult.rows[0].n
      ),

      reparations_en_cours: Number(
        reparationsEnCoursResult.rows[0].n
      ),

      avis_en_attente: Number(
        avisEnAttenteResult.rows[0].n
      ),

      contacts_non_traites: Number(
        contactsNonTraitesResult.rows[0].n
      ),

      total_clients: Number(
        totalClientsResult.rows[0].n
      ),

      dernieres_demandes:
        dernieresDemandesResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
