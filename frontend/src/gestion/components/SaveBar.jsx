import { Save } from 'lucide-react';
import { Button } from './ui';

// Barre d'enregistrement collée en bas : visible seulement s'il y a des modifications.
export default function SaveBar({ modifie, enregistrement, onSave }) {
  return (
    <div
      className={`sticky bottom-4 z-20 mt-8 transition-all duration-300 ${
        modifie ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-sky-500/30 bg-slate-900/95 px-5 py-3 shadow-2xl shadow-sky-500/10 backdrop-blur">
        <span className="text-sm text-slate-300">Vous avez des modifications non enregistrées.</span>
        <Button icon={Save} loading={enregistrement} onClick={onSave}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
