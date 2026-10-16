// Middleware d'authentification de l'espace administrateur.
// Vérifie un jeton JWT transmis dans l'en-tête Authorization: Bearer <jeton>.
//
// Deux rôles existent :
// - "technicien" : le gérant de l'atelier, accès complet.
// - "assistant"  : "Assistant technicien" — compte partagé par les
//   apprentis, accès opérationnel (réparations, rendez-vous, demandes)
//   mais sans visibilité sur les montants ni sur la gestion du site.

const jwt = require('jsonwebtoken');
const db = require('../db-postgres');
const { fail } = require('../utils/response');

const JWT_SECRET =
  process.env.JWT_SECRET || 'change_this_secret_in_production';

async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return fail(res, 'Authentification requise.', 401);
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch {
    return fail(
      res,
      'Session invalide ou expirée. Reconnectez-vous.',
      401
    );
  }

  if (!payload.sub || !payload.atelier_id) {
    return fail(
      res,
      'Session administrateur invalide. Reconnectez-vous.',
      401
    );
  }

  try {
    const result = await db.query(
      `SELECT 1
       FROM admins a
       JOIN ateliers t ON t.id = a.atelier_id
       WHERE a.id = $1
         AND a.atelier_id = $2
         AND a.actif = 1
         AND t.actif = 1
       LIMIT 1`,
      [payload.sub, payload.atelier_id]
    );

    if (result.rowCount === 0) {
      return fail(
        res,
        'Compte ou site désactivé. Contactez le support.',
        401
      );
    }

    req.admin = {
      id: payload.sub,
      email: payload.email,
      nom: payload.nom,
      role: payload.role || 'technicien',
      atelier_id: payload.atelier_id,
    };

    return next();
  } catch (err) {
    return next(err);
  }
}

// À utiliser après requireAuth.
// Bloque l'accès si le rôle du compte connecté
// ne fait pas partie de la liste autorisée.
function requireRole(...rolesAutorises) {
  return (req, res, next) => {
    if (
      !req.admin ||
      !rolesAutorises.includes(req.admin.role)
    ) {
      return fail(
        res,
        "Vous n'avez pas les droits nécessaires pour cette action.",
        403
      );
    }

    return next();
  };
}

function signAdminToken(admin) {
  return jwt.sign(
    {
      sub: admin.id,
      email: admin.email,
      nom: admin.nom,
      role: admin.role || 'technicien',
      atelier_id: admin.atelier_id,
    },
    JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || '8h',
    }
  );
}

module.exports = {
  requireAuth,
  requireRole,
  signAdminToken,
};