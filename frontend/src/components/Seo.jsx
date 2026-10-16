import { useEffect } from 'react';
import { useAtelier } from '../context/AtelierContext';

export default function Seo({
  title,
  description: descriptionProp,
  image: imageProp,
}) {
  const { atelier } = useAtelier();

  // Valeurs saisies dans l'espace développeur (SEO) utilisées par défaut.
  const description = descriptionProp || atelier.seoDescription;
  const image = imageProp || atelier.seoImage;

  useEffect(() => {
    const previousTitle = document.title;

    // ─────────────────────────────────────────────
    // Titre de la page
    // ─────────────────────────────────────────────
    const titreComplet = title
      ? `${title} — ${atelier.nom}`
      : atelier.seoTitre || atelier.nom;

    document.title = titreComplet;

    // ─────────────────────────────────────────────
    // Meta description
    // ─────────────────────────────────────────────
    let metaDescription = document.querySelector(
      'meta[name="description"]'
    );

    let createdDescription = false;
    const previousDescription = metaDescription
      ? metaDescription.getAttribute('content')
      : null;

    if (description) {
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute(
          'name',
          'description'
        );
        document.head.appendChild(metaDescription);
        createdDescription = true;
      }

      metaDescription.setAttribute(
        'content',
        description
      );
    }

    // ─────────────────────────────────────────────
    // Open Graph
    // ─────────────────────────────────────────────
    const mettreAJourMetaProperty = (
      property,
      content
    ) => {
      if (!content) return null;

      let meta = document.querySelector(
        `meta[property="${property}"]`
      );

      let created = false;
      const previousContent = meta
        ? meta.getAttribute('content')
        : null;

      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        document.head.appendChild(meta);
        created = true;
      }

      meta.setAttribute('content', content);

      return {
        meta,
        created,
        previousContent,
      };
    };

    const ogTitle = mettreAJourMetaProperty(
      'og:title',
      titreComplet
    );

    const ogDescription = mettreAJourMetaProperty(
      'og:description',
      description
    );

    const ogType = mettreAJourMetaProperty(
      'og:type',
      'website'
    );

    const ogImage = mettreAJourMetaProperty(
      'og:image',
      image
    );

    // ─────────────────────────────────────────────
    // Nettoyage lorsque la page change
    // ─────────────────────────────────────────────
    return () => {
      document.title = previousTitle;

      if (
        metaDescription &&
        !createdDescription &&
        previousDescription !== null
      ) {
        metaDescription.setAttribute(
          'content',
          previousDescription
        );
      } else if (
        metaDescription &&
        createdDescription
      ) {
        metaDescription.remove();
      }

      const metaElements = [
        ogTitle,
        ogDescription,
        ogType,
        ogImage,
      ];

      metaElements.forEach((item) => {
        if (!item) return;

        if (
          item.created &&
          item.meta
        ) {
          item.meta.remove();
        } else if (
          item.meta &&
          item.previousContent !== null
        ) {
          item.meta.setAttribute(
            'content',
            item.previousContent
          );
        }
      });
    };
  }, [
    title,
    description,
    image,
    atelier.nom,
  ]);

  return null;
}