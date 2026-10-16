// Client API de l'espace développeur : ajoute le jeton, normalise les réponses
// et renvoie vers la connexion si la session a expiré.

import { API_BASE } from '../data/config';
import { confirmerMutation } from './components/ui';

export const TOKEN_KEY = 'developer_token';

export const getDevToken = () => localStorage.getItem(TOKEN_KEY);
export const setDevToken = (t) => localStorage.setItem(TOKEN_KEY, t);
export const clearDevToken = () => localStorage.removeItem(TOKEN_KEY);

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const action = method.toUpperCase();
  const dejaConfirmee = action === 'DELETE';
  if (auth && action !== 'GET' && path !== '/auth/login' && !dejaConfirmee) {
    const confirme = await confirmerMutation(action, path, body);
    if (!confirme) {
      return { httpStatus: 0, success: false, cancelled: true, message: '', data: null, errors: [] };
    }
  }

  const token = getDevToken();
  const isForm = body instanceof FormData;

  let response;
  try {
    response = await fetch(`${API_BASE}/api/gestion${path}`, {
      method,
      headers: {
        ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    });
  } catch {
    return {
      success: false,
      message: 'Impossible de contacter le serveur. Vérifiez que l’API est démarrée.',
      data: null,
      errors: [],
      httpStatus: 0,
    };
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    payload = { success: false, message: 'Réponse invalide du serveur.', data: null, errors: [] };
  }

  if (response.status === 401 && auth && path !== '/auth/login') {
    clearDevToken();
    if (!window.location.pathname.startsWith('/gestion/connexion')) {
      window.location.assign('/gestion/connexion');
    }
  }

  return { httpStatus: response.status, ...payload };
}

const at = (id) => `/ateliers/${id}`;

export const gestionApi = {
  login: (email, mot_de_passe) =>
    request('/auth/login', { method: 'POST', body: { email, mot_de_passe }, auth: false }),
  me: () => request('/auth/me'),

  ateliers: () => request('/ateliers'),
  creerAtelier: (data) => request('/ateliers', { method: 'POST', body: data }),
  majAtelier: (id, data) => request(at(id), { method: 'PATCH', body: data }),
  statutAtelier: (id, actif) => request(`${at(id)}/statut`, { method: 'PATCH', body: { actif } }),
  supprimerAtelier: (id, confirmation) =>
    request(at(id), { method: 'DELETE', body: { confirmation } }),

  settings: (id) => request(`${at(id)}/settings`),
  majSettings: (id, data) => request(`${at(id)}/settings`, { method: 'PUT', body: data }),

  comptes: (id) => request(`${at(id)}/comptes`),
  reinitialiserCompte: (id, role, data = {}) =>
    request(`${at(id)}/comptes/${role}/reinitialiser`, { method: 'POST', body: data }),
  statutCompte: (id, role, actif) =>
    request(`${at(id)}/comptes/${role}`, { method: 'PATCH', body: { actif } }),

  contenu: {
    liste: (id, type) => request(`${at(id)}/contenu/${type}`),
    creer: (id, type, data) => request(`${at(id)}/contenu/${type}`, { method: 'POST', body: data }),
    maj: (id, type, itemId, data) =>
      request(`${at(id)}/contenu/${type}/${itemId}`, { method: 'PATCH', body: data }),
    supprimer: (id, type, itemId) =>
      request(`${at(id)}/contenu/${type}/${itemId}`, { method: 'DELETE' }),
  },

  realisations: {
    liste: (id) => request(`${at(id)}/realisations`),
    creer: (id, formData) => request(`${at(id)}/realisations`, { method: 'POST', body: formData }),
    maj: (id, rid, formData) =>
      request(`${at(id)}/realisations/${rid}`, { method: 'PATCH', body: formData }),
    supprimer: (id, rid) => request(`${at(id)}/realisations/${rid}`, { method: 'DELETE' }),
  },
};
