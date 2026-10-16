// Identifie l'atelier (le client) concerné par une requête publique.
//
// Ordre de résolution :
//   1. En-tête `X-Atelier-Slug` (ou `?atelier=`) : lien de type
//      https://site.com/s/mon-client — envoyé automatiquement par le frontend.
//   2. Sous-domaine local `xxx.localhost` (développement).
//   3. Domaine personnalisé (Origin / Referer) enregistré pour un atelier.
//   4. En local uniquement (localhost) : premier atelier actif.

const db = require('../db-postgres');
const { fail } = require('../utils/response');

const COLONNES = 'id, nom, slug, domaine, logo_url';
const SLUG_VALIDE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function extraireHostname(req) {
  for (const candidat of [req.headers.origin, req.headers.referer]) {
    if (!candidat) continue;
    try {
      return new URL(String(candidat).trim()).hostname.toLowerCase();
    } catch {
      // candidat suivant
    }
  }
  return '';
}

async function trouver(where, params) {
  const r = await db.query(
    `SELECT ${COLONNES} FROM ateliers WHERE actif = 1 AND ${where} LIMIT 1`,
    params
  );
  return r.rows[0] || null;
}

async function resolveAtelierPublic(req, res, next) {
  try {
    const slug = String(req.headers['x-atelier-slug'] || req.query.atelier || '')
      .trim()
      .toLowerCase();

    if (slug) {
      if (!SLUG_VALIDE.test(slug) || slug.length > 64) {
        return fail(res, 'Lien de site invalide.', 404);
      }
      const atelier = await trouver('slug = $1', [slug]);
      if (!atelier) {
        return fail(res, `Aucun site actif trouvé pour « ${slug} ».`, 404);
      }
      req.atelier = atelier;
      return next();
    }

    const hostname = extraireHostname(req);

    if (hostname.endsWith('.localhost')) {
      const atelier = await trouver('slug = $1 OR domaine = $2', [
        hostname.slice(0, -'.localhost'.length),
        hostname,
      ]);
      if (!atelier) return fail(res, `Aucun atelier actif trouvé pour « ${hostname} ».`, 404);
      req.atelier = atelier;
      return next();
    }

    if (!hostname || hostname === 'localhost' || hostname === '127.0.0.1') {
      const r = await db.query(
        `SELECT ${COLONNES} FROM ateliers WHERE actif = 1 ORDER BY id ASC LIMIT 1`
      );
      if (r.rowCount === 0) return fail(res, 'Aucun atelier actif n’est configuré.', 404);
      req.atelier = r.rows[0];
      return next();
    }

    const atelier = await trouver('domaine = $1 OR domaine = $2', [hostname, `www.${hostname}`]);
    if (!atelier) return fail(res, 'Aucun atelier associé à ce domaine.', 404);
    req.atelier = atelier;
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = { resolveAtelierPublic };
