import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Info } from 'lucide-react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';
import { api } from '../data/api';
import { validateRendezVous } from '../utils/validation';

const INITIAL_STATE = { nom_complet: '', telephone: '', email: '', date_souhaitee: '', heure_souhaitee: '', motif: '' };

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function RendezVous() {
  const [form, setForm] = useState(INITIAL_STATE);
  const [errors, setErrors] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreurServeur, setErreurServeur] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreurServeur('');
    const validation = validateRendezVous(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setEnvoiEnCours(true);
    try {
      const res = await api.envoyerRendezVous(form);
      if (res.success) {
        setEnvoye(true);
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
      <section className="py-24">
        <div className="container-site mx-auto max-w-lg text-center">
          <ScrollReveal>
            <CheckCircle2 size={56} className="mx-auto text-bleu-technique" aria-hidden="true" />
            <h1 className="mt-6 font-titre text-2xl font-bold text-bleu-nuit sm:text-3xl">Demande de rendez-vous envoyée</h1>
            <p className="mt-3 text-gris-texte">
              L&apos;atelier confirmera ou proposera un autre créneau. Votre rendez-vous n&apos;est pas automatiquement confirmé.
            </p>
            <Link to="/" className="btn-primary mt-8 inline-flex">
              Retour à l&apos;accueil
            </Link>
          </ScrollReveal>
        </div>
      </section>
    );
  }

  return (
    <>
      <Seo title="Prendre rendez-vous" description="Proposez une date et une heure pour votre rendez-vous à l'atelier." />
      <PageHero eyebrow="Rendez-vous" title="Prendre rendez-vous" description="Votre demande sera confirmée par l'atelier." />

      <section className="py-16 sm:py-20">
        <div className="container-site mx-auto max-w-xl">
          <ScrollReveal>
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <Field label="Nom complet" error={errors.nom_complet} htmlFor="nom_complet">
                <input
                  id="nom_complet"
                  className={`input-field ${errors.nom_complet ? 'input-field-error' : ''}`}
                  value={form.nom_complet}
                  onChange={update('nom_complet')}
                  required
                />
              </Field>
              <div className="grid gap-6 sm:grid-cols-2">
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
                <Field label="Email (facultatif)" error={errors.email} htmlFor="email">
                  <input
                    id="email"
                    type="email"
                    className={`input-field ${errors.email ? 'input-field-error' : ''}`}
                    value={form.email}
                    onChange={update('email')}
                  />
                </Field>
              </div>
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
                Lundi à vendredi 8h–18h, samedi 9h–13h. Fermé le dimanche.
              </p>
              <Field label="Motif (facultatif)" htmlFor="motif">
                <textarea id="motif" rows={3} className="input-field" value={form.motif} onChange={update('motif')} />
              </Field>

              {erreurServeur && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
                  {erreurServeur}
                </p>
              )}

              <button type="submit" className="btn-primary w-full sm:w-auto" disabled={envoiEnCours}>
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
