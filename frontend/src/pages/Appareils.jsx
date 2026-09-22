import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';
import DynamicIcon from '../components/DynamicIcon';
import { api } from '../data/api';

export default function Appareils() {
  const [appareils, setAppareils] = useState([]);

  useEffect(() => {
    api.getAppareils().then((r) => r.success && setAppareils(r.data));
  }, []);

  return (
    <>
      <Seo title="Appareils pris en charge" description="Téléphones, ordinateurs, tablettes et autres appareils électroniques pris en charge par l'atelier." />
      <PageHero eyebrow="Appareils" title="Tous les appareils que nous prenons en charge" />
      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {appareils.map((a, i) => (
            <ScrollReveal key={a.id} delay={i * 80} className="card text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bleu-technique/10 text-bleu-technique">
                <DynamicIcon name={a.icone} size={30} />
              </span>
              <p className="mt-4 font-titre text-lg font-semibold text-bleu-nuit">{a.titre}</p>
              <p className="mt-2 text-sm text-gris-texte">{a.description}</p>
              <Link
                to="/deposer"
                className="mt-4 inline-block text-sm font-semibold text-bleu-technique hover:text-bleu-nuit"
              >
                Déposer un appareil de ce type →
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </section>
    </>
  );
}
