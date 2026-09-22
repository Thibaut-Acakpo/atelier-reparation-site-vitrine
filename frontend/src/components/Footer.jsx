import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, MessageCircle, Lock } from 'lucide-react';
import { ATELIER, NAV_LINKS, whatsappLink } from '../data/constants';

export default function Footer() {
  return (
    <footer className="bg-bleu-nuit text-white/85">
      <div className="container-site grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-titre text-lg font-bold text-white">{ATELIER.nom}</p>
          <p className="mt-3 text-sm leading-relaxed text-white/70">{ATELIER.slogan}</p>
        </div>

        <div>
          <p className="font-titre text-sm font-semibold uppercase tracking-wide text-or-discret">Navigation</p>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="font-titre text-sm font-semibold uppercase tracking-wide text-or-discret">Contact</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{ATELIER.adresse}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="shrink-0" aria-hidden="true" />
              <a href={`tel:${ATELIER.telephone.replace(/\s/g, '')}`} className="hover:text-white">
                {ATELIER.telephone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MessageCircle size={16} className="shrink-0" aria-hidden="true" />
              <a href={whatsappLink()} target="_blank" rel="noreferrer" className="hover:text-white">
                WhatsApp
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="shrink-0" aria-hidden="true" />
              <a href={`mailto:${ATELIER.email}`} className="hover:text-white">
                {ATELIER.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="font-titre text-sm font-semibold uppercase tracking-wide text-or-discret">Horaires</p>
          <ul className="mt-4 space-y-2 text-sm">
            {ATELIER.horaires.map((h) => (
              <li key={h.jours} className="flex justify-between gap-4">
                <span>{h.jours}</span>
                <span className="text-white/70">{h.heures}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} {ATELIER.nom}. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <Link to="/confidentialite" className="hover:text-white">
              Politique de confidentialité
            </Link>
            <Link to="/conditions" className="hover:text-white">
              Conditions d&apos;utilisation
            </Link>
            <Link to="/admin/connexion" className="flex items-center gap-1 hover:text-white">
              <Lock size={12} aria-hidden="true" />
              Espace technicien
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
