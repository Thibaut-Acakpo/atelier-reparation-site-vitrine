// Génération des identifiants de suivi.
//
// Le cahier des charges (18.1) demande que le numéro de fiche ne soit pas
// une séquence énumérable : on distingue donc :
//  - numero_fiche  : identifiant lisible/interne, ex. REP-2026-0184
//  - code_public   : jeton aléatoire long, c'est CELUI-CI que le client
//                    saisit sur la page de suivi. Il ne peut pas être deviné
//                    à partir du numéro de fiche.

const { nanoid } = require('nanoid');

function generateNumeroFiche(sequence, year = new Date().getFullYear()) {
  return `REP-${year}-${String(sequence).padStart(4, '0')}`;
}

function generateCodePublic() {
  // 12 caractères alphanumériques non ambigus (nanoid par défaut) : espace
  // de recherche large, pas de motif prévisible entre deux fiches.
  return nanoid(12);
}

module.exports = { generateNumeroFiche, generateCodePublic };
