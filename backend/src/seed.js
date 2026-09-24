// Insère des données de démonstration : statuts, services, catégories,
// FAQ, réalisations, avis validés, et une fiche de réparation de test
// pour pouvoir essayer la page "Suivi" immédiatement.
//
// Usage : npm run seed

require('dotenv').config();

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('./db-postgres');
const { generateNumeroFiche, generateCodePublic } = require('./utils/tracking');

const STATUTS = [
  'Demande reçue',
  'Appareil attendu',
  'Appareil reçu',
  'Diagnostic en cours',
  'Diagnostic terminé',
  'Devis en attente d\'acceptation',
  'Réparation autorisée',
  'Réparation en cours',
  'En attente d\'une pièce',
  'Réparation terminée',
  'Appareil prêt à récupérer',
  'Appareil récupéré',
  'Réparation impossible',
  'Réparation annulée',
];

function genererCodeStatut(libelle) {
  return libelle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_');
}

async function creerCompteSiAbsent({
  nom,
  role,
  emailEnv,
  motDePasseEnv,
  emailDefaut,
}) {
  const existant = await db.query(
    `SELECT id FROM admins WHERE role = $1 LIMIT 1`,
    [role]
  );

  if (existant.rowCount > 0) {
    return null;
  }

  const email = (process.env[emailEnv] || emailDefaut).toLowerCase();

  const motDePasseFourni = process.env[motDePasseEnv];

  const motDePasse =
    motDePasseFourni ||
    crypto.randomBytes(9).toString('base64url');

  const hash = await bcrypt.hash(motDePasse, 10);

  await db.query(
    `INSERT INTO admins
      (nom, email, mot_de_passe_hash, role)
     VALUES ($1, $2, $3, $4)`,
    [nom, email, hash, role]
  );

  return {
    email,
    motDePasse,
    genere: !motDePasseFourni,
  };
}

async function run() {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // ============================================================
    // STATUTS DE RÉPARATION
    // ============================================================

    for (let i = 0; i < STATUTS.length; i += 1) {
      const libelle = STATUTS[i];
      const code = genererCodeStatut(libelle);

      await client.query(
        `INSERT INTO statuts_reparation (code, libelle, ordre)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [code, libelle, i + 1]
      );
    }

    // ============================================================
    // SERVICES
    // ============================================================

    const services = [
      [
        'Réparation matérielle',
        "Remplacement d'écrans, batteries, connecteurs et composants endommagés.",
        'wrench',
      ],
      [
        'Réparation logicielle',
        'Résolution de bugs, blocages, virus et problèmes de démarrage.',
        'terminal-square',
      ],
      [
        'Diagnostic',
        'Examen technique complet pour identifier précisément la panne. Gratuit.',
        'search',
      ],
      [
        'Maintenance et entretien',
        'Nettoyage interne, pâte thermique, entretien préventif.',
        'settings',
      ],
      [
        'Remplacement de composants',
        'Pièces d’origine ou compatibles de qualité, selon disponibilité.',
        'cpu',
      ],
      [
        'Réinstallation et configuration',
        "Système d'exploitation, logiciels et paramétrage.",
        'refresh-ccw',
      ],
    ];

    const existingServices = await client.query(
      `SELECT COUNT(*) AS n FROM services`
    );

    if (Number(existingServices.rows[0].n) === 0) {
      for (let i = 0; i < services.length; i += 1) {
        const [titre, description, icone] = services[i];

        await client.query(
          `INSERT INTO services
            (titre, description, icone, ordre)
           VALUES ($1, $2, $3, $4)`,
          [titre, description, icone, i + 1]
        );
      }
    }

    // ============================================================
    // CATÉGORIES D'APPAREILS
    // ============================================================

    const categories = [
      [
        'telephone',
        'Téléphones',
        'Smartphones toutes marques : écran, batterie, connecteur, logiciel.',
        'smartphone',
      ],
      [
        'ordinateur',
        'Ordinateurs',
        'Portables et fixes : diagnostic, pièces, système, performance.',
        'laptop',
      ],
      [
        'tablette',
        'Tablettes',
        'Écran, batterie, port de charge, mise à jour et configuration.',
        'tablet',
      ],
      [
        'autre',
        'Autres appareils',
        'Consoles, accessoires et autres équipements électroniques.',
        'cpu',
      ],
    ];

    for (let i = 0; i < categories.length; i += 1) {
      const [code, titre, description, icone] = categories[i];

      await client.query(
        `INSERT INTO categories_appareils
          (code, titre, description, icone, ordre)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT DO NOTHING`,
        [code, titre, description, icone, i + 1]
      );
    }

    // ============================================================
    // FAQ
    // ============================================================

    const faqs = [
      [
        'Le diagnostic est-il payant ?',
        'Non, le diagnostic est gratuit et réalisé à l’atelier.',
      ],
      [
        'Puis-je connaître le prix avant de venir ?',
        "Aucune estimation n'est communiquée en ligne. Le prix est donné après diagnostic à l'atelier.",
      ],
      [
        'Comment suivre ma réparation ?',
        'Utilisez le numéro de fiche fourni lors du dépôt, sur la page "Suivre ma réparation".',
      ],
      [
        'Puis-je prendre rendez-vous ?',
        'Oui, vous pouvez indiquer une date et une heure souhaitées ; l’atelier confirme ensuite.',
      ],
      [
        "L'atelier est-il ouvert le dimanche ?",
        'Non, l’atelier est fermé le dimanche.',
      ],
    ];

    const existingFaq = await client.query(
      `SELECT COUNT(*) AS n FROM faq`
    );

    if (Number(existingFaq.rows[0].n) === 0) {
      for (let i = 0; i < faqs.length; i += 1) {
        const [question, reponse] = faqs[i];

        await client.query(
          `INSERT INTO faq (question, reponse, ordre)
           VALUES ($1, $2, $3)`,
          [question, reponse, i + 1]
        );
      }
    }

    // ============================================================
    // RÉALISATIONS
    // ============================================================

    const realisations = [
      [
        'Remplacement écran smartphone',
        'telephone',
        'Samsung',
        'Galaxy A54',
        'Écran fissuré suite à une chute.',
        "Remplacement complet de la dalle d'origine.",
      ],
      [
        'Réparation carte mère ordinateur portable',
        'ordinateur',
        'HP',
        'Pavilion 15',
        'Ordinateur ne démarrant plus après une surtension.',
        "Diagnostic et réparation du circuit d’alimentation.",
      ],
      [
        'Changement batterie tablette',
        'tablette',
        'Apple',
        'iPad 9',
        'Batterie gonflée et autonomie très faible.',
        'Remplacement de la batterie par une pièce compatible certifiée.',
      ],
    ];

    const existingReal = await client.query(
      `SELECT COUNT(*) AS n FROM realisations`
    );

    if (Number(existingReal.rows[0].n) === 0) {
      for (const realisation of realisations) {
        await client.query(
          `INSERT INTO realisations
            (titre, type_appareil, marque, modele, probleme, intervention, publie)
           VALUES ($1, $2, $3, $4, $5, $6, 1)`,
          realisation
        );
      }
    }

    // ============================================================
    // AVIS VALIDÉS
    // ============================================================

    const avisValides = [
      [
        'Chantal A.',
        5,
        'Service rapide et professionnel, mon téléphone est comme neuf.',
      ],
      [
        'Roland K.',
        5,
        'Diagnostic clair, prix annoncé respecté. Je recommande.',
      ],
      [
        'Estelle H.',
        4,
        'Bon suivi, j’ai pu suivre l’état de la réparation en ligne.',
      ],
    ];

    const existingAvis = await client.query(
      `SELECT COUNT(*) AS n FROM avis`
    );

    if (Number(existingAvis.rows[0].n) === 0) {
      for (const avis of avisValides) {
        await client.query(
          `INSERT INTO avis
            (nom, note, commentaire, statut)
           VALUES ($1, $2, $3, 'valide')`,
          avis
        );
      }
    }

    // ============================================================
    // FICHE DE RÉPARATION DE DÉMONSTRATION
    // ============================================================

    const existingDemo = await client.query(
      `SELECT COUNT(*) AS n FROM reparations`
    );

    if (Number(existingDemo.rows[0].n) === 0) {
      const clientResult = await client.query(
        `INSERT INTO clients
          (nom_complet, telephone, email)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [
          'Client Démonstration',
          '+22990123456',
          'demo@example.com',
        ]
      );

      const clientId = clientResult.rows[0].id;

      const appareilResult = await client.query(
        `INSERT INTO appareils
          (client_id, type, marque, modele)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [
          clientId,
          'telephone',
          'Samsung',
          'Galaxy A14',
        ]
      );

      const appareilId = appareilResult.rows[0].id;

      const statutDiagTermine = await client.query(
        `SELECT id
         FROM statuts_reparation
         WHERE code = $1
         LIMIT 1`,
        ['diagnostic_termine']
      );

      if (statutDiagTermine.rowCount === 0) {
        throw new Error(
          'Le statut "diagnostic_termine" est introuvable.'
        );
      }

      const statutId = statutDiagTermine.rows[0].id;

      const numeroFiche = generateNumeroFiche(184);
      const codePublic = generateCodePublic();

      const dateEstimeeRecuperation = new Date(
        Date.now() + 3 * 86400000
      )
        .toISOString()
        .slice(0, 10);

      const reparationResult = await client.query(
        `INSERT INTO reparations
          (
            numero_fiche,
            code_public,
            client_id,
            appareil_id,
            statut_id,
            description_statut,
            diagnostic,
            cout,
            date_estimee_recuperation,
            visible_publiquement
          )
         VALUES
          ($1, $2, $3, $4, $5, $6, $7, $8, $9, 1)
         RETURNING id`,
        [
          numeroFiche,
          codePublic,
          clientId,
          appareilId,
          statutId,
          'Écran fissuré identifié, remplacement nécessaire.',
          'Dalle tactile endommagée suite à une chute.',
          25000,
          dateEstimeeRecuperation,
        ]
      );

      const reparationId = reparationResult.rows[0].id;

      await client.query(
        `INSERT INTO historique_reparation
          (reparation_id, statut_id, commentaire)
         VALUES ($1, $2, $3)`,
        [
          reparationId,
          statutId,
          'Diagnostic réalisé, devis en cours de préparation.',
        ]
      );

      console.log('\n--- Fiche de démonstration créée ---');
      console.log(`Numéro de fiche (interne) : ${numeroFiche}`);
      console.log(`Code de suivi (à utiliser sur le site) : ${codePublic}`);
      console.log('-------------------------------------\n');
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erreur lors de l’initialisation des données :', err);
    throw err;
  } finally {
    client.release();
  }

  // ============================================================
  // COMPTES DE L'ESPACE ADMIN
  // ============================================================

  const compteTechnicien = await creerCompteSiAbsent({
    nom: 'Technicien',
    role: 'technicien',
    emailEnv: 'ADMIN_EMAIL',
    motDePasseEnv: 'ADMIN_PASSWORD',
    emailDefaut: 'admin@atelier-maintenance.bj',
  });

  if (compteTechnicien) {
    console.log('\n--- Compte "Technicien" créé (gérant, accès complet) ---');
    console.log(`Email : ${compteTechnicien.email}`);
    console.log(`Mot de passe : ${compteTechnicien.motDePasse}`);

    if (compteTechnicien.genere) {
      console.log(
        '(mot de passe généré aléatoirement car ADMIN_PASSWORD est vide dans .env)'
      );
    }
  }

  const compteAssistant = await creerCompteSiAbsent({
    nom: 'Assistant technicien',
    role: 'assistant',
    emailEnv: 'ASSISTANT_EMAIL',
    motDePasseEnv: 'ASSISTANT_PASSWORD',
    emailDefaut: 'assistant@atelier-maintenance.bj',
  });

  if (compteAssistant) {
    console.log(
      '\n--- Compte "Assistant technicien" créé (partagé, accès restreint) ---'
    );
    console.log(`Email : ${compteAssistant.email}`);
    console.log(`Mot de passe : ${compteAssistant.motDePasse}`);

    if (compteAssistant.genere) {
      console.log(
        '(mot de passe généré aléatoirement car ASSISTANT_PASSWORD est vide dans .env)'
      );
    }
  }

  if (compteTechnicien || compteAssistant) {
    console.log(
      '\nÀ changer via `npm run admin:reset` si besoin.'
    );
    console.log(
      'Espace admin : http://localhost:5173/admin/connexion\n'
    );
  }

  console.log('Données de démonstration insérées avec succès.');
}

run().catch((err) => {
  console.error('Échec du seed PostgreSQL :', err);
  process.exit(1);
});