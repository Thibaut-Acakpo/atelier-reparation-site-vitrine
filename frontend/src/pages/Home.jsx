import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Clock,
  Smartphone,
  MapPin,
  Phone,
  ArrowRight,
  ClipboardCheck,
  Wrench as WrenchIcon,
  PackageCheck,
} from 'lucide-react';
import Seo from '../components/Seo';
import ScrollReveal from '../components/ScrollReveal';
import DynamicIcon from '../components/DynamicIcon';
import ReviewCard from '../components/ReviewCard';
import { api } from '../data/api';
import { ATELIER } from '../data/constants';

const ETAPES = [
  { icone: ClipboardCheck, titre: 'Déposez ou décrivez votre appareil', texte: 'En ligne ou directement à l\u2019atelier.' },
  { icone: Search, titre: 'Diagnostic gratuit', texte: 'Examen technique complet réalisé à l\u2019atelier.' },
  { icone: WrenchIcon, titre: 'Réparation', texte: 'Intervention réalisée après votre accord sur le devis.' },
  { icone: PackageCheck, titre: 'Récupération', texte: 'Votre appareil est prêt, vous êtes informé.' },
];

const REASSURANCE = [
  { icone: ShieldCheck, texte: 'Diagnostic gratuit et transparent' },
  { icone: Search, texte: 'Suivi réel de votre réparation en ligne' },
  { icone: Clock, texte: 'Prise en charge rapide sur rendez-vous' },
];

export default function Home() {
  const [realisations, setRealisations] = useState([]);
  const [avis, setAvis] = useState([]);
  const [services, setServices] = useState([]);
  const [appareils, setAppareils] = useState([]);

  useEffect(() => {
    api.getRealisations().then((r) => r.success && setRealisations(r.data.slice(0, 3)));
    api.getAvisValides().then((r) => r.success && setAvis(r.data.slice(0, 3)));
    api.getServices().then((r) => r.success && setServices(r.data.slice(0, 4)));
    api.getAppareils().then((r) => r.success && setAppareils(r.data));
  }, []);

  return (
    <>
      <Seo
        title="Accueil"
        description="Atelier de réparation de téléphones, ordinateurs et tablettes au Bénin. Diagnostic gratuit, suivi réel en ligne, rendez-vous."
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-bleu-nuit text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-bleu-technique/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-or-discret/10 blur-3xl" />
        <div className="container-site relative py-20 sm:py-28">
          <ScrollReveal>
            <p className="mb-4 inline-block rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-or-discret">
              Atelier de référence au Bénin
            </p>
            <h1 className="max-w-3xl font-titre text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
              Nous réparons vos appareils avec soin et précision.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/80">
              Téléphones, ordinateurs, tablettes et autres appareils. Confiez votre appareil à un atelier spécialisé.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={150} className="mt-8 flex flex-wrap gap-4">
            <Link to="/deposer" className="btn-or">
              Déposer mon appareil <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/suivi" className="btn-secondary bg-transparent text-white ring-white/30 hover:text-or-discret hover:ring-or-discret">
              Suivre ma réparation
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* Expertise */}
      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-10 md:grid-cols-3">
          {REASSURANCE.map((item, i) => (
            <ScrollReveal key={item.texte} delay={i * 100} className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bleu-technique/10 text-bleu-technique">
                <item.icone size={22} aria-hidden="true" />
              </span>
              <p className="pt-2 font-medium text-bleu-nuit">{item.texte}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Catégories d'appareils */}
      <section className="bg-gris-clair py-16 sm:py-20">
        <div className="container-site">
          <ScrollReveal>
            <h2 className="section-title">Appareils pris en charge</h2>
            <p className="mt-2 max-w-2xl text-gris-texte">
              Téléphones, ordinateurs, tablettes et autres appareils électroniques — réparation matérielle et logicielle.
            </p>
          </ScrollReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(appareils.length ? appareils : Array.from({ length: 4 })).map((cat, i) => (
              <ScrollReveal key={cat?.id || i} delay={i * 80} className="card text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-bleu-technique/10 text-bleu-technique">
                  {cat ? <DynamicIcon name={cat.icone} size={26} /> : <Smartphone size={26} aria-hidden="true" />}
                </span>
                <p className="mt-4 font-titre font-semibold text-bleu-nuit">{cat?.titre || '…'}</p>
                <p className="mt-1 text-sm text-gris-texte">{cat?.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Services principaux */}
      <section className="py-16 sm:py-20">
        <div className="container-site">
          <ScrollReveal className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="section-title">Nos services</h2>
              <p className="mt-2 max-w-2xl text-gris-texte">Des interventions matérielles et logicielles réalisées avec précision.</p>
            </div>
            <Link to="/services" className="inline-flex items-center gap-1 font-semibold text-bleu-technique hover:text-bleu-nuit">
              Voir tous les services <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </ScrollReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(services.length ? services : Array.from({ length: 4 })).map((s, i) => (
              <ScrollReveal key={s?.id || i} delay={i * 80} className="card">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-or-discret/15 text-or-discret">
                  {s ? <DynamicIcon name={s.icone} size={22} /> : <WrenchIcon size={22} aria-hidden="true" />}
                </span>
                <p className="mt-4 font-titre font-semibold text-bleu-nuit">{s?.titre || '…'}</p>
                <p className="mt-1 text-sm text-gris-texte">{s?.description}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Processus */}
      <section className="bg-bleu-nuit py-16 text-white sm:py-20">
        <div className="container-site">
          <ScrollReveal>
            <h2 className="font-titre text-3xl font-bold sm:text-4xl">Comment ça se passe</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {ETAPES.map((etape, i) => (
              <ScrollReveal key={etape.titre} delay={i * 100} className="relative">
                <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 font-titre text-lg font-bold text-or-discret">
                  {i + 1}
                </span>
                <p className="font-titre font-semibold">{etape.titre}</p>
                <p className="mt-1 text-sm text-white/70">{etape.texte}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Réalisations */}
      {realisations.length > 0 && (
        <section className="py-16 sm:py-20">
          <div className="container-site">
            <ScrollReveal className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="section-title">Réalisations récentes</h2>
                <p className="mt-2 max-w-2xl text-gris-texte">Quelques interventions menées à l&apos;atelier.</p>
              </div>
              <Link to="/realisations" className="inline-flex items-center gap-1 font-semibold text-bleu-technique hover:text-bleu-nuit">
                Voir toutes les réalisations <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </ScrollReveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {realisations.map((r, i) => (
                <ScrollReveal key={r.id} delay={i * 100} className="card">
                  <p className="font-titre font-semibold text-bleu-nuit">{r.titre}</p>
                  <p className="mt-1 text-sm text-gris-texte">{r.marque} {r.modele}</p>
                  <p className="mt-3 text-sm text-gris-texte"><strong className="text-bleu-nuit">Problème :</strong> {r.probleme}</p>
                  <p className="mt-1 text-sm text-gris-texte"><strong className="text-bleu-nuit">Intervention :</strong> {r.intervention}</p>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Avis */}
      {avis.length > 0 && (
        <section className="bg-gris-clair py-16 sm:py-20">
          <div className="container-site">
            <ScrollReveal>
              <h2 className="section-title">Ce que disent nos clients</h2>
            </ScrollReveal>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {avis.map((a, i) => (
                <ScrollReveal key={a.id} delay={i * 100}>
                  <ReviewCard {...a} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Localisation */}
      <section className="py-16 sm:py-20">
        <div className="container-site grid items-center gap-10 lg:grid-cols-2">
          <ScrollReveal>
            <h2 className="section-title">Retrouvez-nous à l&apos;atelier</h2>
            <ul className="mt-6 space-y-4 text-gris-texte">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 shrink-0 text-bleu-technique" aria-hidden="true" />
                {ATELIER.adresse}
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} className="mt-0.5 shrink-0 text-bleu-technique" aria-hidden="true" />
                {ATELIER.telephone}
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
            </ul>
            <Link to="/contact" className="btn-primary mt-8 inline-flex">
              Nous contacter
            </Link>
          </ScrollReveal>
          <ScrollReveal delay={150} className="aspect-video overflow-hidden rounded-2xl bg-gris-clair ring-1 ring-bleu-nuit/5">
            <iframe
              title="Localisation de l'atelier"
              className="h-full w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps?q=${encodeURIComponent(ATELIER.mapsQuery)}&output=embed`}
            />
          </ScrollReveal>
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-bleu-technique py-16 text-white sm:py-20">
        <div className="container-site flex flex-col items-center gap-6 text-center">
          <ScrollReveal>
            <h2 className="font-titre text-3xl font-bold sm:text-4xl">Une panne ? Ne perdez pas de temps.</h2>
            <p className="mt-3 text-white/85">Déposez votre demande en ligne avant de vous déplacer.</p>
          </ScrollReveal>
          <ScrollReveal delay={150} className="flex flex-wrap justify-center gap-4">
            <Link to="/deposer" className="btn-or">
              Déposer mon appareil
            </Link>
            <Link to="/rendez-vous" className="btn-secondary">
              Prendre rendez-vous
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
