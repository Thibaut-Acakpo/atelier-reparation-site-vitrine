// Configuration commune : adresse de l'API et construction des URLs de médias.
//
// En développement, Vite redirige /api et /uploads vers le backend (voir
// vite.config.js) : VITE_API_URL peut rester vide.
// En production (frontend et API sur deux adresses), définir VITE_API_URL.

export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

// Transforme "/uploads/xxx.jpg" en URL complète vers le backend.
export function urlUpload(chemin) {
  if (!chemin) return '';
  if (/^https?:\/\//i.test(chemin) || chemin.startsWith('data:')) return chemin;
  return `${API_BASE}${chemin.startsWith('/') ? '' : '/'}${chemin}`;
}
