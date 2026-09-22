require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const { fail } = require('./utils/response');
const { UPLOAD_DIR } = require('./middleware/upload');

const demandesReparationRouter = require('./routes/demandesReparation');
const rendezVousRouter = require('./routes/rendezVous');
const contactRouter = require('./routes/contact');
const avisRouter = require('./routes/avis');
const reparationsRouter = require('./routes/reparations');
const contenuRouter = require('./routes/contenu');
const adminRouter = require('./routes/admin');

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 4000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// --- Sécurité de base ------------------------------------------------------
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json({ limit: '200kb' }));
app.use(express.urlencoded({ extended: true, limit: '200kb' }));

// Limite globale, en plus des limites spécifiques par route sensible.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Photos servies en lecture seule, sans exécution possible.
app.use('/uploads', express.static(UPLOAD_DIR, { fallthrough: true, index: false }));

// --- Routes API --------------------------------------------------------
app.use('/api/demandes-reparation', demandesReparationRouter);
app.use('/api/rendez-vous', rendezVousRouter);
app.use('/api/contact', contactRouter);
app.use('/api/avis', avisRouter);
app.use('/api/reparations', reparationsRouter);
app.use('/api', contenuRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => res.json({ success: true, message: 'ok', data: null, errors: [] }));

// --- 404 et gestion d'erreurs ---------------------------------------------
app.use((req, res) => fail(res, 'Ressource introuvable.', 404));

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.message && err.message.includes('non autorisé')) {
    return fail(res, err.message, 400, ['photo']);
  }
  console.error('[Erreur serveur]', err); // eslint-disable-line no-console
  return fail(res, 'Une erreur interne est survenue.', 500);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`API atelier-réparation démarrée sur le port ${PORT}`);
});
