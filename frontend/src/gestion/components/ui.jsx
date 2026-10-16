import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, Loader2, X, XCircle } from 'lucide-react';

// ---------------------------------------------------------------------------
// Animations
// ---------------------------------------------------------------------------

export function Reveal({ children, delay = 0, className = '' }) {
  return (
    <div className={`dev-reveal ${className}`} style={{ '--d': `${delay}ms` }}>
      {children}
    </div>
  );
}

// Carte qui s'incline en 3D selon la position de la souris.
export function TiltCard({ children, className = '', max = 6, ...props }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${px * max}deg`);
    el.style.setProperty('--rx', `${-py * max}deg`);
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`dev-tilt ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CountUp({ value = 0, duration = 900 }) {
  const [affiche, setAffiche] = useState(0);

  useEffect(() => {
    const cible = Number(value) || 0;
    if (cible === 0) {
      setAffiche(0);
      return undefined;
    }
    let raf;
    const debut = performance.now();
    const tick = (t) => {
      const p = Math.min((t - debut) / duration, 1);
      setAffiche(Math.round(cible * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <>{affiche}</>;
}

// ---------------------------------------------------------------------------
// Mise en page
// ---------------------------------------------------------------------------

export function PageHeader({ titre, description, actions }) {
  return (
    <Reveal className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{titre}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </Reveal>
  );
}

export function Panel({ titre, description, children, className = '', delay = 0 }) {
  return (
    <Reveal delay={delay}>
      <section
        className={`rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl shadow-black/20 backdrop-blur sm:p-6 ${className}`}
      >
        {(titre || description) && (
          <header className="mb-5">
            {titre && <h2 className="text-lg font-semibold text-white">{titre}</h2>}
            {description && <p className="mt-1 text-sm text-slate-400">{description}</p>}
          </header>
        )}
        {children}
      </section>
    </Reveal>
  );
}

// ---------------------------------------------------------------------------
// Formulaires
// ---------------------------------------------------------------------------

export function Field({ label, hint, error, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      {label && <span className="mb-1.5 block text-sm font-medium text-slate-200">{label}</span>}
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-rose-400">{error}</span>}
    </label>
  );
}

export function Input(props) {
  return <input {...props} className={`dev-input ${props.className || ''}`} />;
}

export function Textarea(props) {
  return <textarea rows={3} {...props} className={`dev-input resize-y ${props.className || ''}`} />;
}

const VARIANTES = {
  primary:
    'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg shadow-sky-500/20 hover:from-sky-400 hover:to-indigo-400 hover:-translate-y-0.5',
  secondary: 'border border-slate-700 bg-slate-800/70 text-slate-100 hover:border-slate-500 hover:bg-slate-800',
  ghost: 'text-slate-300 hover:bg-slate-800/70 hover:text-white',
  danger: 'border border-rose-500/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
};

export function Button({ variant = 'primary', loading = false, icon: Icon, children, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={props.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 ${VARIANTES[variant]} ${className}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-700/50 text-slate-300 border-slate-600/50',
    green: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    amber: 'bg-amber-500/10 text-amber-300 border-amber-500/30',
    red: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
    blue: 'bg-sky-500/10 text-sky-300 border-sky-500/30',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Alert({ tone = 'info', children }) {
  const tones = {
    info: 'border-sky-500/30 bg-sky-500/10 text-sky-200',
    warn: 'border-amber-500/30 bg-amber-500/10 text-amber-200',
    error: 'border-rose-500/30 bg-rose-500/10 text-rose-200',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200',
  };
  return <div className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>{children}</div>;
}

export function Spinner({ label = 'Chargement…' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function EmptyState({ titre, description, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-700 px-6 py-12 text-center">
      <p className="font-semibold text-white">{titre}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}

export function CopyButton({ valeur, label = 'Copier', className = '' }) {
  const [copie, setCopie] = useState(false);

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(valeur);
    } catch {
      const t = document.createElement('textarea');
      t.value = valeur;
      document.body.appendChild(t);
      t.select();
      document.execCommand('copy');
      t.remove();
    }
    setCopie(true);
    setTimeout(() => setCopie(false), 1800);
  };

  return (
    <Button type="button" variant="secondary" onClick={copier} icon={copie ? Check : Copy} className={className}>
      {copie ? 'Copié !' : label}
    </Button>
  );
}

// ---------------------------------------------------------------------------
// Confirmation modale
// ---------------------------------------------------------------------------

export function ConfirmModal({ ouvert, titre, children, confirmLabel = 'Confirmer', danger = false, loading = false, disabled = false, onConfirm, onCancel }) {
  useEffect(() => {
    if (!ouvert) return undefined;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ouvert, onCancel]);

  if (!ouvert) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={titre}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="dev-toast relative w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          {danger && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />}
          <h3 className="text-lg font-semibold text-white">{titre}</h3>
        </div>
        <div className="text-sm text-slate-300">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancel}>Annuler</Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={loading} disabled={disabled} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function demanderConfirmation({ titre, message, confirmLabel = 'Confirmer', danger = false }) {
  if (typeof window === 'undefined') return Promise.resolve(false);

  return new Promise((resolve) => {
    const event = new CustomEvent('app-confirm', {
      cancelable: true,
      detail: { titre, message, confirmLabel, danger, resolve },
    });
    if (window.dispatchEvent(event)) resolve(false);
  });
}

export function confirmerMutation(method, path, body) {
  const action = method.toUpperCase();
  const chemin = path.split('?')[0];
  let titre = 'Confirmer l’action';
  let message = 'Voulez-vous vraiment enregistrer ces modifications ?';
  let confirmLabel = 'Enregistrer';
  let danger = false;

  if (action === 'DELETE') {
    titre = 'Confirmer la suppression';
    message = 'Voulez-vous vraiment supprimer cet élément ?';
    confirmLabel = 'Supprimer';
    danger = true;
  } else if (/\/convertir$/.test(chemin)) {
    titre = 'Convertir la demande';
    message = 'Voulez-vous vraiment convertir cette demande en fiche de réparation ?';
    confirmLabel = 'Convertir';
  } else if (/\/reinitialiser$/.test(chemin)) {
    titre = 'Réinitialiser le compte';
    message = 'Voulez-vous vraiment générer un nouveau mot de passe pour ce compte ?';
    confirmLabel = 'Générer';
  } else if (/\/statut$/.test(chemin) && body?.actif !== undefined) {
    titre = body.actif ? 'Réactiver le site' : 'Désactiver le site';
    message = body.actif
      ? 'Voulez-vous vraiment réactiver ce site ?'
      : 'Voulez-vous vraiment désactiver ce site ?';
    confirmLabel = body.actif ? 'Réactiver' : 'Désactiver';
    danger = !body.actif;
  } else if (/\/comptes\/[^/]+$/.test(chemin) && body?.actif !== undefined) {
    titre = body.actif ? 'Activer le compte' : 'Désactiver le compte';
    message = body.actif
      ? 'Voulez-vous vraiment activer ce compte ?'
      : 'Voulez-vous vraiment désactiver ce compte ?';
    confirmLabel = body.actif ? 'Activer' : 'Désactiver';
    danger = !body.actif;
  } else if (body?.statut_traitement === 'refusee') {
    titre = 'Refuser la demande';
    message = 'Voulez-vous vraiment refuser cette demande de réparation ?';
    confirmLabel = 'Refuser';
    danger = true;
  } else if (body?.devis_decision) {
    titre = 'Confirmer la décision sur le devis';
    message = `Voulez-vous vraiment marquer le devis comme « ${body.devis_decision} » ?`;
    confirmLabel = 'Confirmer';
  } else if (chemin.endsWith('/api/demandes-reparation')) {
    titre = 'Envoyer la demande';
    message = 'Voulez-vous vraiment envoyer cette demande de réparation ?';
    confirmLabel = 'Envoyer la demande';
  } else if (chemin.endsWith('/api/rendez-vous')) {
    titre = 'Envoyer la demande de rendez-vous';
    message = 'Voulez-vous vraiment envoyer cette demande de rendez-vous ?';
    confirmLabel = 'Envoyer';
  } else if (chemin.endsWith('/api/contact')) {
    titre = 'Envoyer le message';
    message = 'Voulez-vous vraiment envoyer ce message ?';
    confirmLabel = 'Envoyer';
  } else if (chemin.endsWith('/api/avis')) {
    titre = 'Envoyer l’avis';
    message = 'Voulez-vous vraiment envoyer cet avis ?';
    confirmLabel = 'Envoyer';
  } else if (/\/ateliers$/.test(chemin)) {
    titre = 'Créer le client';
    message = 'Voulez-vous vraiment créer ce client et son site ?';
    confirmLabel = 'Créer le client';
  } else if (action === 'POST') {
    titre = 'Confirmer l’ajout';
    message = 'Voulez-vous vraiment ajouter ces informations ?';
    confirmLabel = 'Ajouter';
  }

  return demanderConfirmation({ titre, message, confirmLabel, danger });
}

// ---------------------------------------------------------------------------
// Notifications (toasts)
// ---------------------------------------------------------------------------

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  const ajouter = useCallback((type, message) => {
    if (!message) return;
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  const api = useRef({
    succes: (m) => ajouter('succes', m),
    erreur: (m) => ajouter('erreur', m),
  }).current;

  useEffect(() => {
    const recevoirToast = (event) => {
      const { type, message } = event.detail || {};
      if (!message) return;
      if (type === 'erreur') api.erreur(message);
      else api.succes(message);
    };

    window.addEventListener('app-toast', recevoirToast);
    return () => window.removeEventListener('app-toast', recevoirToast);
  }, [api]);

  useEffect(() => {
    const recevoirConfirmation = (event) => {
      event.preventDefault();
      setConfirmation(event.detail);
    };

    window.addEventListener('app-confirm', recevoirConfirmation);
    return () => window.removeEventListener('app-confirm', recevoirConfirmation);
  }, []);

  const terminerConfirmation = (confirmer) => {
    confirmation?.resolve(confirmer);
    setConfirmation(null);
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-[60] flex w-full max-w-sm flex-col gap-3 px-4 sm:px-0" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`dev-toast pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${
              t.type === 'succes'
                ? 'border-emerald-500/40 bg-emerald-950/90 text-emerald-100'
                : 'border-rose-500/40 bg-rose-950/90 text-rose-100'
            }`}
          >
            {t.type === 'succes' ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <XCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts((l) => l.filter((x) => x.id !== t.id))} aria-label="Fermer">
              <X className="h-4 w-4 opacity-60 hover:opacity-100" />
            </button>
          </div>
        ))}
      </div>
      <ConfirmModal
        ouvert={!!confirmation}
        titre={confirmation?.titre}
        confirmLabel={confirmation?.confirmLabel}
        danger={confirmation?.danger}
        onConfirm={() => terminerConfirmation(true)}
        onCancel={() => terminerConfirmation(false)}
      >
        <p>{confirmation?.message}</p>
      </ConfirmModal>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
