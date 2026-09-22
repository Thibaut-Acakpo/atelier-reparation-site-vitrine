// Crée ou met à jour les comptes de l'espace admin à partir des valeurs
// du fichier .env :
// - ADMIN_EMAIL / ADMIN_PASSWORD           → compte "Technicien" (gérant, accès complet)
// - ASSISTANT_EMAIL / ASSISTANT_PASSWORD   → compte "Assistant technicien" (partagé, accès restreint)
//
// Utile quand ces valeurs ont été renseignées/modifiées dans .env APRÈS un
// premier `npm run seed` : ce dernier ne crée chaque compte qu'une seule
// fois (s'il n'existe pas encore) et ne le met jamais à jour ensuite.
// Cette commande, elle, peut être relancée à tout moment (ex. pour changer
// le mot de passe de l'Assistant technicien quand l'atelier change
// d'apprenti).
//
// Usage : npm run admin:reset

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

function upsertCompte({ nom, role, email, motDePasse }) {
  if (!email || !motDePasse) return { statut: 'ignore' };

  if (motDePasse.length < 8) {
    console.error(`\nLe mot de passe pour "${nom}" doit contenir au moins 8 caractères — ignoré.\n`); // eslint-disable-line no-console
    return { statut: 'erreur' };
  }

  const emailNormalise = email.trim().toLowerCase();
  const hash = bcrypt.hashSync(motDePasse, 10);

  // Recherche par rôle plutôt que par email : il ne doit exister qu'un seul
  // compte "Technicien" et un seul "Assistant technicien". Si l'email a
  // changé depuis la dernière fois, il est mis à jour sur ce même compte
  // plutôt que d'en créer un second.
  const existant = db.prepare(`SELECT id FROM admins WHERE role = ?`).get(role);

  if (existant) {
    db.prepare(`UPDATE admins SET email = ?, mot_de_passe_hash = ?, actif = 1 WHERE id = ?`).run(
      emailNormalise,
      hash,
      existant.id
    );
    return { statut: 'maj', email: emailNormalise };
  }

  db.prepare(`INSERT INTO admins (nom, email, mot_de_passe_hash, role) VALUES (?, ?, ?, ?)`).run(
    nom,
    emailNormalise,
    hash,
    role
  );
  return { statut: 'cree', email: emailNormalise };
}

function run() {
  const resultatTechnicien = upsertCompte({
    nom: 'Technicien',
    role: 'technicien',
    email: process.env.ADMIN_EMAIL,
    motDePasse: process.env.ADMIN_PASSWORD,
  });

  const resultatAssistant = upsertCompte({
    nom: 'Assistant technicien',
    role: 'assistant',
    email: process.env.ASSISTANT_EMAIL,
    motDePasse: process.env.ASSISTANT_PASSWORD,
  });

  if (resultatTechnicien.statut === 'ignore' && resultatAssistant.statut === 'ignore') {
    console.error(
      '\nRenseignez ADMIN_EMAIL/ADMIN_PASSWORD et/ou ASSISTANT_EMAIL/ASSISTANT_PASSWORD dans backend/.env avant de lancer cette commande.\n'
    ); // eslint-disable-line no-console
    process.exit(1);
  }

  if (resultatTechnicien.statut === 'cree' || resultatTechnicien.statut === 'maj') {
    console.log(`\nCompte "Technicien" ${resultatTechnicien.statut === 'cree' ? 'créé' : 'mis à jour'} : ${resultatTechnicien.email}`); // eslint-disable-line no-console
  }
  if (resultatAssistant.statut === 'cree' || resultatAssistant.statut === 'maj') {
    console.log(`Compte "Assistant technicien" ${resultatAssistant.statut === 'cree' ? 'créé' : 'mis à jour'} : ${resultatAssistant.email}`); // eslint-disable-line no-console
  }

  console.log('\nConnexion sur : http://localhost:5173/admin/connexion\n'); // eslint-disable-line no-console
}

run();
