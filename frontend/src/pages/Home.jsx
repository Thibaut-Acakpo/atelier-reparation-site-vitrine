import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  CircleHelp,
  ClipboardCheck,
  Clock,
  EyeOff,
  FileText,
  MapPin,
  PackageCheck,
  Phone,
  Radar,
  Search,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import Seo from '../components/Seo';
import ScrollReveal from '../components/ScrollReveal';
import DynamicIcon from '../components/DynamicIcon';
import ReviewCard from '../components/ReviewCard';
import FaqAccordion from '../components/FaqAccordion';
import HeroVisual from '../components/HeroVisual';
import { api } from '../data/api';
import { useAtelier } from '../context/AtelierContext';

/* ------------------------------------------------------------------ *
 * Textes de la page. Aucun chiffre, aucun témoignage inventé : tout ce
 * qui est affiché comme « preuve » vient de l'atelier (avis validés,
 * réalisations) ou reprend des engagements déjà présents sur le site.
 * ------------------------------------------------------------------ */

const TRUST = [
  { icone: ShieldCheck, texte: 'Diagnostic gratuit' },
  { icone: FileText, texte: 'Devis avant toute intervention' },
  { icone: Radar, texte: 'Suivi en ligne' },
];

const PROBLEMES = [
  {
    icone: CircleHelp,
    titre: 'Combien ça va coûter ?',
    texte: 'Vous laissez votre appareil sans savoir quelle facture vous attend.',
  },
  {
    icone: EyeOff,
    titre: 'Aucune nouvelle',
    texte: 'Pas de visibilité sur l’avancement : il faut appeler ou revenir pour savoir.',
  },
  {
    icone: Clock,
    titre: 'Du temps perdu',
    texte: 'Déplacements inutiles, attente sans fin, appareil indisponible trop longtemps.',
  },
];

const BENEFICES = [
  {
    icone: ShieldCheck,
    titre: 'Diagnostic gratuit',
    texte: 'Nous identifions la panne avant de vous demander quoi que ce soit.',
  },
  {
    icone: FileText,
    titre: 'Devis clair, validé par vous',
    texte: 'Nous n’intervenons qu’après votre accord sur le devis.',
  },
  {
    icone: Radar,
    titre: 'Suivi en temps réel',
    texte: 'Votre numéro de suivi vous montre où en est votre appareil.',
  },
  {
    icone: CalendarCheck,
    titre: 'Prise en charge rapide',
    texte: 'Déposez votre demande en ligne ou prenez rendez-vous avant de vous déplacer.',
  },
];

const ETAPES = [
  {
    icone: ClipboardCheck,
    titre: 'Déposez votre appareil',
    texte: 'En ligne en quelques minutes, ou directement à l’atelier.',
  },
  {
    icone: Search,
    titre: 'Diagnostic et devis',
    texte: 'Nous examinons l’appareil et vous envoyons un devis clair. Vous décidez.',
  },
  {
    icone: PackageCheck,
    titre: 'Réparation et récupération',
    texte: 'Après votre accord, nous réparons. Vous êtes informé dès que c’est prêt.',
  },
];

/* Halo qui suit le pointeur (cartes bénéfices) */
function suivrePointeur(e) {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
}

function Eyebrow({ children, clair = false }) {
  return (
    <p
      className={`mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
        clair ? 'text-or-discret' : 'text-bleu-clair'
      }`}
    >
      <span className="h-px w-6 bg-current" aria-hidden="true" />
      {children}
    </p>
  );
}

export default function Home() {
  const { atelier } = useAtelier();

  const [realisations, setRealisations] = useState([]);
  const [avis, setAvis] = useState([]);
  const [services, setServices] = useState([]);
  const [appareils, setAppareils] = useState([]);
  const [faq, setFaq] = useState([]);

  useEffect(() => {
    api.getRealisations().then((r) => r.success && setRealisations(r.data.slice(0, 3)));
    api.getAvisValides().then((r) => r.success && setAvis(r.data.slice(0, 3)));
    api.getServices().then((r) => r.success && setServices(r.data.slice(0, 4)));
    api.getAppareils().then((r) => r.success && setAppareils(r.data));
    api.getFaq().then((r) => r.success && setFaq(r.data.slice(0, 5)));
  }, []);

  const aDesPreuves = avis.length > 0 || realisations.length > 0;

  return (
    <>
      <Seo
        title="Accueil"
        description={`${atelier.nom}. ${atelier.slogan}`}
      />

      {/* 01 — HERO */}
      <section className="hero-grid relative overflow-hidden bg-bleu-nuit text-white">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-bleu-technique/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-or-discret/10 blur-3xl" />

        <div className="container-site relative grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8 lg:py-28">
          <div>
            <ScrollReveal>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm font-medium text-or-discret">
                <Wrench size={14} aria-hidden="true" />
                {atelier.nom}
              </p>

              <h1 className="font-titre text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                Un vrai diagnostic.
                <span className="block text-or-discret">Une réparation sans surprise.</span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">
                {atelier.slogan} Déposez votre appareil, recevez un devis clair,
                et suivez chaque étape depuis votre téléphone.
              </p>
            </ScrollReveal>

            <ScrollReveal delay={150} className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link to="/deposer" className="btn btn-or px-7 py-3.5 text-base">
                Déposer mon appareil
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                to="/suivi"
                className="btn border border-white/30 bg-transparent px-7 py-3.5 text-base text-white hover:border-or-discret hover:text-or-discret"
              >
                Suivre ma réparation
              </Link>
            </ScrollReveal>

            <ScrollReveal delay={250}>
              <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/75">
                {TRUST.map((t) => (
                  <li key={t.texte} className="flex items-center gap-2">
                    <t.icone size={16} className="text-or-discret" aria-hidden="true" />
                    {t.texte}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          </div>

          <ScrollReveal delay={200}>
            <HeroVisual />
          </ScrollReveal>
        </div>
      </section>

      {/* 02 — PROBLÈME */}
      <section className="py-20 sm:py-28">
        <div className="container-site">
          <ScrollReveal className="max-w-2xl">
            <Eyebrow>Le constat</Eyebrow>
            <h2 className="section-title">
              Confier son appareil ne devrait pas être un saut dans le vide.
            </h2>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {PROBLEMES.map((p, i) => (
              <ScrollReveal key={p.titre} delay={i * 100} className="border-t border-bleu-nuit/15 pt-6">
                <p.icone size={22} className="text-bleu-clair" aria-hidden="true" />
                <h3 className="mt-4 font-titre text-lg font-semibold text-bleu-nuit">{p.titre}</h3>
                <p className="mt-2 text-gris-texte">{p.texte}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 03 — SOLUTION */}
      <section className="bg-gris-clair py-20 sm:py-28">
        <div className="container-site grid items-center gap-12 lg:grid-cols-2">
          <ScrollReveal>
            <Eyebrow>Notre approche</Eyebrow>
            <h2 className="section-title">
              Un atelier qui explique avant d’intervenir.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-gris-texte">
              Nous examinons votre appareil, nous vous disons ce qui ne va pas et
              ce que cela coûte. Vous gardez la main : rien n’est réparé sans
              votre accord, et vous suivez l’avancement en ligne.
            </p>
            <Link to="/services" className="mt-7 inline-flex items-center gap-1 font-semibold text-bleu-technique hover:text-bleu-nuit">
              Découvrir nos services
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </ScrollReveal>

          {/* 04 — BÉNÉFICES */}
          <div className="grid gap-4 sm:grid-cols-2">
            {BENEFICES.map((b, i) => (
              <ScrollReveal key={b.titre} delay={i * 90}>
                <div
                  className="card glow-card h-full"
                  onPointerMove={suivrePointeur}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-bleu-technique/10 text-bleu-technique">
                    <b.icone size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-titre font-semibold text-bleu-nuit">{b.titre}</h3>
                  <p className="mt-1 text-sm text-gris-texte">{b.texte}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 05 — COMMENT ÇA MARCHE */}
      <section className="bg-bleu-nuit py-20 text-white sm:py-28">
        <div className="container-site">
          <ScrollReveal className="max-w-2xl">
            <Eyebrow clair>Comment ça marche</Eyebrow>
            <h2 className="font-titre text-3xl font-bold sm:text-4xl">
              Trois étapes, zéro zone d’ombre.
            </h2>
          </ScrollReveal>

          <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
            {ETAPES.map((e, i) => (
              <ScrollReveal key={e.titre} delay={i * 120} as="li" className="relative">
                <div className="flex items-center gap-4">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/5 text-or-discret">
                    <e.icone size={24} aria-hidden="true" />
                  </span>
                  {i < ETAPES.length - 1 && (
                    <span className="step-line hidden h-px flex-1 md:block" aria-hidden="true" />
                  )}
                </div>
                <p className="mt-6 font-titre text-sm font-semibold text-or-discret">Étape {i + 1}</p>
                <h3 className="mt-1 font-titre text-xl font-semibold">{e.titre}</h3>
                <p className="mt-2 text-white/70">{e.texte}</p>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </section>

      {/* 06 — PREUVES DE CRÉDIBILITÉ */}
      <section className="py-20 sm:py-28">
        <div className="container-site">
          <ScrollReveal className="max-w-2xl">
            <Eyebrow>Preuves</Eyebrow>
            <h2 className="section-title">
              {aDesPreuves ? 'Ils nous ont confié leurs appareils.' : 'Votre avis fera foi ici.'}
            </h2>
          </ScrollReveal>

          {avis.length > 0 && (
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {avis.map((a, i) => (
                <ScrollReveal key={a.id} delay={i * 100}>
                  <ReviewCard {...a} />
                </ScrollReveal>
              ))}
            </div>
          )}

          {realisations.length > 0 && (
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {realisations.map((r, i) => (
                <ScrollReveal key={r.id} delay={i * 100} className="card">
                  <p className="font-titre font-semibold text-bleu-nuit">{r.titre}</p>
                  <p className="mt-1 text-sm text-gris-texte">{r.marque} {r.modele}</p>
                  <p className="mt-3 text-sm text-gris-texte">
                    <strong className="text-bleu-nuit">Problème :</strong> {r.probleme}
                  </p>
                  <p className="mt-1 text-sm text-gris-texte">
                    <strong className="text-bleu-nuit">Intervention :</strong> {r.intervention}
                  </p>
                </ScrollReveal>
              ))}
            </div>
          )}

          {aDesPreuves ? (
            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
              {realisations.length > 0 && (
                <Link to="/realisations" className="inline-flex items-center gap-1 font-semibold text-bleu-technique hover:text-bleu-nuit">
                  Voir toutes les réalisations <ArrowRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          ) : (
            <ScrollReveal className="mt-10 rounded-2xl border border-dashed border-bleu-nuit/20 p-8 text-center">
              <BadgeCheck size={28} className="mx-auto text-bleu-clair" aria-hidden="true" />
              <p className="mx-auto mt-4 max-w-md text-gris-texte">
                Les avis validés et les réalisations de l’atelier apparaîtront ici.
                Vous avez déjà confié un appareil ? Racontez votre expérience.
              </p>
              <Link to="/contact" className="btn-secondary mt-6 inline-flex">
                Laisser un avis
              </Link>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* 07 — OFFRE */}
      <section className="bg-gris-clair py-20 sm:py-28">
        <div className="container-site">
          <ScrollReveal className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <Eyebrow>L’offre</Eyebrow>
              <h2 className="section-title">Ce que nous réparons, et comment.</h2>
              <p className="mt-3 text-gris-texte">
                Diagnostic offert, puis devis gratuit et sans engagement avant toute intervention.
              </p>
            </div>
            <Link to="/services" className="inline-flex items-center gap-1 font-semibold text-bleu-technique hover:text-bleu-nuit">
              Tous les services <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </ScrollReveal>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(services.length ? services : Array.from({ length: 4 })).map((s, i) => (
              <ScrollReveal key={s?.id || i} delay={i * 80} className="card">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-or-discret/15 text-or-discret">
                  {s ? <DynamicIcon name={s.icone} size={22} /> : <Wrench size={22} aria-hidden="true" />}
                </span>
                <p className="mt-4 font-titre font-semibold text-bleu-nuit">{s?.titre || '…'}</p>
                <p className="mt-1 text-sm text-gris-texte">{s?.description}</p>
              </ScrollReveal>
            ))}
          </div>

          {appareils.length > 0 && (
            <ScrollReveal className="mt-10">
              <p className="mb-3 text-sm font-semibold text-bleu-nuit">Appareils pris en charge</p>
              <ul className="flex flex-wrap gap-2">
                {appareils.map((a) => (
                  <li key={a.id} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-bleu-nuit ring-1 ring-bleu-nuit/10">
                    <DynamicIcon name={a.icone} size={16} />
                    {a.titre}
                  </li>
                ))}
              </ul>
            </ScrollReveal>
          )}
        </div>
      </section>

      {/* 08 — FAQ */}
      {faq.length > 0 && (
        <section className="py-20 sm:py-28">
          <div className="container-site grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <ScrollReveal>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="section-title">Les questions que vous vous posez.</h2>
              <Link to="/faq" className="mt-6 inline-flex items-center gap-1 font-semibold text-bleu-technique hover:text-bleu-nuit">
                Toutes les questions <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </ScrollReveal>
            <ScrollReveal delay={120}>
              <FaqAccordion items={faq} />
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Venir à l'atelier */}
      <section className="border-t border-bleu-nuit/10 py-16 sm:py-20">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <ScrollReveal>
            <h2 className="section-title">Venir à l’atelier</h2>
            <ul className="mt-6 space-y-4 text-gris-texte">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 shrink-0 text-bleu-technique" aria-hidden="true" />
                {atelier.adresse}
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} className="mt-0.5 shrink-0 text-bleu-technique" aria-hidden="true" />
                <a href={`tel:${(atelier.telephone || '').replace(/\s/g, '')}`} className="hover:text-bleu-technique">
                  {atelier.telephone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={20} className="mt-0.5 shrink-0 text-bleu-technique" aria-hidden="true" />
                <span>
                  {atelier.horaires?.map((h) => (
                    <span key={h.jours} className="block">{h.jours} : {h.heures}</span>
                  ))}
                </span>
              </li>
            </ul>
          </ScrollReveal>

          <ScrollReveal delay={150} className="aspect-video overflow-hidden rounded-2xl bg-gris-clair ring-1 ring-bleu-nuit/5">
            <iframe
              title={`Localisation de ${atelier.nom}`}
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(atelier.mapsQuery)}&output=embed`}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* 09 — CTA FINAL */}
      <section className="relative overflow-hidden bg-bleu-technique py-20 text-white sm:py-24">
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-or-discret/10 blur-3xl" />
        <div className="container-site relative flex flex-col items-center gap-8 text-center">
          <ScrollReveal>
            <h2 className="mx-auto max-w-2xl font-titre text-3xl font-bold sm:text-4xl">
              Une panne ? Commencez par un diagnostic gratuit.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/85">
              Déposez votre demande en ligne avant de vous déplacer : nous revenons
              vers vous avec la suite à donner.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={150} className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <Link to="/deposer" className="btn-or px-7 py-3.5 text-base">
              Déposer mon appareil
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/rendez-vous" className="btn-secondary px-7 py-3.5 text-base">
              Prendre rendez-vous
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
