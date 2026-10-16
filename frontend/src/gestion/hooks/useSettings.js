import { useCallback, useEffect, useState } from 'react';
import { gestionApi } from '../api';
import { useToast } from '../components/ui';

// Charge et enregistre les paramètres d'un client. `cles` limite ce que la page
// envoie au serveur (chaque page ne modifie que ses propres champs).
export function useSettings(atelierId, cles) {
  const toast = useToast();
  const [valeurs, setValeurs] = useState({});
  const [initial, setInitial] = useState({});
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);

  useEffect(() => {
    let annule = false;
    (async () => {
      setChargement(true);
      const res = await gestionApi.settings(atelierId);
      if (annule) return;
      if (res.success) {
        const extrait = {};
        for (const c of cles) extrait[c] = res.data[c] ?? (c === 'horaires' ? [] : '');
        setValeurs(extrait);
        setInitial(extrait);
      } else {
        toast.erreur(res.message || 'Chargement impossible.');
      }
      setChargement(false);
    })();
    return () => {
      annule = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [atelierId]);

  const setChamp = useCallback((cle, valeur) => {
    setValeurs((v) => ({ ...v, [cle]: valeur }));
  }, []);

  const modifie = JSON.stringify(valeurs) !== JSON.stringify(initial);

  const enregistrer = useCallback(async () => {
    setEnregistrement(true);
    const res = await gestionApi.majSettings(atelierId, valeurs);
    setEnregistrement(false);
    if (res.success) {
      setInitial(valeurs);
      toast.succes('Modifications enregistrées.');
    } else {
      toast.erreur(res.message || 'Enregistrement impossible.');
    }
    return res;
  }, [atelierId, valeurs, toast]);

  return { valeurs, setChamp, chargement, enregistrement, enregistrer, modifie };
}
