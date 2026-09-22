// Fonctions de validation partagées entre les routes.
// La validation frontend (voir frontend/src/utils/validation.js) est une
// aide à l'utilisateur : la sécurité réelle repose sur ces contrôles serveur.

const validator = require('validator');
const sanitizeHtml = require('sanitize-html');

function cleanText(value) {
  if (typeof value !== 'string') return '';
  return sanitizeHtml(value.trim(), { allowedTags: [], allowedAttributes: {} });
}

function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  // Accepte les formats internationaux et locaux béninois (+229 XX XX XX XX ou variantes)
  const cleaned = phone.replace(/[\s.-]/g, '');
  return /^(\+?\d{8,15})$/.test(cleaned);
}

function isValidEmail(email) {
  if (!email) return true; // facultatif
  return validator.isEmail(email);
}

function isFutureDate(dateStr) {
  if (!validator.isISO8601(String(dateStr))) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

// Horaires de l'atelier (section 30) : lun-ven 8h-18h, sam 9h-13h, dim fermé
function isWithinBusinessHours(dateStr, timeStr) {
  if (!/^\d{2}:\d{2}$/.test(String(timeStr))) return false;
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = dimanche
  const [h, m] = timeStr.split(':').map(Number);
  const minutes = h * 60 + m;

  if (day === 0) return false; // dimanche fermé
  if (day === 6) return minutes >= 9 * 60 && minutes <= 13 * 60; // samedi 9h-13h
  return minutes >= 8 * 60 && minutes <= 18 * 60; // lun-ven 8h-18h
}

const DEVICE_TYPES = ['telephone', 'ordinateur', 'tablette', 'autre'];

function validateDemandeReparation(body) {
  const errors = [];
  const data = {
    nom_complet: cleanText(body.nom_complet),
    telephone: cleanText(body.telephone),
    email: body.email ? cleanText(body.email) : null,
    type: cleanText(body.type),
    marque: cleanText(body.marque),
    modele: cleanText(body.modele),
    panne: cleanText(body.panne),
    date_souhaitee: cleanText(body.date_souhaitee),
    heure_souhaitee: cleanText(body.heure_souhaitee),
    confidentialite_acceptee: body.confidentialite_acceptee === true || body.confidentialite_acceptee === 'true',
  };

  if (data.nom_complet.length < 2) errors.push('nom_complet');
  if (!isValidPhone(data.telephone)) errors.push('telephone');
  if (data.email && !isValidEmail(data.email)) errors.push('email');
  if (!DEVICE_TYPES.includes(data.type)) errors.push('type');
  if (!data.marque) errors.push('marque');
  if (!data.modele) errors.push('modele');
  if (!data.panne || data.panne.length > 1000) errors.push('panne');
  if (!isFutureDate(data.date_souhaitee)) errors.push('date_souhaitee');
  if (!isWithinBusinessHours(data.date_souhaitee, data.heure_souhaitee)) errors.push('heure_souhaitee');
  if (!data.confidentialite_acceptee) errors.push('confidentialite_acceptee');

  return { valid: errors.length === 0, errors, data };
}

function validateRendezVous(body) {
  const errors = [];
  const data = {
    nom_complet: cleanText(body.nom_complet),
    telephone: cleanText(body.telephone),
    email: body.email ? cleanText(body.email) : null,
    date_souhaitee: cleanText(body.date_souhaitee),
    heure_souhaitee: cleanText(body.heure_souhaitee),
    motif: cleanText(body.motif || ''),
  };

  if (data.nom_complet.length < 2) errors.push('nom_complet');
  if (!isValidPhone(data.telephone)) errors.push('telephone');
  if (data.email && !isValidEmail(data.email)) errors.push('email');
  if (!isFutureDate(data.date_souhaitee)) errors.push('date_souhaitee');
  if (!isWithinBusinessHours(data.date_souhaitee, data.heure_souhaitee)) errors.push('heure_souhaitee');

  return { valid: errors.length === 0, errors, data };
}

function validateContact(body) {
  const errors = [];
  const data = {
    nom: cleanText(body.nom),
    email: cleanText(body.email || ''),
    telephone: body.telephone ? cleanText(body.telephone) : null,
    sujet: cleanText(body.sujet || ''),
    message: cleanText(body.message),
  };

  if (data.nom.length < 2) errors.push('nom');
  if (!isValidEmail(data.email)) errors.push('email');
  if (!data.message || data.message.length > 2000) errors.push('message');

  return { valid: errors.length === 0, errors, data };
}

function validateAvis(body) {
  const errors = [];
  const data = {
    nom: cleanText(body.nom),
    note: parseInt(body.note, 10),
    commentaire: cleanText(body.commentaire),
  };

  if (data.nom.length < 2) errors.push('nom');
  if (!Number.isInteger(data.note) || data.note < 1 || data.note > 5) errors.push('note');
  if (!data.commentaire || data.commentaire.length > 800) errors.push('commentaire');

  return { valid: errors.length === 0, errors, data };
}

module.exports = {
  cleanText,
  isValidPhone,
  isValidEmail,
  isFutureDate,
  isWithinBusinessHours,
  validateDemandeReparation,
  validateRendezVous,
  validateContact,
  validateAvis,
  DEVICE_TYPES,
};
