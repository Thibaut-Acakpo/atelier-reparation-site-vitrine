/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
  'bleu-nuit': '#0A1B33',       // bleu nuit très sombre — autorité
  'bleu-technique': '#0F2E5C',  // bleu marine sombre — couleur principale
  'bleu-clair': '#1B4F8A',      // bleu moyen sombre — accents
  'or-discret': '#C4972D',      // or discret inchangé
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
