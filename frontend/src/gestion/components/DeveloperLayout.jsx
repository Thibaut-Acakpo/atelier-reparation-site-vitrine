import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, Check, ChevronsUpDown, ExternalLink, Globe, KeyRound, LayoutDashboard,
  LogOut, Menu, MessageSquareQuote, Palette, Phone, Plus, Search, Share2, ShieldCheck,
  Smartphone, Sparkles, Store, Wrench, X, Images, UserRound,
} from 'lucide-react';
import { useDeveloperAuth } from '../context/DeveloperAuthContext';
import { SelectedAtelierProvider, useAtelierGestion } from '../context/SelectedAtelierContext';
import { lienSite } from '../lib/liens';

const NAV_GLOBAL = [
  { to: '/gestion', label: 'Tableau de bord', icon: LayoutDashboard, end: true },
  { to: '/gestion/nouveau', label: 'Nouveau client', icon: Plus },
];

const NAV_CLIENT = [
  { to: '/gestion/acces', label: 'Liens & accès', icon: KeyRound },
  { to: '/gestion/identite', label: 'Identité', icon: Store },
  { to: '/gestion/apparence', label: 'Apparence', icon: Palette },
  { to: '/gestion/contact', label: 'Contact & horaires', icon: Phone },
  { to: '/gestion/services', label: 'Services', icon: Wrench },
  { to: '/gestion/appareils', label: 'Appareils', icon: Smartphone },
  { to: '/gestion/faq', label: 'FAQ', icon: MessageSquareQuote },
  { to: '/gestion/realisations', label: 'Réalisations', icon: Images },
  { to: '/gestion/reseaux-sociaux', label: 'Réseaux sociaux', icon: Share2 },
  { to: '/gestion/seo', label: 'SEO', icon: Search },
  { to: '/gestion/domaine', label: 'Domaine', icon: Globe },
];

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onClick}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-sky-500/20 to-indigo-500/10 text-white ring-1 ring-sky-400/30'
            : 'text-slate-400 hover:translate-x-1 hover:bg-slate-800/60 hover:text-white'
        }`
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </NavLink>
  );
}

function AtelierSwitcher() {
  const { ateliers, atelierSelectionne, selectionnerAtelier } = useAtelierGestion();
  const [ouvert, setOuvert] = useState(false);
  const navigate = useNavigate();

  if (!atelierSelectionne) {
    return (
      <button onClick={() => navigate('/gestion/nouveau')} className="w-full rounded-xl border border-dashed border-slate-700 px-3 py-3 text-left text-sm text-slate-400 hover:border-sky-400 hover:text-white">
        Aucun client — en créer un
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOuvert((o) => !o)}
        className="flex w-full items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-left transition hover:border-sky-400/60"
        aria-expanded={ouvert}
      >
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${atelierSelectionne.actif ? 'dev-live bg-emerald-400' : 'bg-slate-500'}`} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">{atelierSelectionne.nom}</span>
          <span className="block truncate text-xs text-slate-500">/s/{atelierSelectionne.slug}</span>
        </span>
        <ChevronsUpDown className="h-4 w-4 text-slate-500" />
      </button>

      {ouvert && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOuvert(false)} />
          <ul className="dev-toast absolute left-0 right-0 z-40 mt-2 max-h-72 overflow-auto rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl">
            {ateliers.map((a) => (
              <li key={a.id}>
                <button
                  onClick={() => { selectionnerAtelier(a); setOuvert(false); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                >
                  <span className="flex-1 truncate">{a.nom}</span>
                  {!a.actif && <span className="text-xs text-slate-500">désactivé</span>}
                  {a.id === atelierSelectionne.id && <Check className="h-4 w-4 text-sky-400" />}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function Shell() {
  const { developer, logout } = useDeveloperAuth();
  const { atelierSelectionne } = useAtelierGestion();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const location = useLocation();

  // Les accolades sont volontaires : un effet ne doit rien retourner.
  useEffect(() => {
    setMenuOuvert(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const sidebar = (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg shadow-sky-500/30">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="dev-glow-text text-base font-bold leading-tight">Studio développeur</p>
          <p className="text-xs text-slate-500">Sites &amp; gestion clients</p>
        </div>
      </div>

      <nav className="space-y-1">
        {NAV_GLOBAL.map((i) => <NavItem key={i.to} item={i} />)}
      </nav>

      <div>
        <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Client en cours</p>
        <AtelierSwitcher />
        {atelierSelectionne && (
          <nav className="mt-3 space-y-1">
            {NAV_CLIENT.map((i) => <NavItem key={i.to} item={i} />)}
          </nav>
        )}
      </div>

      <div className="mt-auto space-y-3 border-t border-slate-800 pt-4">
        <div className="flex items-center gap-3 px-1">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-800 text-slate-300"><UserRound className="h-4 w-4" /></div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{developer?.nom}</p>
            <p className="truncate text-xs text-slate-500">{developer?.email}</p>
          </div>
        </div>
        <button onClick={logout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300">
          <LogOut className="h-4 w-4" /> Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="dev-root relative min-h-screen">
      <div className="dev-bg" aria-hidden="true">
        <div className="dev-blob -left-24 top-0 h-96 w-96 bg-sky-500" />
        <div className="dev-blob right-0 top-1/3 h-[28rem] w-[28rem] bg-indigo-600" style={{ animationDelay: '-6s' }} />
      </div>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-800/80 bg-slate-950/80 backdrop-blur-xl lg:block">
        {sidebar}
      </aside>

      {menuOuvert && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMenuOuvert(false)} />
          <aside className="dev-toast absolute inset-y-0 left-0 w-72 border-r border-slate-800 bg-slate-950">{sidebar}</aside>
        </div>
      )}

      <div className="relative z-10 lg:pl-72">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/70 px-4 py-3 backdrop-blur-xl sm:px-8">
          <button className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 lg:hidden" onClick={() => setMenuOuvert((o) => !o)} aria-label="Menu">
            {menuOuvert ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="min-w-0 flex-1 text-sm text-slate-400">
            {atelierSelectionne ? <>Client : <span className="font-semibold text-white">{atelierSelectionne.nom}</span></> : 'Aucun client sélectionné'}
          </div>
          {atelierSelectionne && (
            <a
              href={lienSite(atelierSelectionne)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3.5 py-2 text-sm font-medium text-slate-200 transition hover:border-sky-400 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">Ouvrir le site</span>
            </a>
          )}
          <ShieldCheck className="hidden h-5 w-5 text-emerald-400 sm:block" aria-label="Session sécurisée" />
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8"><Outlet /></main>
      </div>
    </div>
  );
}

export default function DeveloperLayout() {
  return (
    <SelectedAtelierProvider>
      <Shell />
    </SelectedAtelierProvider>
  );
}
