import ScrollReveal from './ScrollReveal';

export default function PageHero({ eyebrow, title, description }) {
  return (
    <section className="bg-bleu-nuit py-16 text-white sm:py-20">
      <div className="container-site">
        <ScrollReveal>
          {eyebrow && (
            <p className="mb-3 font-titre text-sm font-semibold uppercase tracking-wider text-or-discret">{eyebrow}</p>
          )}
          <h1 className="font-titre text-3xl font-bold sm:text-4xl md:text-5xl">{title}</h1>
          {description && <p className="mt-4 max-w-2xl text-white/75">{description}</p>}
        </ScrollReveal>
      </div>
    </section>
  );
}
