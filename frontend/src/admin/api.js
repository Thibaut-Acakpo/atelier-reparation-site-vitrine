// Client API de l'espace administrateur. Ajoute automatiquement le jeton
// d'authentification stocké après connexion.

const BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'admin_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}) {
  const token = getToken();
  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${BASE_URL}/api/admin${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = { success: false, message: 'Réponse invalide du serveur.', data: null, errors: [] };
  }

  if (response.status === 401) {
    clearToken();
  }

  return { httpStatus: response.status, ...payload };
}

export const adminApi = {
  login: (email, mot_de_passe) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, mot_de_passe }) }),
  me: () => request('/auth/me'),
  changerMotDePasse: (data) => request('/auth/changer-mot-de-passe', { method: 'POST', body: JSON.stringify(data) }),

  dashboard: () => request('/dashboard'),

  demandes: (statut) => request(`/demandes${statut ? `?statut=${statut}` : ''}`),
  demande: (id) => request(`/demandes/${id}`),
  majDemande: (id, data) => request(`/demandes/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  convertirDemande: (id) => request(`/demandes/${id}/convertir`, { method: 'POST' }),

  rendezVous: (statut) => request(`/rendez-vous${statut ? `?statut=${statut}` : ''}`),
  majRendezVous: (id, data) => request(`/rendez-vous/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  reparations: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/reparations${qs ? `?${qs}` : ''}`);
  },
  reparation: (id) => request(`/reparations/${id}`),
  majReparation: (id, data) => request(`/reparations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  majDevis: (id, devis_decision) => request(`/reparations/${id}/devis`, { method: 'PATCH', body: JSON.stringify({ devis_decision }) }),
  ajouterPiece: (id, data) => request(`/reparations/${id}/pieces`, { method: 'POST', body: JSON.stringify(data) }),
  retirerPiece: (id, reparationPieceId) => request(`/reparations/${id}/pieces/${reparationPieceId}`, { method: 'DELETE' }),

  statuts: () => request('/statuts'),
  pieces: () => request('/pieces'),
  creerPiece: (data) => request('/pieces', { method: 'POST', body: JSON.stringify(data) }),
  supprimerPiece: (id) => request(`/pieces/${id}`, { method: 'DELETE' }),

  avis: (statut) => request(`/avis${statut ? `?statut=${statut}` : ''}`),
  majAvis: (id, statut) => request(`/avis/${id}`, { method: 'PATCH', body: JSON.stringify({ statut }) }),
  supprimerAvis: (id) => request(`/avis/${id}`, { method: 'DELETE' }),

  contacts: (traite) => request(`/contacts${traite !== undefined ? `?traite=${traite}` : ''}`),
  majContact: (id, traite) => request(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify({ traite }) }),

  clients: (q) => request(`/clients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  client: (id) => request(`/clients/${id}`),

  realisations: () => request('/realisations'),
  creerRealisation: (formData) => request('/realisations', { method: 'POST', body: formData }),
  majRealisation: (id, formData) => request(`/realisations/${id}`, { method: 'PATCH', body: formData }),
  supprimerRealisation: (id) => request(`/realisations/${id}`, { method: 'DELETE' }),

  contenu: {
    liste: (type) => request(`/contenu/${type}`),
    creer: (type, data) => request(`/contenu/${type}`, { method: 'POST', body: JSON.stringify(data) }),
    maj: (type, id, data) => request(`/contenu/${type}/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    supprimer: (type, id) => request(`/contenu/${type}/${id}`, { method: 'DELETE' }),
  },
};
