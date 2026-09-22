import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { adminApi, getToken, setToken, clearToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [chargement, setChargement] = useState(true);

  const verifierSession = useCallback(async () => {
    if (!getToken()) {
      setAdmin(null);
      setChargement(false);
      return;
    }
    const res = await adminApi.me();
    if (res.success) {
      setAdmin(res.data.admin);
    } else {
      clearToken();
      setAdmin(null);
    }
    setChargement(false);
  }, []);

  useEffect(() => {
    verifierSession();
  }, [verifierSession]);

  const login = async (email, motDePasse) => {
    const res = await adminApi.login(email, motDePasse);
    if (res.success) {
      setToken(res.data.token);
      setAdmin(res.data.admin);
    }
    return res;
  };

  const logout = () => {
    clearToken();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, chargement, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans un AuthProvider');
  return ctx;
}
