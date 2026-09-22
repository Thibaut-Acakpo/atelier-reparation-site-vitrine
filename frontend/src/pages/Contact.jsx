import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Clock, Navigation, CheckCircle2 } from 'lucide-react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';
import { api } from '../data/api';
import { validateContact, validateAvis } from '../utils/validation';
import { ATELIER, whatsappLink } from '../data/constants';

function ContactForm() {
  const [form, setForm] = useState({ nom: '', email: '', telephone: '', sujet: '', message: '', site_web: '' });
  const [errors, setErrors] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreurServeur, setErreurServeur] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreurServeur('');
    const validation = validateContact(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setEnvoiEnCours(true);
    try {
      const res = await api.envoyerContact(form);
      if (res.success) setEnvoye(true);
      else setErreurServeur(res.message || 'Une erreur est survenue.');
    } catch {
      setErreurServeur('Impossible de contacter le serveur. Réessayez.');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (envoye) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-bleu-nuit/5 animate-fade-up">
        <CheckCircle2 size={44} className="mx-auto text-bleu-technique" aria-hidden="true" />
        <p className="mt-4 font-titre text-lg font-semibold text-bleu-nuit">Message envoyé</p>
        <p className="mt-1 text-sm text-gris-texte">Nous vous répondrons dans les meilleurs délais.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-bleu-nuit/5 sm:p-8">
      {/* Piège anti-spam invisible pour les humains */}
      <input
        type="text"
        name="site_web"
        value={form.site_web}
        onChange={update('site_web')}
        className="sr-only"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom" error={errors.nom} htmlFor="c_nom">
          <input id="c_nom" className={`input-field ${errors.nom ? 'input-field-error' : ''}`} value={form.nom} onChange={update('nom')} required />
        </Field>
        <Field label="Email" error={errors.email} htmlFor="c_email">
          <input id="c_email" type="email" className={`input-field ${errors.email ? 'input-field-error' : ''}`} value={form.email} onChange={update('email')} required />
        </Field>
      </div>
      <Field label="Téléphone (facultatif)" htmlFor="c_tel">
        <input id="c_tel" type="tel" className="input-field" value={form.telephone} onChange={update('telephone')} />
      </Field>
      <Field label="Sujet" htmlFor="c_sujet">
        <input id="c_sujet" className="input-field" value={form.sujet} onChange={update('sujet')} />
      </Field>
      <Field label="Message" error={errors.message} htmlFor="c_message">
        <textarea id="c_message" rows={5} maxLength={2000} className={`input-field ${errors.message ? 'input-field-error' : ''}`} value={form.message} onChange={update('message')} required />
      </Field>

      {erreurServeur && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {erreurServeur}
        </p>
      )}

      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={envoiEnCours}>
        {envoiEnCours ? 'Envoi en cours…' : 'Envoyer le message'}
      </button>
    </form>
  );
}

function AvisForm() {
  const [form, setForm] = useState({ nom: '', note: 5, commentaire: '', site_web: '' });
  const [errors, setErrors] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);
  const [erreurServeur, setErreurServeur] = useState('');

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreurServeur('');
    const data = { ...form, note: Number(form.note) };
    const validation = validateAvis(data);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setEnvoiEnCours(true);
    try {
      const res = await api.envoyerAvis(data);
      if (res.success) setEnvoye(true);
      else setErreurServeur(res.message || 'Une erreur est survenue.');
    } catch {
      setErreurServeur('Impossible de contacter le serveur. Réessayez.');
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (envoye) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-bleu-nuit/5 animate-fade-up">
        <CheckCircle2 size={44} className="mx-auto text-bleu-technique" aria-hidden="true" />
        <p className="mt-4 font-titre text-lg font-semibold text-bleu-nuit">Merci pour votre avis</p>
        <p className="mt-1 text-sm text-gris-texte">Il sera publié après validation par l&apos;atelier.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-bleu-nuit/5 sm:p-8">
      <input type="text" name="site_web" value={form.site_web} onChange={update('site_web')} className="sr-only" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <Field label="Nom" error={errors.nom} htmlFor="a_nom">
        <input id="a_nom" className={`input-field ${errors.nom ? 'input-field-error' : ''}`} value={form.nom} onChange={update('nom')} required />
      </Field>
      <Field label="Note" error={errors.note} htmlFor="a_note">
        <select id="a_note" className="input-field" value={form.note} onChange={update('note')}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </Field>
      <Field label="Votre avis" error={errors.commentaire} htmlFor="a_commentaire">
        <textarea id="a_commentaire" rows={4} maxLength={800} className={`input-field ${errors.commentaire ? 'input-field-error' : ''}`} value={form.commentaire} onChange={update('commentaire')} required />
      </Field>

      {erreurServeur && (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
          {erreurServeur}
        </p>
      )}

      <button type="submit" className="btn-secondary w-full sm:w-auto" disabled={envoiEnCours}>
        {envoiEnCours ? 'Envoi en cours…' : 'Envoyer mon avis'}
      </button>
    </form>
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

export default function Contact() {
  return (
    <>
      <Seo title="Contact" description="Adresse, téléphone, WhatsApp, email et horaires de l'atelier. Formulaire de contact." />
      <PageHero eyebrow="Contact" title="Parlons de votre appareil" />

      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <ScrollReveal className="space-y-8">
            <div className="aspect-video overflow-hidden rounded-2xl ring-1 ring-bleu-nuit/5">
              <iframe
                title="Localisation de l'atelier"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(ATELIER.mapsQuery)}&output=embed`}
              />
            </div>
            <ul className="space-y-4 text-gris-texte">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 shrink-0 text-bleu-technique" aria-hidden="true" />
                {ATELIER.adresse}
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="shrink-0 text-bleu-technique" aria-hidden="true" />
                <a href={`tel:${ATELIER.telephone.replace(/\s/g, '')}`} className="hover:text-bleu-technique">
                  {ATELIER.telephone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={20} className="shrink-0 text-bleu-technique" aria-hidden="true" />
                <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:text-bleu-technique">
                  Discuter sur WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="shrink-0 text-bleu-technique" aria-hidden="true" />
                <a href={`mailto:${ATELIER.email}`} className="hover:text-bleu-technique">
                  {ATELIER.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-bleu-technique" aria-hidden="true" />
                <span>
                  {ATELIER.horaires.map((h) => (
                    <span key={h.jours} className="block">
                      {h.jours} : {h.heures}
                    </span>
                  ))}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Navigation size={20} className="shrink-0 text-bleu-technique" aria-hidden="true" />
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ATELIER.mapsQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-bleu-technique"
                >
                  Obtenir l&apos;itinéraire
                </a>
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={150}>
            <ContactForm />
          </ScrollReveal>
        </div>
      </section>

      <section className="bg-gris-clair py-16 sm:py-20">
        <div className="container-site mx-auto max-w-xl">
          <ScrollReveal>
            <h2 className="section-title text-center">Laisser un avis</h2>
            <p className="mt-2 text-center text-gris-texte">Votre avis sera publié après validation.</p>
          </ScrollReveal>
          <ScrollReveal delay={100} className="mt-8">
            <AvisForm />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
