import { createContext, useContext, useEffect, useState } from 'react';
import {
  ATELIER_PAR_DEFAUT,
  chargerConfigurationAtelier,
} from '../data/constants';

const AtelierContext = createContext(null);

const COULEURS_PAR_DEFAUT = {
  couleurPrincipale: '#0A1B33',
  couleurSecondaire: '#0F2E5C',
  couleurAccent: '#C4972D',
  couleurFond: '#F1F5F8',
  couleurTexte: '#0A1B33',
};

function versCanaux(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function poserCanaux(racine, variable, rgb) {
  if (rgb) racine.style.setProperty(variable, rgb.join(' '));
  else racine.style.removeProperty(variable);
}

// Applique les couleurs du client à tout le site (classes Tailwind
// bleu-nuit / bleu-technique / bleu-clair / or-discret).
function appliquerCouleurs(atelier) {
  const racine = document.documentElement;
  const couleurs = { ...COULEURS_PAR_DEFAUT, ...atelier };

  const principale = versCanaux(couleurs.couleurPrincipale);
  const secondaire = versCanaux(couleurs.couleurSecondaire);
  const accent = versCanaux(couleurs.couleurAccent);

  poserCanaux(racine, '--c-nuit', principale);
  poserCanaux(racine, '--c-technique', secondaire);
  poserCanaux(racine, '--c-or', accent);

  // « bleu-clair » = secondaire éclaircie ; si la secondaire est celle
  // d'origine, on garde le bleu d'origine du design.
  const secondaireOrigine = versCanaux(COULEURS_PAR_DEFAUT.couleurSecondaire);
  const estOrigine =
    secondaire && secondaire.join() === secondaireOrigine.join();
  poserCanaux(
    racine,
    '--c-clair',
    secondaire && !estOrigine
      ? secondaire.map((v) => Math.round(v + (255 - v) * 0.25))
      : null
  );

  racine.style.setProperty('--couleur-principale', couleurs.couleurPrincipale);
  racine.style.setProperty('--couleur-secondaire', couleurs.couleurSecondaire);
  racine.style.setProperty('--couleur-accent', couleurs.couleurAccent);
  racine.style.setProperty('--couleur-fond', couleurs.couleurFond);
  racine.style.setProperty('--couleur-texte', couleurs.couleurTexte);
}

export function AtelierProvider({ children }) {
  const [atelier, setAtelier] = useState(ATELIER_PAR_DEFAUT);
  const [chargement, setChargement] = useState(true);
  const [introuvable, setIntrouvable] = useState(false);

  useEffect(() => {
    let actif = true;

    async function charger() {
      try {
        const configuration = await chargerConfigurationAtelier();

        if (actif && configuration === null) {
          setIntrouvable(true);
        } else if (actif) {
          setAtelier(configuration);
          appliquerCouleurs(configuration);
        }
      } catch (error) {
        console.error('Erreur de chargement de l’atelier :', error);

        if (actif) {
          appliquerCouleurs(ATELIER_PAR_DEFAUT);
        }
      } finally {
        if (actif) {
          setChargement(false);
        }
      }
    }

    appliquerCouleurs(ATELIER_PAR_DEFAUT);
    charger();

    return () => {
      actif = false;
    };
  }, []);

  return (
    <AtelierContext.Provider value={{ atelier, chargement, introuvable }}>
      {children}
    </AtelierContext.Provider>
  );
}

export function useAtelier() {
  const context = useContext(AtelierContext);

  if (!context) {
    throw new Error(
      'useAtelier doit être utilisé à l’intérieur de AtelierProvider.'
    );
  }

  return context;
}
