/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Les 4 couleurs de marque suivent l'« Apparence » réglée dans /gestion
        // (variables --c-* posées par AtelierContext). Les valeurs ci-dessous
        // sont celles d'origine, utilisées tant qu'aucune couleur n'est définie.
        'bleu-nuit': 'rgb(var(--c-nuit, 10 27 51) / <alpha-value>)',
        'bleu-technique': 'rgb(var(--c-technique, 15 46 92) / <alpha-value>)',
        'bleu-clair': 'rgb(var(--c-clair, 27 79 138) / <alpha-value>)',
        'or-discret': 'rgb(var(--c-or, 196 151 45) / <alpha-value>)',
        'gris-clair': '#F1F5F8',
        'gris-texte': '#606973',
      },
      fontFamily: {
        titre: ['Manrope', 'Inter', 'system-ui', 'sans-serif'],
        texte: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out both',
        'fade-in': 'fade-in 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};
