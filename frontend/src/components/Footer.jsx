import { Link } from 'react-router-dom';
import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Lock,
} from 'lucide-react';

import { NAV_LINKS, whatsappLink } from '../data/constants';
import { useAtelier } from '../context/AtelierContext';

const RESEAUX = [
  ['facebook', 'Facebook'],
  ['instagram', 'Instagram'],
  ['tiktok', 'TikTok'],
  ['youtube', 'YouTube'],
  ['linkedin', 'LinkedIn'],
  ['x', 'X'],
];

export default function Footer() {
  const { atelier } = useAtelier();

  return (
    <footer className="bg-bleu-nuit text-white/85">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-titre text-lg font-bold text-white">
            {atelier.nom}
          </p>

          <p className="mt-3 text-sm leading-relaxed text-white/70">
            {atelier.slogan}
          </p>

          {RESEAUX.some(([cle]) => atelier[cle]) && (
            <ul className="mt-5 flex flex-wrap gap-2" aria-label="Réseaux sociaux">
              {RESEAUX.filter(([cle]) => atelier[cle]).map(([cle, label]) => (
                <li key={cle}>
                  <a
                    href={atelier[cle]}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="rounded-full border border-white/20 px-3 py-1 text-xs hover:border-white hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <p className="font-titre text-sm font-semibold uppercase tracking-wide text-or-discret">
            Navigation
          </p>

          <ul className="mt-4 space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-titre text-sm font-semibold uppercase tracking-wide text-or-discret">
            Contact
          </p>

          <ul className="mt-4 space-y-3 text-sm">
            {(atelier.adresse) && (
              <li className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="mt-0.5 shrink-0"
                  aria-hidden="true"
                />

                <span>{atelier.adresse}</span>
              </li>
            )}

            {(atelier.telephone) && (
              <li className="flex items-center gap-2">
                <Phone
                  size={16}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <a
                  href={`tel:${(atelier.telephone || '').replace(/\s/g, '')}`}
                  className="hover:text-white"
                >
                  {atelier.telephone}
                </a>
              </li>
            )}

            {(atelier.whatsapp) && (
              <li className="flex items-center gap-2">
                <MessageCircle
                  size={16}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <a
                  href={whatsappLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  WhatsApp
                </a>
              </li>
            )}

            {(atelier.email) && (
              <li className="flex items-center gap-2">
                <Mail
                  size={16}
                  className="shrink-0"
                  aria-hidden="true"
                />

                <a
                  href={`mailto:${atelier.email}`}
                  className="hover:text-white"
                >
                  {atelier.email}
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <p className="font-titre text-sm font-semibold uppercase tracking-wide text-or-discret">
            Horaires
          </p>

          <ul className="mt-4 space-y-2 text-sm">
            {atelier.horaires.map((h) => (
              <li
                key={h.jours}
                className="flex justify-between gap-4"
              >
                <span>{h.jours}</span>
                <span className="text-white/70">
                  {h.heures}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
          <p>
            &copy; {new Date().getFullYear()} {atelier.nom}.
            Tous droits réservés.
          </p>

          <div className="flex items-center gap-4">
            <Link
              to="/confidentialite"
              className="hover:text-white"
            >
              Politique de confidentialité
            </Link>

            <Link
              to="/conditions"
              className="hover:text-white"
            >
              Conditions d&apos;utilisation
            </Link>

            <Link
              to="/admin/connexion"
              className="flex items-center gap-1 hover:text-white"
            >
              <Lock
                size={12}
                aria-hidden="true"
              />
              Espace technicien
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}