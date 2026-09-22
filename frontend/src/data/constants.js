// Informations de l'atelier — DONNÉES D'EXEMPLE À REMPLACER avant mise en
// production (voir cahier des charges, section 30).
export const ATELIER = {
  nom: "Atelier de réparation électronique", // nom définitif à ajouter
  slogan: 'Diagnostic précis. Service de confiance.',
  adresse: 'Quartier Cadjehoun, près du carrefour Vedoko, Cotonou, Bénin',
  telephone: '+229 90 12 34 56',
  whatsapp: '+229 90 12 34 56',
  email: 'contact@atelier-maintenance.bj',
  horaires: [
    { jours: 'Lundi — Vendredi', heures: '8h00 — 18h00' },
    { jours: 'Samedi', heures: '9h00 — 13h00' },
    { jours: 'Dimanche', heures: 'Fermé' },
  ],
  mapsQuery: 'Carrefour Vedoko, Cadjehoun, Cotonou, Bénin',
};

export function whatsappLink(message = '') {
  const digits = ATELIER.whatsapp.replace(/[^\d]/g, '');
  const text = encodeURIComponent(message);
  return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
}

export const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/services', label: 'Services' },
  { to: '/appareils', label: 'Appareils' },
  { to: '/realisations', label: 'Réalisations' },
  { to: '/a-propos', label: 'À propos' },
  { to: '/suivi', label: 'Suivi' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];
