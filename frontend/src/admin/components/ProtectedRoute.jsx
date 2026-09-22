import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { admin, chargement } = useAuth();

  if (chargement) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gris-clair">
        <p className="text-gris-texte">Chargement…</p>
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/connexion" replace />;
  }

  return children;
}
