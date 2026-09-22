import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { admin, login } = useAuth();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnCours(true);
    const res = await login(email.trim().toLowerCase(), motDePasse);
    setEnCours(false);
    if (!res.success) setErreur(res.message || 'Connexion impossible.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bleu-nuit px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-bleu-technique/10 text-bleu-technique">
          <Lock size={22} aria-hidden="true" />
        </div>
        <h1 className="mt-4 text-center font-titre text-xl font-bold text-bleu-nuit">Espace administrateur</h1>
        <p className="mt-1 text-center text-sm text-gris-texte">Connectez-vous pour accéder au tableau de bord.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-bleu-nuit">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="mot_de_passe" className="mb-1.5 block text-sm font-medium text-bleu-nuit">
              Mot de passe
            </label>
            <input
              id="mot_de_passe"
              type="password"
              required
              autoComplete="current-password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              className="input-field"
            />
          </div>

          {erreur && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700" role="alert">
              {erreur}
            </p>
          )}

          <button type="submit" className="btn-primary w-full" disabled={enCours}>
            {enCours ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}
