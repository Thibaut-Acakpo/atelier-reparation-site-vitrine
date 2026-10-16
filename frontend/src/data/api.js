// Client API léger. En dev, Vite proxifie /api vers le backend (voir vite.config.js).
// En production, servir le frontend et le backend derrière le même domaine,
// ou définir VITE_API_URL dans un .env du frontend.

import { API_BASE as BASE_URL } from './config';
import { tenantHeaders } from './tenant';
import { confirmerMutation } from '../gestion/components/ui';

async function request(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (method !== 'GET') {
    const body = typeof options.body === 'string'
      ? (() => { try { return JSON.parse(options.body); } catch { return undefined; } })()
      : options.body;
    const confirme = await confirmerMutation(method, path, body);
    if (!confirme) {
      return { httpStatus: 0, success: false, cancelled: true, message: '', data: null, errors: [] };
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...tenantHeaders(),
      ...(options.headers || {}),
    },
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = { success: false, message: 'Réponse invalide du serveur.', data: null, errors: [] };
  }
  return { httpStatus: response.status, ...payload };
}

export const api = {
  getServices: () => request('/api/services'),
  getAppareils: () => request('/api/appareils'),
  getFaq: () => request('/api/faq'),
  getRealisations: () => request('/api/realisations'),
  getAvisValides: () => request('/api/avis-valides'),
  suivreReparation: (numero) => request(`/api/reparations/${encodeURIComponent(numero)}`),
  envoyerDemandeReparation: (formData) =>
    request('/api/demandes-reparation', { method: 'POST', body: formData }),
  envoyerRendezVous: (data) =>
    request('/api/rendez-vous', { method: 'POST', body: JSON.stringify(data) }),
  envoyerContact: (data) => request('/api/contact', { method: 'POST', body: JSON.stringify(data) }),
  envoyerAvis: (data) => request('/api/avis', { method: 'POST', body: JSON.stringify(data) }),
};
