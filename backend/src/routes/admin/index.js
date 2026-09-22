const express = require('express');
const { requireAuth, requireRole } = require('../../middleware/auth');

const authRouter = require('./auth');
const dashboardRouter = require('./dashboard');
const demandesRouter = require('./demandes');
const rendezVousRouter = require('./rendezVous');
const reparationsRouter = require('./reparations');
const avisRouter = require('./avis');
const contactsRouter = require('./contacts');
const piecesRouter = require('./pieces');
const statutsRouter = require('./statuts');
const clientsRouter = require('./clients');
const realisationsRouter = require('./realisations');
const contenuRouter = require('./contenu');

const router = express.Router();

// Connexion : seule route accessible sans jeton.
router.use('/auth', authRouter);

// Tout ce qui suit exige un jeton admin valide.
router.use(requireAuth);

router.use('/dashboard', dashboardRouter);
router.use('/demandes', demandesRouter);
router.use('/rendez-vous', rendezVousRouter);
router.use('/reparations', reparationsRouter);
router.use('/avis', avisRouter);
router.use('/contacts', contactsRouter);
router.use('/pieces', piecesRouter);
router.use('/statuts', statutsRouter);
router.use('/clients', clientsRouter);
router.use('/realisations', realisationsRouter);

// Contenu du site (services, catégories d'appareils, FAQ) : décisions
// commerciales/éditoriales réservées au compte "Technicien" (gérant).
// Le compte "Assistant technicien" n'y a même pas accès en lecture.
router.use('/contenu', requireRole('technicien'), contenuRouter);

module.exports = router;
