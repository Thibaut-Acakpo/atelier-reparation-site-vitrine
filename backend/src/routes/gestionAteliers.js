// Espace développeur : gestion des ateliers (= vos clients).
// Toutes les routes exigent un jeton développeur.

const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db-postgres');
const { requireDeveloperAuth } = require('../middleware/developerAuth');
const { ok, fail } = require('../utils/response');
const { cleanText, isValidEmail } = require('../utils/validation');
const { SETTINGS_AUTORISES } = require('../data/contenuParDefaut');
const {
  creerAtelierComplet,
  genererMotDePasse,
} = require('../services/provisionAtelier');

const contenuRouter = require('./admin/contenu');
const realisationsRouter = require('./admin/realisations');

const router = express.Router();
router.use(requireDeveloperAuth);

const COLONNES_ATELIER =
  'id, nom, slug, domaine, logo_url, actif, created_at, updated_at';

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function nettoyerSlug(valeur) {
  return String(valeur || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

function nettoyerDomaine(valeur) {
  return cleanText(valeur || '')
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
}

const DOMAINE_VALIDE = /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/;

function idValide(valeur) {
  const n = Number(valeur);
  return Number.isInteger(n) && n > 0 ? n : null;
}

// Vérifie que :id existe ; place l'atelier dans req.atelierGestion.
async function chargerAtelier(req, res, next) {
  try {
    const id = idValide(req.params.id);
    if (!id) return fail(res, 'Atelier introuvable.', 404);

    const r = await db.query(
      `SELECT ${COLONNES_ATELIER} FROM ateliers WHERE id = $1`,
      [id]
    );
    if (r.rowCount === 0) return fail(res, 'Atelier introuvable.', 404);

    req.atelierGestion = r.rows[0];
    return next();
  } catch (err) {
    return next(err);
  }
}

async function lireSettings(atelierId) {
  const r = await db.query(
    `SELECT cle, valeur FROM settings WHERE atelier_id = $1 ORDER BY cle ASC`,
    [atelierId]
  );
  const settings = {};
  for (const row of r.rows) settings[row.cle] = row.valeur;
  if (settings.horaires) {
    try {
      settings.horaires = JSON.parse(settings.horaires);
    } catch {
      // conservé tel quel
    }
  }
  return settings;
}

function erreurUnicite(err, res) {
  if (err.code !== '23505') return false;
  const detail = String(err.detail || err.constraint || '');
  let message = 'Cette valeur est déjà utilisée.';
  if (detail.includes('slug')) message = 'Ce lien (slug) est déjà utilisé par un autre atelier.';
  else if (detail.includes('domaine')) message = 'Ce domaine est déjà associé à un autre atelier.';
  else if (detail.includes('email')) message = 'Cette adresse e-mail est déjà utilisée par un autre compte.';
  fail(res, message, 409);
  return true;
}

// --------------------------------------------------------------------------
// GET /api/gestion/ateliers — liste + indicateurs
// --------------------------------------------------------------------------

router.get('/', async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        a.id, a.nom, a.slug, a.domaine, a.logo_url, a.actif,
        a.created_at, a.updated_at,
        (SELECT COUNT(*)::int FROM demandes_reparation d
          WHERE d.atelier_id = a.id AND d.statut_traitement = 'nouvelle') AS demandes_nouvelles,
        (SELECT COUNT(*)::int FROM reparations r WHERE r.atelier_id = a.id) AS reparations,
        (SELECT COUNT(*)::int FROM rendez_vous v
          WHERE v.atelier_id = a.id AND v.statut = 'en_attente') AS rendez_vous_en_attente,
        (SELECT COUNT(*)::int FROM avis av
          WHERE av.atelier_id = a.id AND av.statut = 'en_attente') AS avis_en_attente,
        (SELECT COUNT(*)::int FROM contacts c
          WHERE c.atelier_id = a.id AND c.traite = 0) AS messages_non_traites,
        (SELECT MAX(ad.derniere_connexion) FROM admins ad
          WHERE ad.atelier_id = a.id) AS derniere_connexion_admin
      FROM ateliers a
      ORDER BY a.id ASC
    `);

    // Complétude : coordonnées indispensables au bon fonctionnement du site.
    const cles = ['telephone', 'whatsapp', 'email', 'adresse'];
    const s = await db.query(
      `SELECT atelier_id, cle, valeur FROM settings WHERE cle = ANY($1)`,
      [cles]
    );
    const parAtelier = new Map();
    for (const row of s.rows) {
      if (!parAtelier.has(row.atelier_id)) parAtelier.set(row.atelier_id, {});
      parAtelier.get(row.atelier_id)[row.cle] = (row.valeur || '').trim();
    }

    const rows = result.rows.map((a) => {
      const vals = parAtelier.get(a.id) || {};
      const manquants = cles.filter((c) => !vals[c]);
      if (!a.logo_url) manquants.push('logo');
      return { ...a, a_completer: manquants };
    });

    return ok(res, rows);
  } catch (err) {
    return next(err);
  }
});

// --------------------------------------------------------------------------
// POST /api/gestion/ateliers — créer un nouveau client (site + gestion)
// --------------------------------------------------------------------------

router.post('/', async (req, res, next) => {
  const client = await db.connect();

  try {
    const nom = cleanText(req.body.nom || '');
    const slug = nettoyerSlug(req.body.slug || nom);
    const domaine = nettoyerDomaine(req.body.domaine || '');
    const logoUrl = cleanText(req.body.logo_url || '');
    const adminEmail = cleanText(req.body.admin_email || '').toLowerCase();
    const adminMdp = String(req.body.admin_mot_de_passe || '');
    const avecAssistant = req.body.avec_assistant === true;
    const assistantEmail = cleanText(req.body.assistant_email || '').toLowerCase();
    const modeleId = req.body.modele_id ? idValide(req.body.modele_id) : null;

    const erreurs = [];
    if (!nom) erreurs.push('nom');
    if (!slug) erreurs.push('slug');
    if (domaine && !DOMAINE_VALIDE.test(domaine)) erreurs.push('domaine');
    if (!adminEmail || !isValidEmail(adminEmail)) erreurs.push('admin_email');
    if (adminMdp && adminMdp.length < 8) erreurs.push('admin_mot_de_passe');
    if (avecAssistant && (!assistantEmail || !isValidEmail(assistantEmail))) erreurs.push('assistant_email');
    if (avecAssistant && assistantEmail === adminEmail) erreurs.push('assistant_email');

    if (erreurs.length) {
      return fail(
        res,
        'Certains champs sont invalides ou manquants (nom, e-mail du gérant valide, mot de passe de 8 caractères minimum, domaine au format exemple.com).',
        422,
        erreurs
      );
    }

    if (modeleId) {
      const m = await db.query('SELECT 1 FROM ateliers WHERE id = $1', [modeleId]);
      if (m.rowCount === 0) return fail(res, 'Le site modèle choisi est introuvable.', 422, ['modele_id']);
    }

    await client.query('BEGIN');

    const { atelier, comptes } = await creerAtelierComplet(client, {
      nom, slug, domaine, logo_url: logoUrl,
      modeleId, adminEmail, adminMotDePasse: adminMdp,
      avecAssistant, assistantEmail,
    });

    await client.query('COMMIT');

    return ok(
      res,
      { atelier, comptes },
      'Le nouveau client a été créé. Notez les identifiants : le mot de passe ne sera plus affiché.',
      201
    );
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    if (erreurUnicite(err, res)) return undefined;
    return next(err);
  } finally {
    client.release();
  }
});

// --------------------------------------------------------------------------
// GET / PATCH / DELETE /api/gestion/ateliers/:id
// --------------------------------------------------------------------------

router.get('/:id', chargerAtelier, (req, res) => ok(res, req.atelierGestion));

router.patch('/:id', chargerAtelier, async (req, res, next) => {
  try {
    const actuel = req.atelierGestion;
    const b = req.body;

    const nom = b.nom !== undefined ? cleanText(b.nom) : actuel.nom;
    const slug = b.slug !== undefined ? nettoyerSlug(b.slug) : actuel.slug;
    const domaine = b.domaine !== undefined ? nettoyerDomaine(b.domaine) : actuel.domaine || '';
    const logoUrl = b.logo_url !== undefined ? cleanText(b.logo_url) : actuel.logo_url || '';

    if (!nom) return fail(res, 'Le nom de l’atelier est obligatoire.', 422, ['nom']);
    if (!slug) return fail(res, 'Le lien (slug) de l’atelier est obligatoire.', 422, ['slug']);
    if (domaine && !DOMAINE_VALIDE.test(domaine)) {
      return fail(res, 'Le domaine doit ressembler à « monatelier.com ».', 422, ['domaine']);
    }

    const result = await db.query(
      `UPDATE ateliers
       SET nom = $1, slug = $2, domaine = $3, logo_url = $4, updated_at = NOW()
       WHERE id = $5
       RETURNING ${COLONNES_ATELIER}`,
      [nom, slug, domaine || null, logoUrl || null, actuel.id]
    );

    return ok(res, result.rows[0], 'Atelier mis à jour avec succès.');
  } catch (err) {
    if (erreurUnicite(err, res)) return undefined;
    return next(err);
  }
});

router.patch('/:id/statut', chargerAtelier, async (req, res, next) => {
  try {
    const actif = req.body.actif === true || req.body.actif === 1 || req.body.actif === '1';
    const result = await db.query(
      `UPDATE ateliers SET actif = $1, updated_at = NOW() WHERE id = $2
       RETURNING ${COLONNES_ATELIER}`,
      [actif ? 1 : 0, req.atelierGestion.id]
    );
    return ok(res, result.rows[0], actif ? 'Site activé.' : 'Site désactivé : il n’est plus accessible.');
  } catch (err) {
    return next(err);
  }
});

// Suppression définitive : atelier désactivé + confirmation par le slug.
router.delete('/:id', chargerAtelier, async (req, res, next) => {
  const client = await db.connect();
  try {
    const atelier = req.atelierGestion;

    if (atelier.actif) {
      return fail(res, 'Désactivez d’abord le site avant de le supprimer.', 409);
    }
    if (String(req.body?.confirmation || '') !== atelier.slug) {
      return fail(res, 'Saisissez le lien (slug) exact du site pour confirmer la suppression.', 422, ['confirmation']);
    }

    const id = atelier.id;
    await client.query('BEGIN');

    // Ordre explicite : fonctionne même si les clés étrangères en cascade
    // n'existent pas sur une ancienne base.
    const etapes = [
      `DELETE FROM historique_reparation WHERE reparation_id IN (SELECT id FROM reparations WHERE atelier_id = $1)`,
      `DELETE FROM reparation_pieces WHERE reparation_id IN (SELECT id FROM reparations WHERE atelier_id = $1)`,
      `DELETE FROM reparations WHERE atelier_id = $1`,
      `DELETE FROM demandes_reparation WHERE atelier_id = $1`,
      `DELETE FROM rendez_vous WHERE atelier_id = $1`,
      `DELETE FROM appareils WHERE atelier_id = $1`,
      `DELETE FROM clients WHERE atelier_id = $1`,
      `DELETE FROM pieces WHERE atelier_id = $1`,
      `DELETE FROM avis WHERE atelier_id = $1`,
      `DELETE FROM contacts WHERE atelier_id = $1`,
      `DELETE FROM realisations WHERE atelier_id = $1`,
      `DELETE FROM services WHERE atelier_id = $1`,
      `DELETE FROM categories_appareils WHERE atelier_id = $1`,
      `DELETE FROM faq WHERE atelier_id = $1`,
      `DELETE FROM notifications WHERE atelier_id = $1`,
      `DELETE FROM settings WHERE atelier_id = $1`,
      `DELETE FROM admins WHERE atelier_id = $1`,
      `DELETE FROM ateliers WHERE id = $1`,
    ];
    for (const sql of etapes) await client.query(sql, [id]);

    await client.query('COMMIT');
    return ok(res, null, 'Atelier supprimé définitivement.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    return next(err);
  } finally {
    client.release();
  }
});

// --------------------------------------------------------------------------
// Paramètres (identité, contact, apparence, SEO, réseaux sociaux)
// --------------------------------------------------------------------------

router.get('/:id/settings', chargerAtelier, async (req, res, next) => {
  try {
    return ok(res, await lireSettings(req.atelierGestion.id), 'Paramètres récupérés.');
  } catch (err) {
    return next(err);
  }
});

router.put('/:id/settings', chargerAtelier, async (req, res, next) => {
  const client = await db.connect();
  try {
    const atelierId = req.atelierGestion.id;
    await client.query('BEGIN');

    for (const cle of SETTINGS_AUTORISES) {
      if (req.body[cle] === undefined) continue;

      let valeur = req.body[cle];
      if (cle === 'horaires' && Array.isArray(valeur)) {
        valeur = JSON.stringify(
          valeur.map((h) => ({
            jours: cleanText(String(h?.jours ?? '')),
            heures: cleanText(String(h?.heures ?? '')),
          }))
        );
      } else {
        valeur = valeur === null ? '' : cleanText(String(valeur));
      }

      await client.query(
        `INSERT INTO settings (atelier_id, cle, valeur) VALUES ($1, $2, $3)
         ON CONFLICT (atelier_id, cle) DO UPDATE SET valeur = EXCLUDED.valeur`,
        [atelierId, cle, valeur]
      );
    }

    await client.query('COMMIT');
    return ok(res, await lireSettings(atelierId), 'Paramètres enregistrés avec succès.');
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    return next(err);
  } finally {
    client.release();
  }
});

// --------------------------------------------------------------------------
// Comptes de l'espace admin du client
// --------------------------------------------------------------------------

router.get('/:id/comptes', chargerAtelier, async (req, res, next) => {
  try {
    const r = await db.query(
      `SELECT id, nom, email, role, actif, derniere_connexion, created_at
       FROM admins WHERE atelier_id = $1 ORDER BY role ASC`,
      [req.atelierGestion.id]
    );
    return ok(res, r.rows);
  } catch (err) {
    return next(err);
  }
});

// Réinitialise le mot de passe (généré, affiché une seule fois) et/ou l'e-mail.
router.post('/:id/comptes/:role/reinitialiser', chargerAtelier, async (req, res, next) => {
  try {
    const role = req.params.role;
    if (!['technicien', 'assistant'].includes(role)) {
      return fail(res, 'Rôle inconnu.', 404);
    }

    const existant = await db.query(
      `SELECT id, email FROM admins WHERE atelier_id = $1 AND role = $2`,
      [req.atelierGestion.id, role]
    );

    const email = cleanText(req.body.email || '').toLowerCase();
    if (email && !isValidEmail(email)) {
      return fail(res, 'Adresse e-mail invalide.', 422, ['email']);
    }

    const motDePasse = String(req.body.mot_de_passe || '') || genererMotDePasse();
    if (motDePasse.length < 8) {
      return fail(res, 'Le mot de passe doit contenir au moins 8 caractères.', 422, ['mot_de_passe']);
    }
    const hash = await bcrypt.hash(motDePasse, 10);

    if (existant.rowCount === 0) {
      if (!email) {
        return fail(res, 'Ce compte n’existe pas encore : indiquez son adresse e-mail.', 422, ['email']);
      }
      await db.query(
        `INSERT INTO admins (atelier_id, nom, email, mot_de_passe_hash, role, actif)
         VALUES ($1, $2, $3, $4, $5, 1)`,
        [req.atelierGestion.id, role === 'assistant' ? 'Assistant technicien' : 'Technicien', email, hash, role]
      );
    } else {
      await db.query(
        `UPDATE admins SET mot_de_passe_hash = $1, email = $2, actif = 1 WHERE id = $3`,
        [hash, email || existant.rows[0].email, existant.rows[0].id]
      );
    }

    return ok(
      res,
      { role, email: email || existant.rows[0]?.email, mot_de_passe: motDePasse },
      'Mot de passe défini. Notez-le : il ne sera plus affiché.'
    );
  } catch (err) {
    if (erreurUnicite(err, res)) return undefined;
    return next(err);
  }
});

router.patch('/:id/comptes/:role', chargerAtelier, async (req, res, next) => {
  try {
    const actif = req.body.actif === true || req.body.actif === 1;
    const r = await db.query(
      `UPDATE admins SET actif = $1 WHERE atelier_id = $2 AND role = $3 RETURNING id`,
      [actif ? 1 : 0, req.atelierGestion.id, req.params.role]
    );
    if (r.rowCount === 0) return fail(res, 'Compte introuvable.', 404);
    return ok(res, null, actif ? 'Compte activé.' : 'Compte désactivé.');
  } catch (err) {
    return next(err);
  }
});

// --------------------------------------------------------------------------
// Contenu (services, appareils, FAQ) et réalisations d'un atelier :
// on réutilise les routes de l'espace admin en se plaçant "comme" le gérant.
// --------------------------------------------------------------------------

function agirCommeGerant(req, res, next) {
  req.admin = {
    id: null,
    role: 'technicien',
    atelier_id: req.atelierGestion.id,
  };
  next();
}

router.use('/:id/contenu', chargerAtelier, agirCommeGerant, contenuRouter);
router.use('/:id/realisations', chargerAtelier, agirCommeGerant, realisationsRouter);

module.exports = router;
