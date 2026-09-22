const express = require('express');
const rateLimit = require('express-rate-limit');
const db = require('../db');
const { ok, fail } = require('../utils/response');
const { validateDemandeReparation } = require('../utils/validation');
const { upload, verifyUploadedImage } = require('../middleware/upload');

const router = express.Router();

// Limite les tentatives d'envoi de demandes depuis une même IP (anti-spam).
const demandeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Trop de demandes envoyées. Réessayez plus tard.', data: null, errors: [] },
});

// POST /api/demandes-reparation
router.post('/', demandeLimiter, upload.single('photo'), verifyUploadedImage, (req, res, next) => {
  try {
    const { valid, errors, data } = validateDemandeReparation(req.body);
    if (!valid) {
      return fail(res, 'Certains champs sont invalides ou manquants.', 422, errors);
    }

    const insertClient = db.prepare(
      `INSERT INTO clients (nom_complet, telephone, email) VALUES (?, ?, ?)`
    );
    const clientResult = insertClient.run(data.nom_complet, data.telephone, data.email);

    const insertAppareil = db.prepare(
      `INSERT INTO appareils (client_id, type, marque, modele) VALUES (?, ?, ?, ?)`
    );
    const appareilResult = insertAppareil.run(clientResult.lastInsertRowid, data.type, data.marque, data.modele);

    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const insertDemande = db.prepare(`
      INSERT INTO demandes_reparation
        (client_id, appareil_id, panne, photo_path, date_souhaitee, heure_souhaitee, confidentialite_acceptee)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `);
    const demandeResult = insertDemande.run(
      clientResult.lastInsertRowid,
      appareilResult.lastInsertRowid,
      data.panne,
      photoPath,
      data.date_souhaitee,
      data.heure_souhaitee
    );

    // Trace une notification à envoyer (voir section 13) — l'envoi réel via
    // EmailJS est déclenché côté frontend ou par un job séparé.
    db.prepare(
      `INSERT INTO notifications (type, destinataire, contenu_resume, statut) VALUES (?, ?, ?, 'a_envoyer')`
    ).run('confirmation_demande', data.email || data.telephone, `Demande #${demandeResult.lastInsertRowid} reçue`);

    return ok(res, { id: demandeResult.lastInsertRowid }, 'Votre demande a bien été enregistrée. Nous vous recontacterons rapidement.', 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
