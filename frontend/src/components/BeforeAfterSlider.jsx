import { useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';

// Curseur avant/après interactif (section 16). Fonctionne au clic/drag et
// au clavier (flèches gauche/droite). Si aucune image réelle n'est encore
// disponible, affiche un espace réservé neutre plutôt qu'une image générique.
export default function BeforeAfterSlider({ imageAvant, imageApres, label }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const updateFromClientX = (clientX) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  };

  const handlePointerDown = (e) => {
    dragging.current = true;
    updateFromClientX(e.clientX);
  };
  const handlePointerMove = (e) => {
    if (dragging.current) updateFromClientX(e.clientX);
  };
  const stopDragging = () => {
    dragging.current = false;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') setPosition((p) => Math.max(0, p - 5));
    if (e.key === 'ArrowRight') setPosition((p) => Math.min(100, p + 5));
  };

  const Placeholder = ({ text }) => (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gris-clair text-gris-texte">
      <ImageOff size={28} aria-hidden="true" />
      <span className="text-xs font-medium">{text}</span>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-2xl shadow-sm ring-1 ring-bleu-nuit/5">
      <div
        ref={containerRef}
        className="relative aspect-[4/3] w-full select-none overflow-hidden"
        onMouseDown={handlePointerDown}
        onMouseMove={handlePointerMove}
        onMouseUp={stopDragging}
        onMouseLeave={stopDragging}
        onTouchStart={(e) => updateFromClientX(e.touches[0].clientX)}
        onTouchMove={(e) => updateFromClientX(e.touches[0].clientX)}
      >
        <div className="absolute inset-0">
          {imageApres ? (
            <img src={imageApres} alt={`${label} — après intervention`} className="h-full w-full object-cover" />
          ) : (
            <Placeholder text="Photo après — à ajouter" />
          )}
        </div>

        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          {imageAvant ? (
            <img
              src={imageAvant}
              alt={`${label} — avant intervention`}
              className="h-full object-cover"
              style={{ width: containerRef.current?.getBoundingClientRect().width || '100%' }}
            />
          ) : (
            <div style={{ width: containerRef.current?.getBoundingClientRect().width || '100vw' }} className="h-full">
              <Placeholder text="Photo avant — à ajouter" />
            </div>
          )}
        </div>

        <div
          role="slider"
          tabIndex={0}
          aria-label={`Curseur de comparaison avant/après pour ${label}`}
          aria-valuenow={Math.round(position)}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={handleKeyDown}
          className="absolute top-0 bottom-0 flex w-1 -translate-x-1/2 cursor-ew-resize items-center justify-center bg-white/90"
          style={{ left: `${position}%` }}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-bleu-nuit/10">
            <span className="text-xs font-bold text-bleu-technique">↔</span>
          </span>
        </div>

        <span className="pointer-events-none absolute left-2 top-2 rounded bg-bleu-nuit/80 px-2 py-0.5 text-xs font-semibold text-white">
          Avant
        </span>
        <span className="pointer-events-none absolute right-2 top-2 rounded bg-or-discret/90 px-2 py-0.5 text-xs font-semibold text-bleu-nuit">
          Après
        </span>
      </div>
    </div>
  );
}
