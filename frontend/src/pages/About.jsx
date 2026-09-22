import { ShieldCheck, Target, Users, Wrench } from 'lucide-react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';
import { ATELIER } from '../data/constants';

const ENGAGEMENTS = [
  { icone: ShieldCheck, titre: 'Sérieux', texte: "Diagnostic honnête, sans promesse excessive ni distinction inventée." },
  { icone: Target, titre: 'Précision', texte: 'Un diagnostic rigoureux avant toute intervention.' },
  { icone: Users, titre: 'Clientèle exigeante', texte: 'Particuliers, professionnels et institutions.' },
  { icone: Wrench, titre: 'Maîtrise technique', texte: 'Interventions matérielles et logicielles réalisées à l\u2019atelier.' },
];

export default function About() {
  return (
    <>
      <Seo title="À propos" description="Présentation de l'atelier, son expertise, sa méthode de travail et ses engagements." />
      <PageHero eyebrow="À propos" title="Un atelier technique, structuré et fiable" />

      <section className="py-16 sm:py-20">
        <div className="container-site grid gap-12 lg:grid-cols-2 lg:items-center">
          <ScrollReveal>
            <h2 className="section-title">Notre positionnement</h2>
            <p className="mt-4 text-gris-texte">
              {ATELIER.nom} est un atelier de réparation d&apos;appareils électroniques positionné comme une référence
              au Bénin, avec une clientèle institutionnelle et professionnelle. Le travail est réalisé exclusivement
              à l&apos;atelier, sur téléphones, ordinateurs, tablettes et autres appareils électroniques.
            </p>
            <p className="mt-4 text-gris-texte">
              Toute reconnaissance officielle, certification ou relation institutionnelle n&apos;est présentée que si elle
              est vérifiable et autorisée.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={150} className="aspect-video rounded-2xl bg-gris-clair ring-1 ring-bleu-nuit/5" />
        </div>
      </section>

      <section className="bg-gris-clair py-16 sm:py-20">
        <div className="container-site">
          <ScrollReveal>
            <h2 className="section-title">Nos engagements</h2>
          </ScrollReveal>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {ENGAGEMENTS.map((e, i) => (
              <ScrollReveal key={e.titre} delay={i * 80} className="card">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-bleu-technique/10 text-bleu-technique">
                  <e.icone size={22} aria-hidden="true" />
                </span>
                <p className="mt-4 font-titre font-semibold text-bleu-nuit">{e.titre}</p>
                <p className="mt-1 text-sm text-gris-texte">{e.texte}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-site">
          <ScrollReveal>
            <h2 className="section-title">Méthode de travail</h2>
            <ol className="mt-6 max-w-2xl list-decimal space-y-3 pl-5 text-gris-texte">
              <li>Réception de la demande ou de l&apos;appareil.</li>
              <li>Diagnostic technique gratuit.</li>
              <li>Communication du prix et des délais.</li>
              <li>Réparation après accord du client.</li>
              <li>Contrôle qualité et remise de l&apos;appareil.</li>
            </ol>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
