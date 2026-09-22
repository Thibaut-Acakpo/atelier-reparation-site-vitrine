export function AdminPageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-titre text-2xl font-bold text-bleu-nuit">{title}</h1>
        {description && <p className="mt-1 text-sm text-gris-texte">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = 'default' }) {
  const tones = {
    default: 'bg-gray-100 text-gray-700',
    info: 'bg-bleu-technique/10 text-bleu-technique',
    warning: 'bg-amber-100 text-amber-800',
    success: 'bg-emerald-100 text-emerald-700',
    danger: 'bg-red-100 text-red-700',
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function Card({ children, className = '' }) {
  return <div className={`rounded-2xl bg-white p-5 shadow-sm ring-1 ring-bleu-nuit/5 ${className}`}>{children}</div>;
}

export function EmptyState({ message }) {
  return <p className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gris-texte">{message}</p>;
}

export function LoadingState() {
  return <p className="p-8 text-center text-sm text-gris-texte">Chargement…</p>;
}

export function AccesRefuse({ message = "Cette section est réservée au compte \"Technicien\"." }) {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-center text-sm text-amber-900">
      {message}
    </div>
  );
}
