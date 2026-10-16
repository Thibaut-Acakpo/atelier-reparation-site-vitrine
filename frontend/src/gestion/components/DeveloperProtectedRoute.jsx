import { Navigate } from 'react-router-dom';
import { useDeveloperAuth } from '../context/DeveloperAuthContext';

export default function DeveloperProtectedRoute({
  children,
}) {
  const {
    developer,
    chargement,
  } = useDeveloperAuth();

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Vérification de la session...
      </div>
    );
  }

  if (!developer) {
    return (
      <Navigate
        to="/gestion/connexion"
        replace
      />
    );
  }

  return children;
}