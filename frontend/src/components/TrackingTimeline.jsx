import { CheckCircle2, Circle } from 'lucide-react';

const ORDRE_STATUTS = [
  'Demande reçue',
  'Appareil attendu',
  'Appareil reçu',
  'Diagnostic en cours',
  'Diagnostic terminé',
  "Devis en attente d'acceptation",
  'Réparation autorisée',
  'Réparation en cours',
  "En attente d'une pièce",
  'Réparation terminée',
  'Appareil prêt à récupérer',
  'Appareil récupéré',
];

export default function TrackingTimeline({ statutActuel, historique = [] }) {
  const indexActuel = ORDRE_STATUTS.indexOf(statutActuel);
  const estStatutHorsSequence = indexActuel === -1; // ex. "Réparation impossible/annulée"

  if (estStatutHorsSequence) {
    return (
      <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
        <p className="font-semibold">Statut actuel : {statutActuel}</p>
        <p className="mt-1 text-sm">Contactez l&apos;atelier pour plus de détails sur cette réparation.</p>
      </div>
    );
  }

  return (
    <ol className="relative ml-3 space-y-6 border-l-2 border-gray-200 pl-6">
      {ORDRE_STATUTS.map((statut, i) => {
        const atteint = i <= indexActuel;
        const estActuel = i === indexActuel;
        const entreeHistorique = historique.find((h) => h.statut === statut);
        return (
          <li key={statut} className="relative">
            <span
              className={`absolute -left-[calc(1.5rem+9px)] flex h-5 w-5 items-center justify-center rounded-full ${
                atteint ? 'bg-bleu-technique text-white' : 'bg-white text-gray-300 ring-2 ring-gray-200'
              }`}
            >
              {atteint ? <CheckCircle2 size={14} /> : <Circle size={10} />}
            </span>
            <p className={`font-titre font-semibold ${estActuel ? 'text-bleu-technique' : atteint ? 'text-bleu-nuit' : 'text-gray-400'}`}>
              {statut}
            </p>
            {entreeHistorique?.commentaire && (
              <p className="mt-0.5 text-sm text-gris-texte">{entreeHistorique.commentaire}</p>
            )}
            {entreeHistorique?.created_at && (
              <p className="mt-0.5 text-xs text-gray-400">{entreeHistorique.created_at}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
