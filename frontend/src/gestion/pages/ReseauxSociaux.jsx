import AtelierGuard from '../components/AtelierGuard';
import SaveBar from '../components/SaveBar';
import { useSettings } from '../hooks/useSettings';
import { Field, Input, PageHeader, Panel, Spinner } from '../components/ui';

const RESEAUX = [
  ['facebook', 'Facebook', 'https://facebook.com/…'],
  ['instagram', 'Instagram', 'https://instagram.com/…'],
  ['tiktok', 'TikTok', 'https://tiktok.com/@…'],
  ['youtube', 'YouTube', 'https://youtube.com/@…'],
  ['linkedin', 'LinkedIn', 'https://linkedin.com/company/…'],
  ['x', 'X (Twitter)', 'https://x.com/…'],
];

function Page({ atelier }) {
  const { valeurs: v, setChamp, chargement, enregistrement, enregistrer, modifie } = useSettings(atelier.id, RESEAUX.map((r) => r[0]));
  if (chargement) return <Spinner />;

  return (
    <>
      <PageHeader titre="Réseaux sociaux" description="Les icônes apparaissent dans le pied de page du site uniquement pour les liens renseignés." />
      <Panel>
        <div className="grid gap-5 sm:grid-cols-2">
          {RESEAUX.map(([cle, label, placeholder]) => (
            <Field key={cle} label={label}>
              <Input type="url" value={v[cle] || ''} onChange={(e) => setChamp(cle, e.target.value)} placeholder={placeholder} />
            </Field>
          ))}
        </div>
      </Panel>
      <SaveBar modifie={modifie} enregistrement={enregistrement} onSave={enregistrer} />
    </>
  );
}

export default function ReseauxSociaux() {
  return <AtelierGuard>{(a) => <Page atelier={a} />}</AtelierGuard>;
}
