import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, UploadCloud, Info } from 'lucide-react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';
import { api } from '../data/api';
import { validateDemandeReparation } from '../utils/validation';

const TYPES_APPAREIL = [
  { value: 'telephone', label: 'Téléphone' },
  { value: 'ordinateur', label: 'Ordinateur' },
  { value: 'tablette', label: 'Tablette' },
  { value: 'autre', label: 'Autre' },
];

const INITIAL_STATE = {
  nom_complet: '',
  telephone: '',
  email: '',
  type: '',
  marque: '',
  modele: '',
  panne: '',
  date_souhaitee: '',
  heure_souhaitee: '',
  confidentialite_acceptee: false,
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DemandeReparation() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [photo, setPhoto] = useState(null);
  const [errors, setErrors] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreurServeur, setErreurServeur] = useState('');

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return setPhoto(null);
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      setErrors((er) => ({ ...er, photo: 'Formats acceptés : JPG, PNG, WebP.' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((er) => ({ ...er, photo: 'Taille maximale : 5 Mo.' }));
      return;
    }
    setErrors((er) => ({ ...er, photo: undefined }));
    setPhoto(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreurServeur('');
    const validation = validateDemandeReparation(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setEnvoiEnCours(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([key, value]) => fd.append(key, value));
      if (photo) fd.append('photo', photo);

      const res = await api.envoyerDemandeReparation(fd);
      if (res.success) {
        setEnvoye(true);
      } else if (res.errors?.length) {
        const fieldErrors = {};
        res.errors.forEach((f) => {
          fieldErrors[f] = 'Champ invalide, merci de vérifier.';
        });
        setErrors(fieldErrors);
        setErreurServeur(res.message);
      } else {
        setErreurServeur(res.message || 'Une erreur est survenue.');
      }
    } catch {
      setErreurServeur('Impossible de contacter le serveur. Réessayez.');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (envoye) {
    return (
      <>
        <Seo title="Demande envoyée" />
        <section className="py-24">
          <div className="container-site mx-auto max-w-lg text-center">
            <ScrollReveal>
              <CheckCircle2 size={56} className="mx-auto text-bleu-technique" aria-hidden="true" />
              <h1 className="mt-6 font-titre text-2xl font-bold text-bleu-nuit sm:text-3xl">Demande envoyée avec succès</h1>
              <p className="mt-3 text-gris-texte">
                Nous avons bien reçu votre demande. L&apos;atelier vous recontactera pour confirmer le rendez-vous.
                Aucun prix n&apos;est estimé en ligne : le diagnostic est gratuit et réalisé à l&apos;atelier.
              </p>
              <Link to="/" className="btn-primary mt-8 inline-flex">
                Retour à l&apos;accueil
              </Link>
            </ScrollReveal>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Seo title="Déposer mon appareil" description="Décrivez votre panne et proposez une date de dépôt, avant de vous déplacer à l'atelier." />
      <PageHero
        eyebrow="Demande de réparation"
        title="Déposer mon appareil"
        description="Diagnostic gratuit à l'atelier. Aucun prix n'est estimé en ligne."
      />

      <section className="py-16 sm:py-20">
        <div className="container-site mx-auto max-w-2xl">
          <ScrollReveal>
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Nom complet" error={errors.nom_complet} htmlFor="nom_complet">
                  <input
                    id="nom_complet"
                    className={`input-field ${errors.nom_complet ? 'input-field-error' : ''}`}
                    value={form.nom_complet}
                    onChange={update('nom_complet')}
                    required
                  />
                </Field>
                <Field label="Téléphone" error={errors.telephone} htmlFor="telephone">
                  <input
                    id="telephone"
                    type="tel"
                    className={`input-field ${errors.telephone ? 'input-field-error' : ''}`}
                    value={form.telephone}
                    onChange={update('telephone')}
                    placeholder="+229 90 12 34 56"
                    required
                  />
                </Field>
              </div>

              <Field label="Email (facultatif)" error={errors.email} htmlFor="email">
                <input
                  id="email"
                  type="email"
                  className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                  value={form.email}
                  onChange={update('email')}
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-3">
                <Field label="Type d'appareil" error={errors.type} htmlFor="type">
                  <select
                    id="type"
                    className={`input-field ${errors.type ? 'input-field-error' : ''}`}
                    value={form.type}
                    onChange={update('type')}
                    required
                  >
                    <option value="">Choisir…</option>
                    {TYPES_APPAREIL.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Marque" error={errors.marque} htmlFor="marque">
                  <input
                    id="marque"
                    className={`input-field ${errors.marque ? 'input-field-error' : ''}`}
                    value={form.marque}
                    onChange={update('marque')}
                    required
                  />
                </Field>
                <Field label="Modèle" error={errors.modele} htmlFor="modele">
                  <input
                    id="modele"
                    className={`input-field ${errors.modele ? 'input-field-error' : ''}`}
                    value={form.modele}
                    onChange={update('modele')}
                    required
                  />
                </Field>
              </div>

              <Field label="Description de la panne" error={errors.panne} htmlFor="panne">
                <textarea
                  id="panne"
                  rows={4}
                  maxLength={1000}
                  className={`input-field ${errors.panne ? 'input-field-error' : ''}`}
                  value={form.panne}
                  onChange={update('panne')}
                  required
                />
                <p className="mt-1 text-xs text-gray-400">{form.panne.length}/1000</p>
              </Field>

              <Field label="Photo de l'appareil ou de la panne (facultatif)" error={errors.photo} htmlFor="photo">
                <label
                  htmlFor="photo"
                  className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gris-texte hover:border-bleu-technique hover:text-bleu-technique"
                >
                  <UploadCloud size={20} aria-hidden="true" />
                  {photo ? photo.name : 'JPG, PNG ou WebP — 5 Mo maximum'}
                </label>
                <input id="photo" type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhoto} className="sr-only" />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Date souhaitée" error={errors.date_souhaitee} htmlFor="date_souhaitee">
                  <input
                    id="date_souhaitee"
                    type="date"
                    min={todayISO()}
                    className={`input-field ${errors.date_souhaitee ? 'input-field-error' : ''}`}
                    value={form.date_souhaitee}
                    onChange={update('date_souhaitee')}
                    required
                  />
                </Field>
                <Field label="Heure souhaitée" error={errors.heure_souhaitee} htmlFor="heure_souhaitee">
                  <input
                    id="heure_souhaitee"
                    type="time"
                    className={`input-field ${errors.heure_souhaitee ? 'input-field-error' : ''}`}
                    value={form.heure_souhaitee}
                    onChange={update('heure_souhaitee')}
                    required
                  />
                </Field>
              </div>
              <p className="-mt-3 flex items-start gap-2 text-xs text-gris-texte">
                <Info size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                Lundi à vendredi 8h–18h, samedi 9h–13h. Fermé le dimanche. La date n&apos;est pas automatiquement confirmée.
              </p>

              <label className="flex items-start gap-3 text-sm text-gris-texte">
                <input
                  type="checkbox"
                  checked={form.confidentialite_acceptee}
                  onChange={update('confidentialite_acceptee')}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-bleu-technique focus:ring-bleu-technique"
                  required
                />
                <span>
                  J&apos;accepte la{' '}
                  <Link to="/confidentialite" className="text-bleu-technique underline hover:text-bleu-nuit">
                    politique de confidentialité
                  </Link>
                  .
                </span>
              </label>
              {errors.confidentialite_acceptee && <p className="field-error-text -mt-4">{errors.confidentialite_acceptee}</p>}

              {erreurServeur && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {erreurServeur}
                </p>
              )}

              <button
                type="submit"
                className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto"
                disabled={envoiEnCours || !form.confidentialite_acceptee}
              >
                {envoiEnCours ? 'Envoi en cours…' : 'Envoyer la demande'}
              </button>
            </form>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}

function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-bleu-nuit">
        {label}
      </label>
      {children}
      {error && <p className="field-error-text">{error}</p>}
    </div>
  );
}
