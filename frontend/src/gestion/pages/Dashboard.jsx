import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, ExternalLink, Inbox, MessageSquare, Plus, Star, Wrench } from 'lucide-react';
import { useAtelierGestion } from '../context/SelectedAtelierContext';
import { Badge, Button, CopyButton, CountUp, EmptyState, PageHeader, Reveal, Spinner, TiltCard, Alert } from '../components/ui';
import { lienSite } from '../lib/liens';

const LIBELLES_MANQUANTS = {
  telephone: 'téléphone', whatsapp: 'WhatsApp', email: 'e-mail', adresse: 'adresse', logo: 'logo',
};

function Stat({ icone: Icone, valeur, label, delay }) {
  return (
    <Reveal delay={delay}>
      <TiltCard className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur">
        <Icone className="h-5 w-5 text-sky-400" />
        <p className="mt-4 text-3xl font-bold text-white"><CountUp value={valeur} /></p>
        <p className="mt-1 text-sm text-slate-400">{label}</p>
      </TiltCard>
    </Reveal>
  );
}

export default function Dashboard() {
  const { ateliers, chargement, erreur, selectionnerAtelier, recharger } = useAtelierGestion();
  const navigate = useNavigate();

  if (chargement) return <Spinner />;

  const somme = (cle) => ateliers.reduce((t, a) => t + (a[cle] || 0), 0);

  const configurer = (a) => {
    selectionnerAtelier(a);
    navigate('/gestion/acces');
  };

  return (
    <>
      <PageHeader
        titre="Tableau de bord"
        description="Tous vos clients au même endroit : un site vitrine et une gestion pour chacun, créés en quelques clics."
        actions={<Link to="/gestion/nouveau"><Button icon={Plus}>Nouveau client</Button></Link>}
      />

      {erreur && (
        <div className="mb-6"><Alert tone="error">{erreur} <button className="underline" onClick={recharger}>Réessayer</button></Alert></div>
      )}

      <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icone={Wrench} valeur={ateliers.filter((a) => a.actif).length} label="Sites actifs" delay={0} />
        <Stat icone={Inbox} valeur={somme('demandes_nouvelles')} label="Nouvelles demandes" delay={80} />
        <Stat icone={MessageSquare} valeur={somme('messages_non_traites')} label="Messages à traiter" delay={160} />
        <Stat icone={Star} valeur={somme('avis_en_attente')} label="Avis à modérer" delay={240} />
      </div>

      <h2 className="mb-4 text-lg font-semibold text-white">Vos clients</h2>

      {ateliers.length === 0 ? (
        <EmptyState
          titre="Aucun client pour l’instant"
          description="Créez votre premier client : son site, son espace de gestion et ses identifiants sont générés automatiquement."
          action={<Link to="/gestion/nouveau"><Button icon={Plus}>Créer mon premier client</Button></Link>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {ateliers.map((a, i) => (
            <Reveal key={a.id} delay={i * 70}>
              <TiltCard className="h-full rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-white">{a.nom}</h3>
                    <p className="truncate text-sm text-slate-500">{a.domaine || `/s/${a.slug}`}</p>
                  </div>
                  <Badge tone={a.actif ? 'green' : 'slate'}>{a.actif ? 'En ligne' : 'Désactivé'}</Badge>
                </div>

                <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
                  {[
                    ['Demandes', a.demandes_nouvelles],
                    ['Réparations', a.reparations],
                    ['Messages', a.messages_non_traites],
                    ['Avis', a.avis_en_attente],
                  ].map(([libelle, v]) => (
                    <div key={libelle} className="rounded-xl bg-slate-950/60 py-2.5">
                      <dd className="text-lg font-bold text-white">{v}</dd>
                      <dt className="text-[11px] text-slate-500">{libelle}</dt>
                    </div>
                  ))}
                </dl>

                {a.a_completer.length > 0 && (
                  <p className="mt-4 flex items-start gap-2 text-xs text-amber-300">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    À compléter : {a.a_completer.map((c) => LIBELLES_MANQUANTS[c] || c).join(', ')}
                  </p>
                )}

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button onClick={() => configurer(a)} icon={ArrowRight}>Configurer</Button>
                  <a href={lienSite(a)} target="_blank" rel="noreferrer">
                    <Button variant="secondary" icon={ExternalLink}>Site</Button>
                  </a>
                  <CopyButton valeur={lienSite(a)} label="Lien" />
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      )}
    </>
  );
}
