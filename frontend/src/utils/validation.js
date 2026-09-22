// Validation côté client : aide l'utilisateur à corriger ses erreurs avant
// l'envoi. La validation qui fait foi reste celle du serveur.

export function isValidPhone(phone) {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s.-]/g, '');
  return /^(\+?\d{8,15})$/.test(cleaned);
}

export function isValidEmail(email) {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isFutureDate(dateStr) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

// Horaires : lun-ven 8h-18h, sam 9h-13h, dim fermé.
export function isWithinBusinessHours(dateStr, timeStr) {
  if (!dateStr || !timeStr) return false;
  const date = new Date(dateStr);
  const day = date.getDay();
  const [h, m] = timeStr.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return false;
  const minutes = h * 60 + m;

  if (day === 0) return false;
  if (day === 6) return minutes >= 9 * 60 && minutes <= 13 * 60;
  return minutes >= 8 * 60 && minutes <= 18 * 60;
}

export function validateDemandeReparation(data) {
  const errors = {};
  if (!data.nom_complet || data.nom_complet.trim().length < 2) errors.nom_complet = 'Indiquez votre nom complet (2 caractères minimum).';
  if (!isValidPhone(data.telephone)) errors.telephone = 'Numéro de téléphone invalide.';
  if (data.email && !isValidEmail(data.email)) errors.email = 'Adresse email invalide.';
  if (!data.type) errors.type = "Choisissez le type d'appareil.";
  if (!data.marque || !data.marque.trim()) errors.marque = 'Indiquez la marque.';
  if (!data.modele || !data.modele.trim()) errors.modele = 'Indiquez le modèle.';
  if (!data.panne || !data.panne.trim()) errors.panne = 'Décrivez la panne.';
  else if (data.panne.length > 1000) errors.panne = 'Description trop longue (1000 caractères maximum).';
  if (!isFutureDate(data.date_souhaitee)) errors.date_souhaitee = 'Choisissez une date à venir.';
  if (!isWithinBusinessHours(data.date_souhaitee, data.heure_souhaitee))
    errors.heure_souhaitee = "Choisissez une heure dans les horaires de l'atelier (fermé le dimanche).";
  if (!data.confidentialite_acceptee) errors.confidentialite_acceptee = 'Vous devez accepter la politique de confidentialité.';
  return errors;
}

export function validateRendezVous(data) {
  const errors = {};
  if (!data.nom_complet || data.nom_complet.trim().length < 2) errors.nom_complet = 'Indiquez votre nom complet.';
  if (!isValidPhone(data.telephone)) errors.telephone = 'Numéro de téléphone invalide.';
  if (data.email && !isValidEmail(data.email)) errors.email = 'Adresse email invalide.';
  if (!isFutureDate(data.date_souhaitee)) errors.date_souhaitee = 'Choisissez une date à venir.';
  if (!isWithinBusinessHours(data.date_souhaitee, data.heure_souhaitee))
    errors.heure_souhaitee = "Choisissez une heure dans les horaires de l'atelier (fermé le dimanche).";
  return errors;
}

export function validateContact(data) {
  const errors = {};
  if (!data.nom || data.nom.trim().length < 2) errors.nom = 'Indiquez votre nom.';
  if (!isValidEmail(data.email) || !data.email) errors.email = 'Adresse email invalide.';
  if (!data.message || !data.message.trim()) errors.message = 'Votre message ne peut pas être vide.';
  else if (data.message.length > 2000) errors.message = 'Message trop long (2000 caractères maximum).';
  return errors;
}

export function validateAvis(data) {
  const errors = {};
  if (!data.nom || data.nom.trim().length < 2) errors.nom = 'Indiquez votre nom.';
  if (!data.note || data.note < 1 || data.note > 5) errors.note = 'Choisissez une note entre 1 et 5.';
  if (!data.commentaire || !data.commentaire.trim()) errors.commentaire = 'Votre commentaire ne peut pas être vide.';
  else if (data.commentaire.length > 800) errors.commentaire = 'Commentaire trop long (800 caractères maximum).';
  return errors;
}
