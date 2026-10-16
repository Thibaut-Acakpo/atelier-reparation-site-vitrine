require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const db = require('./db-postgres');

const { fail } = require('./utils/response');
const { serveActiveAtelierUpload } = require('./middleware/upload');
const {
  resolveAtelierPublic,
} = require('./middleware/atelierPublic');

const demandesReparationRouter = require('./routes/demandesReparation');
const rendezVousRouter = require('./routes/rendezVous');
const contactRouter = require('./routes/contact');
const avisRouter = require('./routes/avis');
const reparationsRouter = require('./routes/reparations');
const contenuRouter = require('./routes/contenu');
const adminRouter = require('./routes/admin');
const settingsRoutes = require('./routes/settings');
const gestionAuthRouter = require('./routes/gestionAuth');
const gestionAteliersRouter = require('./routes/gestionAteliers');

const app = express();

// Refuse de démarrer en production avec des secrets par défaut.
if (process.env.NODE_ENV === 'production') {
  const faibles = ['JWT_SECRET', 'TRACKING_SALT'].filter(
    (k) => !process.env[k] || process.env[k].startsWith('change_this')
  );
  if (faibles.length) {
    throw new Error(`Secrets manquants ou par défaut en production : ${faibles.join(', ')}`);
  }
}

app.set('trust proxy', 1);

const PORT = process.env.PORT || 4000;
const FRONTEND_URL =
  process.env.FRONTEND_URL || 'http://localhost:5173';

// ---------------------------------------------------------------------------
// Résolution des domaines autorisés
// ---------------------------------------------------------------------------

async function verifierOrigineCORS(origin) {
  // Requêtes sans Origin : curl, Postman et appels serveur.
  if (!origin) {
    return true;
  }

  try {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();

    // Développement local classique et sous-domaines locaux.
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.localhost')
    ) {
      return true;
    }

    // Frontend principal configuré dans Render/.env.
    if (origin === FRONTEND_URL) {
      return true;
    }

    // Domaines personnalisés des ateliers enregistrés.
    const result = await db.query(
      `
      SELECT 1
      FROM ateliers
      WHERE actif = 1
        AND (
          domaine = $1
          OR domaine = $2
        )
      LIMIT 1
      `,
      [hostname, `www.${hostname}`]
    );

    return result.rowCount > 0;
  } catch (error) {
    console.error(
      'Erreur vérification origine CORS :',
      error
    );

    return false;
  }
}

const corsOptions = {
  origin: async (origin, callback) => {
    try {
      const autorisee =
        await verifierOrigineCORS(origin);

      if (autorisee) {
        return callback(null, true);
      }

      return callback(
        new Error('Origine CORS non autorisée.')
      );
    } catch (error) {
      return callback(error);
    }
  },
};

// ---------------------------------------------------------------------------
// Sécurité de base
// ---------------------------------------------------------------------------

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: 'cross-origin',
    },
  })
);

app.use(cors(corsOptions));

app.use(
  express.json({
    limit: '200kb',
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '200kb',
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get('/uploads/:filename', serveActiveAtelierUpload);

// ---------------------------------------------------------------------------
// Routes API publiques propres à un atelier
// ---------------------------------------------------------------------------

app.use(
  '/api/demandes-reparation',
  resolveAtelierPublic,
  demandesReparationRouter
);

app.use(
  '/api/rendez-vous',
  resolveAtelierPublic,
  rendezVousRouter
);

app.use(
  '/api/contact',
  resolveAtelierPublic,
  contactRouter
);

app.use(
  '/api/avis',
  resolveAtelierPublic,
  avisRouter
);

app.use(
  '/api/reparations',
  resolveAtelierPublic,
  reparationsRouter
);

// ---------------------------------------------------------------------------
// Santé de l'API : route globale
// ---------------------------------------------------------------------------

app.get('/api/health', (req, res) =>
  res.json({
    success: true,
    message: 'ok',
    data: null,
    errors: [],
  })
);

// ---------------------------------------------------------------------------
// Administration
// ---------------------------------------------------------------------------

app.use('/api/admin', adminRouter);

// ---------------------------------------------------------------------------
// Espace développeur : routes globales
// ---------------------------------------------------------------------------

app.use('/api/gestion/auth', gestionAuthRouter);
app.use('/api/gestion/ateliers', gestionAteliersRouter);

// ---------------------------------------------------------------------------
// Paramètres publics de l'atelier
// ---------------------------------------------------------------------------

app.use(
  '/api/settings',
  resolveAtelierPublic,
  settingsRoutes
);

// ---------------------------------------------------------------------------
// Autres routes publiques
// ---------------------------------------------------------------------------

app.use(
  '/api',
  resolveAtelierPublic,
  contenuRouter
);

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------

app.use((req, res) =>
  fail(res, 'Ressource introuvable.', 404)
);

// ---------------------------------------------------------------------------
// Gestion des erreurs
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (
    err?.message &&
    err.message.includes('non autorisé')
  ) {
    return fail(res, err.message, 400, ['photo']);
  }

  if (
    err?.message === 'Origine CORS non autorisée.'
  ) {
    return fail(res, 'Origine non autorisée.', 403);
  }

  console.error('[Erreur serveur]', err);

  return fail(
    res,
    'Une erreur interne est survenue.',
    500
  );
});

// ---------------------------------------------------------------------------
// Démarrage
// ---------------------------------------------------------------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(
    `API atelier-réparation démarrée sur le port ${PORT}`
  );
});
