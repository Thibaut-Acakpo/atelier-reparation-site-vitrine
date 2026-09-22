// Insère des données de démonstration : statuts, services, catégories,
// FAQ, réalisations, avis validés, et une fiche de réparation de test
// pour pouvoir essayer la page "Suivi" immédiatement.
//
// Usage : npm run seed

require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db');
const { generateNumeroFiche, generateCodePublic } = require('./utils/tracking');

const STATUTS = [
  'Demande reçue',
  'Appareil attendu',
  'Appareil reçu',
  'Diagnostic en cours',
  'Diagnostic terminé',
  "Devis en attente d'acceptation",
  'Réparation autorisée',
  'Réparation en cours',
  "En attente d'une pièce",
  'Réparation terminée',
  'Appareil prêt à récupérer',
  'Appareil récupéré',
  'Réparation impossible',
  'Réparation annulée',
];

function run() {
  const insertStatut = db.prepare(`INSERT OR IGNORE INTO statuts_reparation (code, libelle, ordre) VALUES (?, ?, ?)`);
  STATUTS.forEach((libelle, i) => {
    const code = libelle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_');
    insertStatut.run(code, libelle, i + 1);
  });

  const services = [
    ['Réparation matérielle', "Remplacement d'écrans, batteries, connecteurs et composants endommagés.", 'wrench'],
    ['Réparation logicielle', "Résolution de bugs, blocages, virus et problèmes de démarrage.", 'terminal-square'],
    ['Diagnostic', 'Examen technique complet pour identifier précisément la panne. Gratuit.', 'search'],
    ['Maintenance et entretien', 'Nettoyage interne, pâte thermique, entretien préventif.', 'settings'],
    ['Remplacement de composants', 'Pièces d\u2019origine ou compatibles de qualité, selon disponibilité.', 'cpu'],
    ['Réinstallation et configuration', "Système d'exploitation, logiciels et paramétrage.", 'refresh-ccw'],
  ];
  const insertService = db.prepare(`INSERT INTO services (titre, description, icone, ordre) VALUES (?, ?, ?, ?)`);
  const existingServices = db.prepare(`SELECT COUNT(*) AS n FROM services`).get().n;
  if (existingServices === 0) {
    services.forEach(([titre, description, icone], i) => insertService.run(titre, description, icone, i + 1));
  }

  const categories = [
    ['telephone', 'Téléphones', 'Smartphones toutes marques : écran, batterie, connecteur, logiciel.', 'smartphone'],
    ['ordinateur', 'Ordinateurs', 'Portables et fixes : diagnostic, pièces, système, performance.', 'laptop'],
    ['tablette', 'Tablettes', 'Écran, batterie, port de charge, mise à jour et configuration.', 'tablet'],
    ['autre', 'Autres appareils', "Consoles, accessoires et autres équipements électroniques.", 'cpu'],
  ];
  const insertCat = db.prepare(
    `INSERT OR IGNORE INTO categories_appareils (code, titre, description, icone, ordre) VALUES (?, ?, ?, ?, ?)`
  );
  categories.forEach(([code, titre, description, icone], i) => insertCat.run(code, titre, description, icone, i + 1));

  const faqs = [
    ['Le diagnostic est-il payant ?', 'Non, le diagnostic est gratuit et réalisé à l\u2019atelier.'],
    ['Puis-je connaître le prix avant de venir ?', "Aucune estimation n'est communiquée en ligne. Le prix est donné après diagnostic à l'atelier."],
    ['Comment suivre ma réparation ?', 'Utilisez le numéro de fiche fourni lors du dépôt, sur la page "Suivre ma réparation".'],
    ['Puis-je prendre rendez-vous ?', 'Oui, vous pouvez indiquer une date et une heure souhaitées ; l\u2019atelier confirme ensuite.'],
    ["L'atelier est-il ouvert le dimanche ?", 'Non, l\u2019atelier est fermé le dimanche.'],
  ];
  const insertFaq = db.prepare(`INSERT INTO faq (question, reponse, ordre) VALUES (?, ?, ?)`);
  const existingFaq = db.prepare(`SELECT COUNT(*) AS n FROM faq`).get().n;
  if (existingFaq === 0) {
    faqs.forEach(([question, reponse], i) => insertFaq.run(question, reponse, i + 1));
  }

  const realisations = [
    ['Remplacement écran smartphone', 'telephone', 'Samsung', 'Galaxy A54', 'Écran fissuré suite à une chute.', "Remplacement complet de la dalle d'origine."],
    ['Réparation carte mère ordinateur portable', 'ordinateur', 'HP', 'Pavilion 15', "Ordinateur ne démarrant plus après une surtension.", 'Diagnostic et réparation du circuit d\u2019alimentation.'],
    ['Changement batterie tablette', 'tablette', 'Apple', 'iPad 9', 'Batterie gonflée et autonomie très faible.', "Remplacement de la batterie par une pièce compatible certifiée."],
  ];
  const insertReal = db.prepare(`
    INSERT INTO realisations (titre, type_appareil, marque, modele, probleme, intervention, publie)
    VALUES (?, ?, ?, ?, ?, ?, 1)
  `);
  const existingReal = db.prepare(`SELECT COUNT(*) AS n FROM realisations`).get().n;
  if (existingReal === 0) {
    realisations.forEach((r) => insertReal.run(...r));
  }

  const avisValides = [
    ['Chantal A.', 5, 'Service rapide et professionnel, mon téléphone est comme neuf.'],
    ['Roland K.', 5, 'Diagnostic clair, prix annoncé respecté. Je recommande.'],
    ['Estelle H.', 4, 'Bon suivi, j\u2019ai pu suivre l\u2019état de la réparation en ligne.'],
  ];
  const insertAvis = db.prepare(`INSERT INTO avis (nom, note, commentaire, statut) VALUES (?, ?, ?, 'valide')`);
  const existingAvis = db.prepare(`SELECT COUNT(*) AS n FROM avis`).get().n;
  if (existingAvis === 0) {
    avisValides.forEach((a) => insertAvis.run(...a));
  }

  // --- Fiche de réparation de démonstration, pour tester la page Suivi ---
  const existingDemo = db.prepare(`SELECT COUNT(*) AS n FROM reparations`).get().n;
  if (existingDemo === 0) {
    const client = db
      .prepare(`INSERT INTO clients (nom_complet, telephone, email) VALUES (?, ?, ?)`)
      .run('Client Démonstration', '+22990123456', 'demo@example.com');
    const appareil = db
      .prepare(`INSERT INTO appareils (client_id, type, marque, modele) VALUES (?, ?, ?, ?)`)
      .run(client.lastInsertRowid, 'telephone', 'Samsung', 'Galaxy A14');

    const statutDiagTermine = db.prepare(`SELECT id FROM statuts_reparation WHERE code = ?`).get('diagnostic_termine');

    const numeroFiche = generateNumeroFiche(184);
    const codePublic = generateCodePublic();

    const reparation = db
      .prepare(
        `
      INSERT INTO reparations
        (numero_fiche, code_public, client_id, appareil_id, statut_id, description_statut, diagnostic, cout, date_estimee_recuperation, visible_publiquement)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `
      )
      .run(
        numeroFiche,
        codePublic,
        client.lastInsertRowid,
        appareil.lastInsertRowid,
        statutDiagTermine.id,
        'Écran fissuré identifié, remplacement nécessaire.',
        'Dalle tactile endommagée suite à une chute.',
        25000,
        new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10)
      );

    db.prepare(`INSERT INTO historique_reparation (reparation_id, statut_id, commentaire) VALUES (?, ?, ?)`).run(
      reparation.lastInsertRowid,
      statutDiagTermine.id,
      'Diagnostic réalisé, devis en cours de préparation.'
    );

    console.log('\n--- Fiche de démonstration créée ---'); // eslint-disable-line no-console
    console.log(`Numéro de fiche (interne) : ${numeroFiche}`); // eslint-disable-line no-console
    console.log(`Code de suivi (à utiliser sur le site) : ${codePublic}`); // eslint-disable-line no-console
    console.log('-------------------------------------\n'); // eslint-disable-line no-console
  }

  // --- Comptes de l'espace admin (section 25) : "Technicien" (gérant,
  // accès complet) et "Assistant technicien" (compte partagé, accès
  // restreint). Chacun n'est créé que s'il n'existe pas déjà, pour ne
  // jamais écraser un mot de passe déjà en place.
  function creerCompteSiAbsent({ nom, role, emailEnv, motDePasseEnv, emailDefaut }) {
    const existant = db.prepare(`SELECT id FROM admins WHERE role = ?`).get(role);
    if (existant) return null;

    const email = (process.env[emailEnv] || emailDefaut).toLowerCase();
    const motDePasseFourni = process.env[motDePasseEnv];
    const motDePasse = motDePasseFourni || crypto.randomBytes(9).toString('base64url');
    const hash = bcrypt.hashSync(motDePasse, 10);

    db.prepare(`INSERT INTO admins (nom, email, mot_de_passe_hash, role) VALUES (?, ?, ?, ?)`).run(nom, email, hash, role);

    return { email, motDePasse, genere: !motDePasseFourni };
  }

  const compteTechnicien = creerCompteSiAbsent({
    nom: 'Technicien',
    role: 'technicien',
    emailEnv: 'ADMIN_EMAIL',
    motDePasseEnv: 'ADMIN_PASSWORD',
    emailDefaut: 'admin@atelier-maintenance.bj',
  });
  if (compteTechnicien) {
    console.log('\n--- Compte "Technicien" créé (gérant, accès complet) ---'); // eslint-disable-line no-console
    console.log(`Email : ${compteTechnicien.email}`); // eslint-disable-line no-console
    console.log(`Mot de passe : ${compteTechnicien.motDePasse}`); // eslint-disable-line no-console
    if (compteTechnicien.genere) {
      console.log('(mot de passe généré aléatoirement car ADMIN_PASSWORD est vide dans .env)'); // eslint-disable-line no-console
    }
  }

  const compteAssistant = creerCompteSiAbsent({
    nom: 'Assistant technicien',
    role: 'assistant',
    emailEnv: 'ASSISTANT_EMAIL',
    motDePasseEnv: 'ASSISTANT_PASSWORD',
    emailDefaut: 'assistant@atelier-maintenance.bj',
  });
  if (compteAssistant) {
    console.log('\n--- Compte "Assistant technicien" créé (partagé, accès restreint) ---'); // eslint-disable-line no-console
    console.log(`Email : ${compteAssistant.email}`); // eslint-disable-line no-console
    console.log(`Mot de passe : ${compteAssistant.motDePasse}`); // eslint-disable-line no-console
    if (compteAssistant.genere) {
      console.log('(mot de passe généré aléatoirement car ASSISTANT_PASSWORD est vide dans .env)'); // eslint-disable-line no-console
    }
  }

  if (compteTechnicien || compteAssistant) {
    console.log('\nÀ changer via `npm run admin:reset` si besoin.'); // eslint-disable-line no-console
    console.log('Espace admin : http://localhost:5173/admin/connexion\n'); // eslint-disable-line no-console
  }

  console.log('Données de démonstration insérées avec succès.'); // eslint-disable-line no-console
}

run();
