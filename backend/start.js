// Démarrage en production :
//   1. prépare la base (idempotent),
//   2. crée le compte développeur si DEVELOPER_EMAIL / DEVELOPER_PASSWORD sont
//      définis et que ce compte n'existe pas encore,
//   3. lance l'API.
require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./src/db-postgres');
const { migrer } = require('./src/migrate');

async function assurerCompteDeveloppeur() {
  const email = (process.env.DEVELOPER_EMAIL || '').trim().toLowerCase();
  const motDePasse = process.env.DEVELOPER_PASSWORD || '';
  if (!email || !motDePasse) return;

  const existe = await db.query('SELECT 1 FROM developer_accounts WHERE email = $1', [email]);
  if (existe.rowCount > 0) return;

  const hash = await bcrypt.hash(motDePasse, 10);
  await db.query(
    `INSERT INTO developer_accounts (nom, email, mot_de_passe_hash, actif) VALUES ($1, $2, $3, 1)`,
    [process.env.DEVELOPER_NAME || 'Développeur', email, hash]
  );
  console.log(`Compte développeur créé : ${email}`);
}

migrer()
  .then(assurerCompteDeveloppeur)
  .then(() => require('./src/server.js'))
  .catch((err) => {
    console.error('Échec de l’initialisation :', err);
    process.exit(1);
  });
