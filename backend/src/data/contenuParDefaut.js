// Contenu injecté automatiquement lorsqu'un nouvel atelier (client) est créé.

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

function codeStatut(libelle) {
  return libelle
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_');
}

const SERVICES = [
  ['Réparation matérielle', "Remplacement d'écrans, batteries, connecteurs et composants endommagés.", 'wrench'],
  ['Réparation logicielle', 'Résolution de bugs, blocages, virus et problèmes de démarrage.', 'terminal-square'],
  ['Diagnostic', 'Examen technique complet pour identifier précisément la panne. Gratuit.', 'search'],
  ['Maintenance et entretien', 'Nettoyage interne, pâte thermique, entretien préventif.', 'settings'],
  ['Remplacement de composants', 'Pièces d’origine ou compatibles de qualité, selon disponibilité.', 'cpu'],
  ['Réinstallation et configuration', "Système d'exploitation, logiciels et paramétrage.", 'refresh-ccw'],
];

const CATEGORIES = [
  ['telephone', 'Téléphones', 'Smartphones toutes marques : écran, batterie, connecteur, logiciel.', 'smartphone'],
  ['ordinateur', 'Ordinateurs', 'Portables et fixes : diagnostic, pièces, système, performance.', 'laptop'],
  ['tablette', 'Tablettes', 'Écran, batterie, port de charge, mise à jour et configuration.', 'tablet'],
  ['autre', 'Autres appareils', 'Consoles, accessoires et autres équipements électroniques.', 'cpu'],
];

const FAQ = [
  ['Le diagnostic est-il payant ?', 'Non, le diagnostic est gratuit et réalisé à l’atelier.'],
  ['Puis-je connaître le prix avant de venir ?', "Aucune estimation n'est communiquée en ligne. Le prix est donné après diagnostic à l'atelier."],
  ['Comment suivre ma réparation ?', 'Utilisez le code de suivi fourni lors du dépôt, sur la page "Suivre ma réparation".'],
  ['Puis-je prendre rendez-vous ?', 'Oui, vous pouvez indiquer une date et une heure souhaitées ; l’atelier confirme ensuite.'],
];

const HORAIRES = [
  { jours: 'Lundi — Vendredi', heures: '8h00 — 18h00' },
  { jours: 'Samedi', heures: '9h00 — 13h00' },
  { jours: 'Dimanche', heures: 'Fermé' },
];

// Paramètres d'un NOUVEAU client : les coordonnées sont volontairement vides
// (on ne recopie jamais le téléphone ou l'adresse d'un autre client).
const SETTINGS_NOUVEAU_CLIENT = {
  slogan: 'Réparation rapide et fiable.',
  adresse: '',
  telephone: '',
  whatsapp: '',
  email: '',
  horaires: JSON.stringify(HORAIRES),
  mapsQuery: '',
  couleurPrincipale: '#0A1B33',
  couleurSecondaire: '#0F2E5C',
  couleurAccent: '#C4972D',
  couleurFond: '#F1F5F8',
  couleurTexte: '#0A1B33',
  theme: 'clair',
};

// Clés copiées lorsqu'on duplique un site existant (apparence + ton),
// jamais les coordonnées.
const SETTINGS_DUPLICABLES = [
  'slogan',
  'horaires',
  'couleurPrincipale',
  'couleurSecondaire',
  'couleurAccent',
  'couleurFond',
  'couleurTexte',
  'theme',
];

// Clés de paramètres modifiables depuis l'espace développeur.
const SETTINGS_AUTORISES = [
  'slogan', 'adresse', 'telephone', 'whatsapp', 'email', 'horaires', 'mapsQuery',
  'couleurPrincipale', 'couleurSecondaire', 'couleurAccent', 'couleurFond', 'couleurTexte', 'theme',
  'seoTitre', 'seoDescription', 'seoMotsCles', 'seoImage',
  'facebook', 'instagram', 'linkedin', 'youtube', 'tiktok', 'x',
];

module.exports = {
  STATUTS, codeStatut, SERVICES, CATEGORIES, FAQ, HORAIRES,
  SETTINGS_NOUVEAU_CLIENT, SETTINGS_DUPLICABLES, SETTINGS_AUTORISES,
};
