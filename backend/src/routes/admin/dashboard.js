const express = require('express');
const db = require('../../db-postgres');
const { ok } = require('../../utils/response');

const router = express.Router();

// GET /api/admin/dashboard — indicateurs clés pour la page d'accueil de l'espace admin.
router.get('/', async (req, res, next) => {
  try {
    const demandesNouvellesResult = await db.query(`
      SELECT COUNT(*) AS n
      FROM demandes_reparation
      WHERE statut_traitement = 'nouvelle'
    `);

    const rendezVousEnAttenteResult = await db.query(`
      SELECT COUNT(*) AS n
      FROM rendez_vous
      WHERE statut = 'en_attente'
    `);

    const reparationsEnCoursResult = await db.query(`
      SELECT COUNT(*) AS n
      FROM reparations r
      JOIN statuts_reparation s
        ON s.id = r.statut_id
      WHERE s.code NOT IN (
        'appareil_recupere',
        'reparation_impossible',
        'reparation_annulee'
      )
    `);

    const avisEnAttenteResult = await db.query(`
      SELECT COUNT(*) AS n
      FROM avis
      WHERE statut = 'en_attente'
    `);

    const contactsNonTraitesResult = await db.query(`
      SELECT COUNT(*) AS n
      FROM contacts
      WHERE traite = 0
    `);

    const totalClientsResult = await db.query(`
      SELECT COUNT(*) AS n
      FROM clients
    `);

    const dernieresDemandesResult = await db.query(`
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
      JOIN appareils a
        ON a.id = d.appareil_id
      ORDER BY d.created_at DESC
      LIMIT 5
    `);

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
      dernieres_demandes: dernieresDemandesResult.rows,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;