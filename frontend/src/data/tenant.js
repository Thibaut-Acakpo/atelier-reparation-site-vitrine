// Identification du client (atelier) à partir du lien visité.
//
//   https://mon-site.com/s/tech-plus     → slug « tech-plus » (lien généré
//                                           depuis l'espace développeur)
//   https://www.techplus.bj/             → domaine personnalisé : aucun slug,
//                                           c'est le serveur qui reconnaît le domaine
//   https://mon-site.com/gestion/...     → espace développeur (aucun client)

const correspondance = window.location.pathname.match(/^\/s\/([a-z0-9-]+)(?=\/|$)/i);

export const TENANT_SLUG = correspondance ? correspondance[1].toLowerCase() : null;

// Préfixe de toutes les routes React Router : les liens internes
// (<Link to="/services">) fonctionnent sans aucune modification.
export const ROUTER_BASENAME = TENANT_SLUG ? `/s/${TENANT_SLUG}` : '/';

export function tenantHeaders() {
  return TENANT_SLUG ? { 'X-Atelier-Slug': TENANT_SLUG } : {};
}
