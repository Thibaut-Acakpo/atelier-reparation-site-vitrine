import { useEffect, useState } from 'react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';
import FaqAccordion from '../components/FaqAccordion';
import { api } from '../data/api';

export default function Faq() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getFaq().then((r) => r.success && setItems(r.data));
  }, []);

  return (
    <>
      <Seo title="Questions fréquentes" description="Réponses aux questions les plus fréquentes sur le diagnostic, les tarifs, le suivi et les rendez-vous." />
      <PageHero eyebrow="FAQ" title="Questions fréquentes" />
      <section className="py-16 sm:py-20">
        <div className="container-site mx-auto max-w-3xl">
          <ScrollReveal>
            <FaqAccordion items={items} />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
