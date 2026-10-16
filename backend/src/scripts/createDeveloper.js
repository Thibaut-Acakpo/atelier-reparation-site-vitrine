require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env'),
});

const bcrypt = require('bcryptjs');
const db = require('../db-postgres');

async function creerCompteDeveloppeur() {
  try {
    const email = String(process.env.DEVELOPER_EMAIL || '')
      .trim()
      .toLowerCase();

    const motDePasse = String(
      process.env.DEVELOPER_PASSWORD || ''
    );

    const nom = String(
      process.env.DEVELOPER_NAME || 'Développeur'
    ).trim();

    if (!email || !motDePasse) {
      throw new Error(
        'DEVELOPER_EMAIL et DEVELOPER_PASSWORD doivent être définis dans .env'
      );
    }

    if (motDePasse.length < 8) {
      throw new Error(
        'DEVELOPER_PASSWORD doit contenir au moins 8 caractères.'
      );
    }

    const hash = await bcrypt.hash(motDePasse, 12);

    await db.query(
      `
      INSERT INTO developer_accounts (
        nom,
        email,
        mot_de_passe_hash,
        actif
      )
      VALUES ($1, $2, $3, 1)
      ON CONFLICT (email)
      DO UPDATE SET
        nom = EXCLUDED.nom,
        mot_de_passe_hash = EXCLUDED.mot_de_passe_hash,
        actif = 1
      `,
      [nom, email, hash]
    );

    console.log(
      `Compte développeur créé/mis à jour : ${email}`
    );
  } catch (error) {
    console.error(
      'Erreur création compte développeur :',
      error.message
    );
    process.exitCode = 1;
  } finally {
    await db.end();
  }
}

creerCompteDeveloppeur();