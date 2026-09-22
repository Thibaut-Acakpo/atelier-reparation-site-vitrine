import { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  CalendarClock,
  Wrench,
  Users,
  Star,
  Mail,
  Images,
  FileText,
  Package,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LIENS = [
  { to: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/admin/demandes', label: 'Demandes', icon: Inbox },
  { to: '/admin/rendez-vous', label: 'Rendez-vous', icon: CalendarClock },
  { to: '/admin/reparations', label: 'Réparations', icon: Wrench },
  { to: '/admin/clients', label: 'Clients', icon: Users },
  { to: '/admin/avis', label: 'Avis clients', icon: Star },
  { to: '/admin/contacts', label: 'Messages', icon: Mail },
  { to: '/admin/realisations', label: 'Réalisations', icon: Images },
  // Réservé au compte "Technicien" — l'Assistant technicien n'y a même pas
  // accès côté API, inutile de lui montrer le lien.
  { to: '/admin/contenu', label: 'Contenu du site', icon: FileText, roles: ['technicien'] },
  { to: '/admin/pieces', label: 'Catalogue de pièces', icon: Package },
];

const LABEL_ROLE = { technicien: 'Technicien', assistant: 'Assistant technicien' };

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const [menuOuvert, setMenuOuvert] = useState(false);

  const liensVisibles = LIENS.filter((lien) => !lien.roles || lien.roles.includes(admin?.role));

  const NavContent = (
    <>
      <div className="px-5 py-6">
        <p className="font-titre text-lg font-bold text-white">Espace admin</p>
        <p className="mt-0.5 text-xs text-white/50">Atelier de réparation électronique</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {liensVisibles.map((lien) => (
          <NavLink
            key={lien.to}
            to={lien.to}
            end={lien.end}
            onClick={() => setMenuOuvert(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'bg-bleu-technique text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <lien.icon size={18} aria-hidden="true" />
            {lien.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <Link to="/" target="_blank" className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/60 hover:bg-white/5 hover:text-white">
          <ExternalLink size={16} aria-hidden="true" /> Voir le site
        </Link>
        <div className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{admin?.nom}</p>
            <p className="truncate text-xs text-white/50">{LABEL_ROLE[admin?.role] || admin?.email}</p>
          </div>
          <button type="button" onClick={logout} aria-label="Se déconnecter" className="ml-2 shrink-0 rounded-md p-1.5 text-white/60 hover:bg-white/10 hover:text-white">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gris-clair">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-bleu-nuit lg:flex">{NavContent}</aside>

      {/* Sidebar mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${menuOuvert ? '' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity ${menuOuvert ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setMenuOuvert(false)}
        />
        <aside
          className={`absolute inset-y-0 left-0 flex w-64 flex-col bg-bleu-nuit transition-transform duration-300 ${
            menuOuvert ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {NavContent}
        </aside>
      </div>

      {/* Top bar mobile */}
      <div className="sticky top-0 z-40 flex items-center justify-between bg-bleu-nuit px-4 py-3 lg:hidden">
        <p className="font-titre font-bold text-white">Espace admin</p>
        <button type="button" onClick={() => setMenuOuvert(true)} aria-label="Ouvrir le menu" className="text-white">
          <Menu size={24} />
        </button>
      </div>
      {menuOuvert && (
        <button
          type="button"
          onClick={() => setMenuOuvert(false)}
          aria-label="Fermer le menu"
          className="fixed right-4 top-4 z-[60] text-white lg:hidden"
        >
          <X size={24} />
        </button>
      )}

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
