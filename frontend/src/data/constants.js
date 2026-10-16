// Configuration par défaut et chargement dynamique de l'atelier.

import { API_BASE as API_URL } from './config';
import { tenantHeaders } from './tenant';

export const ATELIER_PAR_DEFAUT = {
  nom: 'Atelier de réparation électronique',
  slogan: 'Réparation rapide et fiable.',
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

  couleurPrincipale: '#0A1B33',
  couleurSecondaire: '#0F2E5C',
  couleurAccent: '#C4972D',
  couleurFond: '#F1F5F8',
  couleurTexte: '#0A1B33',
  theme: 'clair',
};

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


let atelier = { ...ATELIER_PAR_DEFAUT };

export async function chargerConfigurationAtelier() {
  try {
    const response = await fetch(`${API_URL}/api/settings`, {
      headers: tenantHeaders(),
    });

    // Lien inconnu ou site désactivé : on ne montre surtout pas les
    // informations d'un autre atelier.
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Erreur HTTP ${response.status}`);
    }

    const result = await response.json();

    if (
      result.success &&
      result.data &&
      typeof result.data === 'object' &&
      !Array.isArray(result.data)
    ) {
      atelier = {
        ...ATELIER_PAR_DEFAUT,
        ...result.data,
      };

      if (typeof result.data.horaires === 'string') {
        try {
          atelier.horaires = JSON.parse(result.data.horaires);
        } catch {
          atelier.horaires = ATELIER_PAR_DEFAUT.horaires;
        }
      }
    }
  } catch (error) {
    console.error(
      "Impossible de charger la configuration de l'atelier :",
      error
    );
  }

  return atelier;
}

export function getAtelier() {
  return atelier;
}

export function whatsappLink(message = '') {
  const digits = String(atelier.whatsapp || '').replace(/[^\d]/g, '');
  const text = encodeURIComponent(message);

  return digits
    ? `https://wa.me/${digits}${text ? `?text=${text}` : ''}`
    : '#';
}

export const ATELIER = ATELIER_PAR_DEFAUT;
