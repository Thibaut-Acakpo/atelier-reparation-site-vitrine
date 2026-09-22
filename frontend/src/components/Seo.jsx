import { useEffect } from 'react';

// Petit utilitaire SEO sans dépendance : met à jour <title> et la meta
// description à chaque changement de page (section 22 du cahier des charges).
export default function Seo({ title, description }) {
  useEffect(() => {
    const previousTitle = document.title;
    if (title) document.title = `${title} — Atelier de réparation électronique`;

    let meta = document.querySelector('meta[name="description"]');
    let createdMeta = false;
    const previousContent = meta ? meta.getAttribute('content') : null;

    if (description) {
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'description');
        document.head.appendChild(meta);
        createdMeta = true;
      }
      meta.setAttribute('content', description);
    }

    return () => {
      document.title = previousTitle;
      if (meta && !createdMeta && previousContent !== null) {
        meta.setAttribute('content', previousContent);
      }
    };
  }, [title, description]);

  return null;
}
