import { RotateCcw } from 'lucide-react';
import AtelierGuard from '../components/AtelierGuard';
import SaveBar from '../components/SaveBar';
import { useSettings } from '../hooks/useSettings';
import { Button, Field, PageHeader, Panel, Spinner } from '../components/ui';

const CLES = ['couleurPrincipale', 'couleurSecondaire', 'couleurAccent'];

// Couleurs d'origine du design (celles du site tant que rien n'est personnalisé).
const PAR_DEFAUT = {
  couleurPrincipale: '#0A1B33',
  couleurSecondaire: '#0F2E5C',
  couleurAccent: '#C4972D',
};

const PALETTES = [
  { nom: 'Classique', ...PAR_DEFAUT },
  { nom: 'Forêt', couleurPrincipale: '#0F2A1D', couleurSecondaire: '#1B4D31', couleurAccent: '#E0A526' },
  { nom: 'Rubis', couleurPrincipale: '#2A0F16', couleurSecondaire: '#6B1224', couleurAccent: '#F2B134' },
  { nom: 'Ardoise', couleurPrincipale: '#0F172A', couleurSecondaire: '#1E293B', couleurAccent: '#38BDF8' },
];

const CHAMPS = [
  ['couleurPrincipale', 'Couleur principale', 'Fonds sombres (accueil, pied de page) et titres.'],
  ['couleurSecondaire', 'Couleur secondaire', 'Dégradés et bandeaux.'],
  ['couleurAccent', 'Couleur d’accent', 'Boutons (« Déposer mon appareil », « Suivre ma réparation »).'],
];

function Page({ atelier }) {
  const { valeurs: v, setChamp, chargement, enregistrement, enregistrer, modifie } = useSettings(atelier.id, CLES);
  if (chargement) return <Spinner />;

  const appliquer = (p) => CLES.forEach((c) => setChamp(c, p[c]));
  const valide = (c) => /^#[0-9a-f]{6}$/i.test(v[c] || '');

  return (
    <>
      <PageHeader
        titre="Apparence"
        description="Couleurs du site vitrine de ce client. Après l’enregistrement, rechargez le site (Ctrl + Maj + R) pour les voir."
        actions={<Button variant="secondary" icon={RotateCcw} onClick={() => appliquer(PAR_DEFAUT)}>Couleurs d’origine</Button>}
      />
      <div className="space-y-6">
        <Panel titre="Palettes prêtes à l’emploi" delay={0}>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {PALETTES.map((p) => (
              <button key={p.nom} type="button" onClick={() => appliquer(p)} className="rounded-xl border border-slate-700 p-3 text-left transition hover:-translate-y-1 hover:border-sky-400">
                <div className="mb-2 flex overflow-hidden rounded-lg">
                  {[p.couleurPrincipale, p.couleurSecondaire, p.couleurAccent].map((c) => <span key={c} className="h-7 flex-1" style={{ background: c }} />)}
                </div>
                <span className="text-sm font-medium text-white">{p.nom}</span>
              </button>
            ))}
          </div>
        </Panel>

        <Panel titre="Couleurs personnalisées" delay={80}>
          <div className="grid gap-5 sm:grid-cols-3">
            {CHAMPS.map(([cle, label, aide]) => (
              <Field key={cle} label={label} hint={aide} error={valide(cle) ? '' : 'Format attendu : #RRGGBB'}>
                <div className="flex items-center gap-3">
                  <input type="color" value={valide(cle) ? v[cle] : '#000000'} onChange={(e) => setChamp(cle, e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg border border-slate-700 bg-transparent" />
                  <input value={v[cle] || ''} onChange={(e) => setChamp(cle, e.target.value)} className="dev-input font-mono" maxLength={7} />
                </div>
              </Field>
            ))}
          </div>
        </Panel>

        <Panel titre="Aperçu" delay={160}>
          <div className="overflow-hidden rounded-2xl border border-slate-700">
            <div className="p-8" style={{ background: `linear-gradient(135deg, ${v.couleurPrincipale}, ${v.couleurSecondaire})`, color: '#fff' }}>
              <p className="text-xs opacity-80">{atelier.nom}</p>
              <h4 className="mt-1 text-2xl font-bold">Nous réparons vos appareils avec soin et précision.</h4>
              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-xl px-5 py-2.5 text-sm font-semibold" style={{ background: v.couleurAccent, color: v.couleurPrincipale }}>Déposer mon appareil</span>
                <span className="rounded-xl border border-white/30 px-5 py-2.5 text-sm font-semibold">Suivre ma réparation</span>
              </div>
            </div>
          </div>
        </Panel>
      </div>
      <SaveBar modifie={modifie} enregistrement={enregistrement} onSave={enregistrer} />
    </>
  );
}

export default function Apparence() {
  return <AtelierGuard>{(a) => <Page atelier={a} />}</AtelierGuard>;
}
