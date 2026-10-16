import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { gestionApi } from '../api';

const SelectedAtelierContext = createContext(null);
const SELECTION_KEY = 'gestion_atelier_selectionne';

export function SelectedAtelierProvider({ children }) {
  const [ateliers, setAteliers] = useState([]);
  const [selectionId, setSelectionId] = useState(() => localStorage.getItem(SELECTION_KEY));
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState('');

  const recharger = useCallback(async () => {
    const res = await gestionApi.ateliers();
    if (res.success && Array.isArray(res.data)) {
      setAteliers(res.data);
      setErreur('');
    } else {
      setErreur(res.message || 'Impossible de charger les ateliers.');
    }
    setChargement(false);
    return res;
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  // Atelier sélectionné : celui mémorisé s'il existe encore, sinon le premier.
  const atelierSelectionne = useMemo(
    () =>
      ateliers.find((a) => String(a.id) === String(selectionId)) || ateliers[0] || null,
    [ateliers, selectionId]
  );

  const selectionnerAtelier = useCallback((atelier) => {
    const id = String(atelier.id);
    setSelectionId(id);
    localStorage.setItem(SELECTION_KEY, id);
  }, []);

  const value = useMemo(
    () => ({
      ateliers,
      atelierSelectionne,
      selectionnerAtelier,
      recharger,
      chargement,
      erreur,
    }),
    [ateliers, atelierSelectionne, selectionnerAtelier, recharger, chargement, erreur]
  );

  return (
    <SelectedAtelierContext.Provider value={value}>
      {children}
    </SelectedAtelierContext.Provider>
  );
}

export function useAtelierGestion() {
  const ctx = useContext(SelectedAtelierContext);
  if (!ctx) {
    throw new Error('useAtelierGestion doit être utilisé à l’intérieur de SelectedAtelierProvider.');
  }
  return ctx;
}
