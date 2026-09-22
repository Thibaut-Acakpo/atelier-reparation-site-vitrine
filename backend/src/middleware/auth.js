// Middleware d'authentification de l'espace administrateur (section 25).
// Vérifie un jeton JWT transmis dans l'en-tête Authorization: Bearer <jeton>.
//
// Deux rôles existent :
// - "technicien" : le gérant de l'atelier, accès complet.
// - "assistant"  : "Assistant technicien" — compte partagé par les
//   apprentis, accès opérationnel (réparations, rendez-vous, demandes)
//   mais sans visibilité sur les montants ni sur la gestion du site (voir
//   requireRole ci-dessous et son usage dans les routes admin).

const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret_in_production';

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return fail(res, 'Authentification requise.', 401);
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.admin = { id: payload.sub, email: payload.email, nom: payload.nom, role: payload.role || 'technicien' };
    return next();
  } catch {
    return fail(res, 'Session invalide ou expirée. Reconnectez-vous.', 401);
  }
}

// À utiliser après requireAuth. Bloque l'accès si le rôle du compte connecté
// ne fait pas partie de la liste autorisée.
function requireRole(...rolesAutorises) {
  return (req, res, next) => {
    if (!req.admin || !rolesAutorises.includes(req.admin.role)) {
      return fail(res, "Vous n'avez pas les droits nécessaires pour cette action.", 403);
    }
    return next();
  };
}

function signAdminToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, nom: admin.nom, role: admin.role || 'technicien' },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
}

module.exports = { requireAuth, requireRole, signAdminToken };

