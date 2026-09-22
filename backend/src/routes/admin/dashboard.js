const express = require('express');
const db = require('../../db');
const { ok } = require('../../utils/response');

const router = express.Router();

// GET /api/admin/dashboard — indicateurs clés pour la page d'accueil de l'espace admin.
router.get('/', (req, res, next) => {
  try {
    const demandesNouvelles = db
      .prepare(`SELECT COUNT(*) AS n FROM demandes_reparation WHERE statut_traitement = 'nouvelle'`)
      .get().n;
    const rendezVousEnAttente = db.prepare(`SELECT COUNT(*) AS n FROM rendez_vous WHERE statut = 'en_attente'`).get().n;
    const reparationsEnCours = db
      .prepare(
        `SELECT COUNT(*) AS n FROM reparations r
         JOIN statuts_reparation s ON s.id = r.statut_id
         WHERE s.code NOT IN ('appareil_recupere','reparation_impossible','reparation_annulee')`
      )
      .get().n;
    const avisEnAttente = db.prepare(`SELECT COUNT(*) AS n FROM avis WHERE statut = 'en_attente'`).get().n;
    const contactsNonTraites = db.prepare(`SELECT COUNT(*) AS n FROM contacts WHERE traite = 0`).get().n;
    const totalClients = db.prepare(`SELECT COUNT(*) AS n FROM clients`).get().n;

    const dernieresDemandes = db
      .prepare(
        `SELECT d.id, d.panne, d.created_at, d.statut_traitement, c.nom_complet, a.type, a.marque, a.modele
         FROM demandes_reparation d
         JOIN clients c ON c.id = d.client_id
         JOIN appareils a ON a.id = d.appareil_id
         ORDER BY d.created_at DESC LIMIT 5`
      )
      .all();

    return ok(res, {
      demandes_nouvelles: demandesNouvelles,
      rendez_vous_en_attente: rendezVousEnAttente,
      reparations_en_cours: reparationsEnCours,
      avis_en_attente: avisEnAttente,
      contacts_non_traites: contactsNonTraites,
      total_clients: totalClients,
      dernieres_demandes: dernieresDemandes,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
