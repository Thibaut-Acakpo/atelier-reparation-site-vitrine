const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');

const DEVELOPER_JWT_SECRET =
  process.env.DEVELOPER_JWT_SECRET ||
  process.env.JWT_SECRET ||
  'change_this_developer_secret_in_production';

const DEVELOPER_JWT_EXPIRES_IN =
  process.env.DEVELOPER_JWT_EXPIRES_IN || '8h';

function requireDeveloperAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return fail(
      res,
      'Authentification développeur requise.',
      401
    );
  }

  try {
    const payload = jwt.verify(
      token,
      DEVELOPER_JWT_SECRET
    );

    if (
      payload.type !== 'developer' ||
      !payload.sub
    ) {
      return fail(
        res,
        'Session développeur invalide.',
        401
      );
    }

    req.developer = {
      id: payload.sub,
      email: payload.email,
      nom: payload.nom,
      type: 'developer',
    };

    return next();
  } catch {
    return fail(
      res,
      'Session développeur invalide ou expirée. Reconnectez-vous.',
      401
    );
  }
}

function signDeveloperToken(developer) {
  return jwt.sign(
    {
      sub: developer.id,
      email: developer.email,
      nom: developer.nom,
      type: 'developer',
    },
    DEVELOPER_JWT_SECRET,
    {
      expiresIn: DEVELOPER_JWT_EXPIRES_IN,
    }
  );
}

module.exports = {
  requireDeveloperAuth,
  signDeveloperToken,
};