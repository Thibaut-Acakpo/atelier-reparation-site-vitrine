import { useRef } from 'react';

// Visuel principal du hero : un appareil en cours de diagnostic.
// 100 % SVG/CSS (aucune image à charger). Léger effet de profondeur à la
// souris, désactivé automatiquement si l'utilisateur préfère moins d'animations.
const OR = 'rgb(var(--c-or, 196 151 45))';

export default function HeroVisual() {
  const ref = useRef(null);

  const onMove = (e) => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = node.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    node.style.setProperty('--ry', `${x * 10}deg`);
    node.style.setProperty('--rx', `${-y * 8}deg`);
  };

  const onLeave = () => {
    const node = ref.current;
    if (!node) return;
    node.style.setProperty('--ry', '0deg');
    node.style.setProperty('--rx', '0deg');
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[22rem] [perspective:1100px]"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      aria-hidden="true"
    >
      <div
        ref={ref}
        className="hero-device relative"
        style={{ '--rx': '0deg', '--ry': '0deg' }}
      >
        <svg viewBox="0 0 320 560" className="h-auto w-full drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
          <defs>
            <linearGradient id="hv-body" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0.16" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0.04" />
            </linearGradient>
            <clipPath id="hv-screen">
              <rect x="30" y="34" width="260" height="492" rx="26" />
            </clipPath>
          </defs>

          {/* Châssis */}
          <rect x="14" y="10" width="292" height="540" rx="44" fill="url(#hv-body)" stroke="#ffffff" strokeOpacity="0.28" strokeWidth="1.5" />
          <rect x="30" y="34" width="260" height="492" rx="26" fill="#050d1c" fillOpacity="0.85" stroke="#ffffff" strokeOpacity="0.12" />
          <rect x="128" y="44" width="64" height="8" rx="4" fill="#ffffff" fillOpacity="0.14" />

          <g clipPath="url(#hv-screen)">
            {/* Circuit */}
            <g fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="1.2">
              <path d="M50 120h70l16 16h60" />
              <path d="M50 150h40l14 14h100" />
              <path d="M270 200h-60l-16 16h-70" />
              <path d="M270 232h-30l-14 14h-96" />
              <rect x="112" y="268" width="96" height="96" rx="10" />
              <path d="M112 292h-30M112 316h-30M112 340h-30M208 292h30M208 316h30M208 340h30M136 268v-26M160 268v-26M184 268v-26M136 364v26M160 364v26M184 364v26" />
            </g>
            <rect x="132" y="288" width="56" height="56" rx="8" fill={OR} fillOpacity="0.18" stroke={OR} strokeOpacity="0.8" />
            <circle cx="160" cy="316" r="6" fill={OR} className="hero-pulse" />

            {/* Lignes de diagnostic */}
            <g fill="#ffffff" fillOpacity="0.14">
              <rect x="50" y="420" width="140" height="8" rx="4" />
              <rect x="50" y="440" width="200" height="8" rx="4" />
              <rect x="50" y="460" width="110" height="8" rx="4" />
            </g>
            <rect x="50" y="484" width="220" height="24" rx="12" fill={OR} fillOpacity="0.9" />

            {/* Balayage */}
            <g className="hero-scan">
              <rect x="30" y="-40" width="260" height="70" fill={OR} fillOpacity="0.1" />
              <rect x="30" y="29" width="260" height="2" fill={OR} fillOpacity="0.9" />
            </g>
          </g>
        </svg>

        {/* Pastilles flottantes */}
        <span className="hero-chip absolute -left-3 top-24 sm:-left-8" style={{ '--d': '0s' }}>
          Diagnostic offert
        </span>
        <span className="hero-chip absolute -right-3 top-[46%] sm:-right-8" style={{ '--d': '-1.6s' }}>
          Devis avant réparation
        </span>
        <span className="hero-chip absolute -left-1 bottom-20 sm:-left-6" style={{ '--d': '-3.2s' }}>
          Suivi en ligne
        </span>
      </div>
    </div>
  );
}
