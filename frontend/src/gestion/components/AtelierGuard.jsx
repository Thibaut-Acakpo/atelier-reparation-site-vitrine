import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAtelierGestion } from '../context/SelectedAtelierContext';
import { EmptyState, Spinner } from './ui';

// Affiche les pages « par client » uniquement lorsqu'un client est sélectionné.
export default function AtelierGuard({ children }) {
  const { atelierSelectionne, chargement } = useAtelierGestion();

  if (chargement) return <Spinner />;

  if (!atelierSelectionne) {
    return (
      <EmptyState
        titre="Aucun client pour l’instant"
        description="Créez votre premier client pour générer son site vitrine et son espace de gestion."
        action={
          <Link to="/gestion/nouveau" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white">
            <Plus className="h-4 w-4" /> Nouveau client
          </Link>
        }
      />
    );
  }

  // `key` : le formulaire est réinitialisé quand on change de client.
  return <div key={atelierSelectionne.id}>{children(atelierSelectionne)}</div>;
}
