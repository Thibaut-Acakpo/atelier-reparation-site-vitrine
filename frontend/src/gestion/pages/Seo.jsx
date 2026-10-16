import AtelierGuard from '../components/AtelierGuard';
import SaveBar from '../components/SaveBar';
import { useSettings } from '../hooks/useSettings';
import { Field, Input, PageHeader, Panel, Spinner, Textarea } from '../components/ui';
import { lienSite } from '../lib/liens';

const CLES = ['seoTitre', 'seoDescription', 'seoMotsCles', 'seoImage'];

function Page({ atelier }) {
  const { valeurs: v, setChamp, chargement, enregistrement, enregistrer, modifie } = useSettings(atelier.id, CLES);
  if (chargement) return <Spinner />;

  const titre = v.seoTitre || atelier.nom;
  const description = v.seoDescription || 'Réparation de téléphones, ordinateurs et tablettes.';

  return (
    <>
      <PageHeader titre="SEO" description="Titre et description affichés par Google et lors du partage du lien (WhatsApp, Facebook…)." />
      <div className="space-y-6">
        <Panel titre="Référencement" delay={0}>
          <div className="grid gap-5">
            <Field label="Titre de la page" hint={`${(v.seoTitre || '').length}/60 caractères recommandés`}>
              <Input value={v.seoTitre} onChange={(e) => setChamp('seoTitre', e.target.value)} placeholder={`${atelier.nom} — Réparation électronique`} />
            </Field>
            <Field label="Description" hint={`${(v.seoDescription || '').length}/160 caractères recommandés`}>
              <Textarea value={v.seoDescription} onChange={(e) => setChamp('seoDescription', e.target.value)} />
            </Field>
            <Field label="Mots-clés" hint="Séparés par des virgules."><Input value={v.seoMotsCles} onChange={(e) => setChamp('seoMotsCles', e.target.value)} placeholder="réparation téléphone, écran, Cotonou" /></Field>
            <Field label="Image de partage (URL)" hint="Idéalement 1200×630 px."><Input value={v.seoImage} onChange={(e) => setChamp('seoImage', e.target.value)} placeholder="https://…" /></Field>
          </div>
        </Panel>

        <Panel titre="Aperçu Google" delay={80}>
          <div className="rounded-xl bg-white p-5">
            <p className="truncate text-xs text-slate-600">{lienSite(atelier)}</p>
            <p className="mt-1 truncate text-lg text-blue-700">{titre}</p>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{description}</p>
          </div>
        </Panel>
      </div>
      <SaveBar modifie={modifie} enregistrement={enregistrement} onSave={enregistrer} />
    </>
  );
}

export default function Seo() {
  return <AtelierGuard>{(a) => <Page atelier={a} />}</AtelierGuard>;
}
