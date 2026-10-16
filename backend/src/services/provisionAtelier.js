// Création complète d'un nouveau client : atelier + contenu de départ +
// comptes de l'espace admin. Tout se fait dans la transaction fournie.

const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const {
  SERVICES, CATEGORIES, FAQ,
  SETTINGS_NOUVEAU_CLIENT, SETTINGS_DUPLICABLES,
} = require('../data/contenuParDefaut');

function genererMotDePasse() {
  return crypto.randomBytes(9).toString('base64url');
}

async function creerCompte(client, atelierId, { nom, role, email, motDePasse }) {
  const mdp = motDePasse || genererMotDePasse();
  const hash = await bcrypt.hash(mdp, 10);
  await client.query(
    `INSERT INTO admins (atelier_id, nom, email, mot_de_passe_hash, role, actif)
     VALUES ($1, $2, $3, $4, $5, 1)`,
    [atelierId, nom, email.toLowerCase(), hash, role]
  );
  return { role, email: email.toLowerCase(), mot_de_passe: mdp, genere: !motDePasse };
}

async function insererContenuParDefaut(client, atelierId) {
  for (let i = 0; i < SERVICES.length; i += 1) {
    const [titre, description, icone] = SERVICES[i];
    await client.query(
      `INSERT INTO services (atelier_id, titre, description, icone, ordre) VALUES ($1,$2,$3,$4,$5)`,
      [atelierId, titre, description, icone, i + 1]
    );
  }
  for (let i = 0; i < CATEGORIES.length; i += 1) {
    const [code, titre, description, icone] = CATEGORIES[i];
    await client.query(
      `INSERT INTO categories_appareils (atelier_id, code, titre, description, icone, ordre)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [atelierId, code, titre, description, icone, i + 1]
    );
  }
  for (let i = 0; i < FAQ.length; i += 1) {
    const [question, reponse] = FAQ[i];
    await client.query(
      `INSERT INTO faq (atelier_id, question, reponse, ordre) VALUES ($1,$2,$3,$4)`,
      [atelierId, question, reponse, i + 1]
    );
  }
  for (const [cle, valeur] of Object.entries(SETTINGS_NOUVEAU_CLIENT)) {
    await client.query(
      `INSERT INTO settings (atelier_id, cle, valeur) VALUES ($1,$2,$3)
       ON CONFLICT (atelier_id, cle) DO NOTHING`,
      [atelierId, cle, valeur]
    );
  }
}

// Duplique services, catégories, FAQ et apparence d'un site existant.
async function dupliquerContenu(client, sourceId, atelierId) {
  await client.query(
    `INSERT INTO services (atelier_id, titre, description, icone, ordre)
     SELECT $2, titre, description, icone, ordre FROM services WHERE atelier_id = $1`,
    [sourceId, atelierId]
  );
  await client.query(
    `INSERT INTO categories_appareils (atelier_id, code, titre, description, icone, ordre)
     SELECT $2, code, titre, description, icone, ordre FROM categories_appareils WHERE atelier_id = $1`,
    [sourceId, atelierId]
  );
  await client.query(
    `INSERT INTO faq (atelier_id, question, reponse, ordre)
     SELECT $2, question, reponse, ordre FROM faq WHERE atelier_id = $1`,
    [sourceId, atelierId]
  );
  // Coordonnées vides, puis apparence copiée par-dessus.
  for (const [cle, valeur] of Object.entries(SETTINGS_NOUVEAU_CLIENT)) {
    await client.query(
      `INSERT INTO settings (atelier_id, cle, valeur) VALUES ($1,$2,$3)
       ON CONFLICT (atelier_id, cle) DO NOTHING`,
      [atelierId, cle, valeur]
    );
  }
  await client.query(
    `INSERT INTO settings (atelier_id, cle, valeur)
     SELECT $2, cle, valeur FROM settings WHERE atelier_id = $1 AND cle = ANY($3)
     ON CONFLICT (atelier_id, cle) DO UPDATE SET valeur = EXCLUDED.valeur`,
    [sourceId, atelierId, SETTINGS_DUPLICABLES]
  );
}

/**
 * @param client  client pg déjà dans une transaction (BEGIN fait par l'appelant)
 * @param opts    { nom, slug, domaine, logo_url, modeleId, adminEmail,
 *                  adminMotDePasse, avecAssistant, assistantEmail }
 */
async function creerAtelierComplet(client, opts) {
  const at = await client.query(
    `INSERT INTO ateliers (nom, slug, domaine, logo_url, actif)
     VALUES ($1, $2, $3, $4, 1)
     RETURNING id, nom, slug, domaine, logo_url, actif, created_at, updated_at`,
    [opts.nom, opts.slug, opts.domaine || null, opts.logo_url || null]
  );
  const atelier = at.rows[0];

  if (opts.modeleId) {
    await dupliquerContenu(client, opts.modeleId, atelier.id);
  } else {
    await insererContenuParDefaut(client, atelier.id);
  }

  const comptes = [];
  comptes.push(
    await creerCompte(client, atelier.id, {
      nom: 'Technicien',
      role: 'technicien',
      email: opts.adminEmail,
      motDePasse: opts.adminMotDePasse,
    })
  );

  if (opts.avecAssistant && opts.assistantEmail) {
    comptes.push(
      await creerCompte(client, atelier.id, {
        nom: 'Assistant technicien',
        role: 'assistant',
        email: opts.assistantEmail,
      })
    );
  }

  return { atelier, comptes };
}

module.exports = { creerAtelierComplet, genererMotDePasse, insererContenuParDefaut, creerCompte };
