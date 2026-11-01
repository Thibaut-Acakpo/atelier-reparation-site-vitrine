import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Lock, Mail, Sparkles, Eye, EyeOff } from 'lucide-react'; // Ajout de Eye et EyeOff
import { useDeveloperAuth } from '../context/DeveloperAuthContext';
import { Alert, Button, Field, Input, TiltCard } from '../components/ui';

export default function Login() {
  const { developer, chargement, login } = useDeveloperAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [connexion, setConnexion] = useState(false);
  
  // Nouvel état pour afficher/cacher le mot de passe
  const [showPassword, setShowPassword] = useState(false);

  if (chargement) return <div className="dev-root grid min-h-screen place-items-center">Chargement…</div>;
  if (developer) return <Navigate to="/gestion" replace />;

  const soumettre = async (e) => {
    e.preventDefault();
    setErreur('');
    setConnexion(true);
    const res = await login(email.trim(), motDePasse);
    setConnexion(false);
    if (res.success) navigate('/gestion', { replace: true });
    else setErreur(res.message || 'Connexion impossible.');
  };

  return (
    <div className="dev-root relative grid min-h-screen place-items-center overflow-hidden px-4">
      <div className="dev-bg" aria-hidden="true">
        <div className="dev-blob left-10 top-10 h-96 w-96 bg-sky-500" />
        <div className="dev-blob bottom-0 right-10 h-[26rem] w-[26rem] bg-indigo-600" style={{ animationDelay: '-8s' }} />
      </div>

      <TiltCard className="dev-reveal relative z-10 w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/70 p-8 shadow-2xl backdrop-blur-xl" max={4}>
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-500 shadow-lg shadow-sky-500/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="dev-glow-text text-2xl font-bold">Studio développeur</h1>
          <p className="mt-2 text-sm text-slate-400">Connectez-vous pour gérer vos sites clients.</p>
        </div>

        <form onSubmit={soumettre} className="space-y-5">
          {erreur && <Alert tone="error">{erreur}</Alert>}
          
          <Field label="Adresse e-mail">
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              {/* Ajout de !pl-11 pour forcer le padding et ne pas cacher le texte */}
              <Input 
                type="email" 
                required 
                autoComplete="username" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="!pl-11" 
                placeholder="vous@exemple.com" 
              />
            </div>
          </Field>

          <Field label="Mot de passe">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input 
                type={showPassword ? "text" : "password"} 
                required 
                autoComplete="current-password" 
                value={motDePasse} 
                onChange={(e) => setMotDePasse(e.target.value)} 
                className="!pl-11 !pr-11" // Padding à droite pour l'œil
                placeholder="••••••••" 
              />
              {/* Bouton pour l'œil */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </Field>

          <Button type="submit" loading={connexion} className="w-full">Se connecter</Button>
        </form>
      </TiltCard>
    </div>
  );
}
