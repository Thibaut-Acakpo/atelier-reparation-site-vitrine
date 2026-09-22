import { useEffect, useState } from 'react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';
import BeforeAfterSlider from '../components/BeforeAfterSlider';
import { api } from '../data/api';

export default function Realisations() {
  const [realisations, setRealisations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRealisations().then((r) => {
      if (r.success) setRealisations(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Seo title="Réalisations" description="Galerie avant/après des réparations réalisées par notre atelier." />
      <PageHero
        eyebrow="Réalisations"
        title="Des interventions réelles, avant et après"
        description="Aucune donnée personnelle des clients n'est affichée dans cette galerie."
      />
      <section className="py-16 sm:py-20">
        <div className="container-site">
          {!loading && realisations.length === 0 && (
            <p className="text-center text-gris-texte">Aucune réalisation publiée pour le moment.</p>
          )}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {realisations.map((r, i) => (
              <ScrollReveal key={r.id} delay={i * 80}>
                <BeforeAfterSlider imageAvant={r.image_avant} imageApres={r.image_apres} label={r.titre} />
                <div className="mt-4">
                  <p className="font-titre font-semibold text-bleu-nuit">{r.titre}</p>
                  <p className="text-sm text-gris-texte">
                    {r.marque} {r.modele}
                  </p>
                  <p className="mt-2 text-sm text-gris-texte">
                    <strong className="text-bleu-nuit">Problème :</strong> {r.probleme}
                  </p>
                  <p className="mt-1 text-sm text-gris-texte">
                    <strong className="text-bleu-nuit">Intervention :</strong> {r.intervention}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
