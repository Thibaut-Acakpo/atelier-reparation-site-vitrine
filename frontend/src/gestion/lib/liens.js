// Construction des liens à communiquer au client.

// Lien « universel » : fonctionne sans aucune configuration DNS.
export function lienSiteParSlug(atelier) {
  return `${window.location.origin}/s/${atelier.slug}`;
}

const estDomaineLocal = (domaine) => domaine === 'localhost' || domaine.endsWith('.localhost');

// Lien conseillé : le domaine du client s'il est configuré, sinon le lien /s/slug.
// En local (ex. test-b.localhost), on garde le protocole et le port du navigateur.
export function lienSite(atelier) {
  if (!atelier.domaine) return lienSiteParSlug(atelier);

  if (estDomaineLocal(atelier.domaine)) {
    const { protocol, port } = window.location;
    return `${protocol}//${atelier.domaine}${port ? `:${port}` : ''}`;
  }

  return `https://${atelier.domaine}`;
}

export function lienAdmin(atelier) {
  return `${lienSite(atelier)}/admin/connexion`;
}
