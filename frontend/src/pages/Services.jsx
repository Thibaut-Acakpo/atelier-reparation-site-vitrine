import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';
import DynamicIcon from '../components/DynamicIcon';
import { api } from '../data/api';

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.getServices().then((r) => r.success && setServices(r.data));
  }, []);

  return (
    <>
      <Seo title="Services" description="Réparation matérielle et logicielle, diagnostic gratuit, maintenance, remplacement de composants." />
      <PageHero
        eyebrow="Nos services"
        title="Des interventions matérielles et logicielles précises"
        description="Diagnostic gratuit réalisé à l'atelier, puis intervention après votre accord."
      />
      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <ScrollReveal key={s.id} delay={i * 80} className="card">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-or-discret/15 text-or-discret">
                <DynamicIcon name={s.icone} size={24} />
              </span>
              <p className="mt-4 font-titre text-lg font-semibold text-bleu-nuit">{s.titre}</p>
              <p className="mt-2 text-sm text-gris-texte">{s.description}</p>
            </ScrollReveal>
          ))}
        </div>
        <div className="container-site mt-12 rounded-2xl bg-gris-clair p-8 text-center">
          <p className="font-titre text-xl font-semibold text-bleu-nuit">
            Un diagnostic est nécessaire avant toute intervention. Il est gratuit et réalisé à l&apos;atelier.
          </p>
          <p className="mt-2 text-gris-texte">Aucune estimation de prix n&apos;est communiquée en ligne.</p>
          <Link to="/deposer" className="btn-primary mt-6 inline-flex">
            Déposer mon appareil
          </Link>
        </div>
      </section>
    </>
  );
}
