import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  clearDevToken,
  getDevToken,
  gestionApi,
  setDevToken,
} from '../api';
import { demanderConfirmation } from '../components/ui';

const DeveloperAuthContext = createContext(null);

export function DeveloperAuthProvider({ children }) {
  const [developer, setDeveloper] = useState(null);
  const [chargement, setChargement] = useState(true);

  const verifierSession = useCallback(async () => {
    if (!getDevToken()) {
      setDeveloper(null);
      setChargement(false);
      return;
    }

    const res = await gestionApi.me();
    if (res.success) {
      setDeveloper(res.data.developer);
    } else {
      clearDevToken();
      setDeveloper(null);
    }
    setChargement(false);
  }, []);

  useEffect(() => {
    verifierSession();
  }, [verifierSession]);

  const login = async (email, motDePasse) => {
    const res = await gestionApi.login(email, motDePasse);
    if (res.success) {
      setDevToken(res.data.token);
      setDeveloper(res.data.developer);
    }
    return res;
  };

  const logout = async () => {
    const confirme = await demanderConfirmation({
      titre: 'Déconnexion',
      message: 'Voulez-vous vraiment vous déconnecter ?',
      confirmLabel: 'Se déconnecter',
    });
    if (!confirme) return;
    clearDevToken();
    setDeveloper(null);
  };

  return (
    <DeveloperAuthContext.Provider value={{ developer, chargement, login, logout }}>
      {children}
    </DeveloperAuthContext.Provider>
  );
}

export function useDeveloperAuth() {
  const ctx = useContext(DeveloperAuthContext);
  if (!ctx) {
    throw new Error('useDeveloperAuth doit être utilisé à l’intérieur de DeveloperAuthProvider.');
  }
  return ctx;
}
