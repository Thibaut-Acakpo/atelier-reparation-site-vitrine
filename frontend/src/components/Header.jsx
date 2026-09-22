import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Wrench } from 'lucide-react';
import { NAV_LINKS, ATELIER } from '../data/constants';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? 'bg-bleu-nuit/95 shadow-md backdrop-blur' : 'bg-bleu-nuit'
      }`}
    >
      <div className="container-site flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-titre text-lg font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-or-discret/90 text-bleu-nuit">
            <Wrench size={18} strokeWidth={2.5} aria-hidden="true" />
          </span>
          <span className="hidden sm:inline">{ATELIER.nom}</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'text-or-discret' : 'text-white/85 hover:text-white'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link to="/suivi" className="btn-or px-4 py-2 text-sm">
            Suivre ma réparation
          </Link>
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-white lg:hidden"
          aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div
        className={`overflow-hidden bg-bleu-nuit transition-[max-height] duration-300 ease-in-out lg:hidden ${
          open ? 'max-h-96' : 'max-h-0'
        }`}
      >
        <nav className="container-site flex flex-col gap-1 pb-4" aria-label="Navigation mobile">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-2.5 text-base font-medium ${isActive ? 'text-or-discret' : 'text-white/90'}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
