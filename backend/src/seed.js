// Données de DÉMONSTRATION (facultatif) : crée l'atelier « démo » avec son
// contenu, ses comptes admin, des réalisations, des avis et une fiche de suivi.
// Les vrais clients se créent depuis l'espace développeur (/gestion).
//
// Usage : npm run seed

require('dotenv').config();

const db = require('./db-postgres');
const { migrer } = require('./migrate');
const { creerAtelierComplet } = require('./services/provisionAtelier');
const { generateNumeroFiche, generateCodePublic } = require('./utils/tracking');

const SLUG_DEMO = 'atelier-reparation';

async function run() {
  await migrer();

  const client = await db.connect();
  let resultat = null;
  let codePublic = null;

  try {
    await client.query('BEGIN');

    const existant = await client.query('SELECT id FROM ateliers WHERE slug = $1', [SLUG_DEMO]);

    let atelierId;
    if (existant.rowCount === 0) {
      resultat = await creerAtelierComplet(client, {
        nom: process.env.ATELIER_NAME || 'Atelier de réparation électronique',
        slug: SLUG_DEMO,
        adminEmail: process.env.ADMIN_EMAIL || 'admin@atelier-maintenance.bj',
        adminMotDePasse: process.env.ADMIN_PASSWORD || '',
        avecAssistant: true,
        assistantEmail: process.env.ASSISTANT_EMAIL || 'assistant@atelier-maintenance.bj',
      });
      atelierId = resultat.atelier.id;

      // Coordonnées d'exemple pour la démo.
      const demo = {
        adresse: 'Quartier Cadjehoun, près du carrefour Vedoko, Cotonou, Bénin',
        telephone: '+229 90 12 34 56',
        whatsapp: '+229 90 12 34 56',
        email: 'contact@atelier-maintenance.bj',
        mapsQuery: 'Carrefour Vedoko, Cadjehoun, Cotonou, Bénin',
      };
      for (const [cle, valeur] of Object.entries(demo)) {
        await client.query(
          `UPDATE settings SET valeur = $3 WHERE atelier_id = $1 AND cle = $2`,
          [atelierId, cle, valeur]
        );
      }
    } else {
      atelierId = existant.rows[0].id;
    }

    const nbReal = await client.query('SELECT COUNT(*)::int AS n FROM realisations WHERE atelier_id = $1', [atelierId]);
    if (nbReal.rows[0].n === 0) {
      const realisations = [
        ['Remplacement écran smartphone', 'telephone', 'Samsung', 'Galaxy A54', 'Écran fissuré suite à une chute.', "Remplacement complet de la dalle d'origine."],
        ['Réparation carte mère ordinateur portable', 'ordinateur', 'HP', 'Pavilion 15', 'Ordinateur ne démarrant plus après une surtension.', 'Diagnostic et réparation du circuit d’alimentation.'],
        ['Changement batterie tablette', 'tablette', 'Apple', 'iPad 9', 'Batterie gonflée et autonomie très faible.', 'Remplacement de la batterie par une pièce compatible certifiée.'],
      ];
      for (const r of realisations) {
        await client.query(
          `INSERT INTO realisations (atelier_id, titre, type_appareil, marque, modele, probleme, intervention, publie)
           VALUES ($1,$2,$3,$4,$5,$6,$7,1)`,
          [atelierId, ...r]
        );
      }
    }

    const nbAvis = await client.query('SELECT COUNT(*)::int AS n FROM avis WHERE atelier_id = $1', [atelierId]);
    if (nbAvis.rows[0].n === 0) {
      const avis = [
        ['Chantal A.', 5, 'Service rapide et professionnel, mon téléphone est comme neuf.'],
        ['Roland K.', 5, 'Diagnostic clair, prix annoncé respecté. Je recommande.'],
        ['Estelle H.', 4, 'Bon suivi, j’ai pu suivre l’état de la réparation en ligne.'],
      ];
      for (const a of avis) {
        await client.query(
          `INSERT INTO avis (atelier_id, nom, note, commentaire, statut) VALUES ($1,$2,$3,$4,'valide')`,
          [atelierId, ...a]
        );
      }
    }

    const nbRep = await client.query('SELECT COUNT(*)::int AS n FROM reparations WHERE atelier_id = $1', [atelierId]);
    if (nbRep.rows[0].n === 0) {
      const c = await client.query(
        `INSERT INTO clients (atelier_id, nom_complet, telephone, email)
         VALUES ($1,'Client Démonstration','+22990123456','demo@example.com') RETURNING id`,
        [atelierId]
      );
      const a = await client.query(
        `INSERT INTO appareils (atelier_id, client_id, type, marque, modele)
         VALUES ($1,$2,'telephone','Samsung','Galaxy A14') RETURNING id`,
        [atelierId, c.rows[0].id]
      );
      const st = await client.query(`SELECT id FROM statuts_reparation WHERE code = 'diagnostic_termine'`);
      codePublic = generateCodePublic();

      const rep = await client.query(
        `INSERT INTO reparations
           (atelier_id, numero_fiche, code_public, client_id, appareil_id, statut_id,
            description_statut, diagnostic, cout, date_estimee_recuperation, visible_publiquement)
         VALUES ($1,'TEMP',$2,$3,$4,$5,$6,$7,25000,$8,1) RETURNING id`,
        [
          atelierId, codePublic, c.rows[0].id, a.rows[0].id, st.rows[0].id,
          'Écran fissuré identifié, remplacement nécessaire.',
          'Dalle tactile endommagée suite à une chute.',
          new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10),
        ]
      );
      await client.query('UPDATE reparations SET numero_fiche = $1 WHERE id = $2', [
        generateNumeroFiche(rep.rows[0].id), rep.rows[0].id,
      ]);
      await client.query(
        `INSERT INTO historique_reparation (reparation_id, statut_id, commentaire) VALUES ($1,$2,$3)`,
        [rep.rows[0].id, st.rows[0].id, 'Diagnostic réalisé, devis en cours de préparation.']
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    client.release();
  }

  console.log(`\nAtelier de démonstration prêt : http://localhost:5173/s/${SLUG_DEMO}`);
  if (resultat) {
    for (const c of resultat.comptes) {
      console.log(`Compte ${c.role} : ${c.email} / ${c.mot_de_passe}`);
    }
    console.log('Espace admin : http://localhost:5173/s/' + SLUG_DEMO + '/admin/connexion');
  }
  if (codePublic) console.log(`Code de suivi de démonstration : ${codePublic}`);
  console.log('');
}

run()
  .then(() => db.end())
  .catch((err) => {
    console.error('Échec du seed :', err);
    process.exit(1);
  });
