// Client API léger. En dev, Vite proxifie /api vers le backend (voir vite.config.js).
// En production, servir le frontend et le backend derrière le même domaine,
// ou définir VITE_API_URL dans un .env du frontend.

const BASE_URL = import.meta.env.VITE_API_URL || '';

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: options.body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
    ...options,
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
