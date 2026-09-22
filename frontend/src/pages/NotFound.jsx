import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-titre text-6xl font-extrabold text-bleu-nuit">404</p>
      <p className="mt-3 text-gris-texte">Cette page n&apos;existe pas ou plus.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Retour à l&apos;accueil
      </Link>
    </section>
  );
}
