import { Suspense, lazy, memo } from 'react';
import { Wrench } from 'lucide-react';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

// Les noms d'icônes sont saisis librement dans l'espace développeur
// (« terminal-square », « smartphone »…). Chaque icône est chargée à la
// demande : le bundle principal ne contient plus les ~1 500 icônes Lucide.
const cache = new Map();

function charger(nom) {
  if (!cache.has(nom)) {
    cache.set(nom, lazy(dynamicIconImports[nom]));
  }
  return cache.get(nom);
}

function DynamicIcon({ name, size = 24, className = '', ...props }) {
  const nom = (name || '').trim().toLowerCase();
  const commun = { size, className, 'aria-hidden': 'true', ...props };

  // Nom inconnu : icône de repli, sans erreur.
  if (!nom || !dynamicIconImports[nom]) return <Wrench {...commun} />;

  const Icone = charger(nom);
  return (
    <Suspense fallback={<span style={{ display: 'inline-block', width: size, height: size }} />}>
      <Icone {...commun} />
    </Suspense>
  );
}

export default memo(DynamicIcon);
