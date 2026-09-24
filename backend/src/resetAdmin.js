// Crée ou met à jour les comptes de l'espace admin à partir des valeurs
// du fichier .env :
// - ADMIN_EMAIL / ADMIN_PASSWORD           → compte "Technicien" (gérant, accès complet)
// - ASSISTANT_EMAIL / ASSISTANT_PASSWORD   → compte "Assistant technicien" (partagé, accès restreint)
//
// Utile quand ces valeurs ont été renseignées/modifiées dans .env APRÈS un
// premier `npm run seed` : ce dernier ne crée chaque compte qu'une seule
// fois (s'il n'existe pas encore) et ne le met jamais à jour ensuite.
// Cette commande, elle, peut être relancée à tout moment.
//
// Usage : npm run admin:reset

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db-postgres');

async function upsertCompte({ nom, role, email, motDePasse }) {
  if (!email || !motDePasse) {
    return { statut: 'ignore' };
  }

  if (motDePasse.length < 8) {
    console.error(
      `\nLe mot de passe pour "${nom}" doit contenir au moins 8 caractères — ignoré.\n`
    );
    return { statut: 'erreur' };
  }

  const emailNormalise = email.trim().toLowerCase();
  const hash = await bcrypt.hash(motDePasse, 10);

  // Recherche par rôle plutôt que par email :
  // il ne doit exister qu'un seul compte "Technicien"
  // et un seul compte "Assistant technicien".
  const existant = await db.query(
    `SELECT id FROM admins WHERE role = $1 LIMIT 1`,
    [role]
  );

  if (existant.rowCount > 0) {
    await db.query(
      `UPDATE admins
       SET email = $1,
           mot_de_passe_hash = $2,
           actif = 1
       WHERE id = $3`,
      [
        emailNormalise,
        hash,
        existant.rows[0].id,
      ]
    );

    return {
      statut: 'maj',
      email: emailNormalise,
    };
  }

  await db.query(
    `INSERT INTO admins
      (nom, email, mot_de_passe_hash, role)
     VALUES ($1, $2, $3, $4)`,
    [
      nom,
      emailNormalise,
      hash,
      role,
    ]
  );

  return {
    statut: 'cree',
    email: emailNormalise,
  };
}

async function run() {
  try {
    const resultatTechnicien = await upsertCompte({
      nom: 'Technicien',
      role: 'technicien',
      email: process.env.ADMIN_EMAIL,
      motDePasse: process.env.ADMIN_PASSWORD,
    });

    const resultatAssistant = await upsertCompte({
      nom: 'Assistant technicien',
      role: 'assistant',
      email: process.env.ASSISTANT_EMAIL,
      motDePasse: process.env.ASSISTANT_PASSWORD,
    });

    if (
      resultatTechnicien.statut === 'ignore' &&
      resultatAssistant.statut === 'ignore'
    ) {
      console.error(
        '\nRenseignez ADMIN_EMAIL/ADMIN_PASSWORD et/ou ASSISTANT_EMAIL/ASSISTANT_PASSWORD dans backend/.env avant de lancer cette commande.\n'
      );

      process.exit(1);
    }

    if (
      resultatTechnicien.statut === 'cree' ||
      resultatTechnicien.statut === 'maj'
    ) {
      console.log(
        `\nCompte "Technicien" ${
          resultatTechnicien.statut === 'cree'
            ? 'créé'
            : 'mis à jour'
        } : ${resultatTechnicien.email}`
      );
    }

    if (
      resultatAssistant.statut === 'cree' ||
      resultatAssistant.statut === 'maj'
    ) {
      console.log(
        `Compte "Assistant technicien" ${
          resultatAssistant.statut === 'cree'
            ? 'créé'
            : 'mis à jour'
        } : ${resultatAssistant.email}`
      );
    }

    console.log(
      '\nConnexion sur : http://localhost:5173/admin/connexion\n'
    );
  } catch (err) {
    console.error(
      '\nErreur lors de la création/mise à jour des comptes administrateur :',
      err
    );

    process.exit(1);
  }
}

run();