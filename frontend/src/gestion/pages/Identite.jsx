import { useState } from 'react';
import { gestionApi } from '../api';
import AtelierGuard from '../components/AtelierGuard';
import SaveBar from '../components/SaveBar';
import { useAtelierGestion } from '../context/SelectedAtelierContext';
import { Alert, Field, Input, PageHeader, Panel, useToast } from '../components/ui';
import { slugify } from '../lib/slug';
import { lienSiteParSlug } from '../lib/liens';

function Formulaire({ atelier }) {
  const toast = useToast();
  const { recharger } = useAtelierGestion();
  const initial = { nom: atelier.nom, slug: atelier.slug, logo_url: atelier.logo_url || '' };
  const [f, setF] = useState(initial);
  const [enregistrement, setEnregistrement] = useState(false);

  const modifie = JSON.stringify(f) !== JSON.stringify(initial);
  const slugChange = f.slug !== atelier.slug;

  const enregistrer = async () => {
    setEnregistrement(true);
    const res = await gestionApi.majAtelier(atelier.id, f);
    setEnregistrement(false);
    if (res.success) { toast.succes(res.message); await recharger(); } else toast.erreur(res.message);
  };

  return (
    <>
      <PageHeader titre="Identité" description="Nom et logo affichés sur le site du client (en-tête, pied de page, titre de l’onglet)." />
      <div className="space-y-6">
        <Panel titre="Informations générales">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom de l’atelier"><Input value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} /></Field>
            <Field label="Lien du site (slug)" hint={lienSiteParSlug({ slug: f.slug || '…' })}>
              <Input value={f.slug} onChange={(e) => setF({ ...f, slug: slugify(e.target.value) })} />
            </Field>
            <Field className="sm:col-span-2" label="Logo (URL)" hint="Adresse d’une image hébergée (https://…). Laissez vide pour afficher le nom seul.">
              <Input value={f.logo_url} onChange={(e) => setF({ ...f, logo_url: e.target.value })} placeholder="https://…/logo.png" />
            </Field>
          </div>
          {slugChange && (
            <div className="mt-5"><Alert tone="warn">Changer le lien invalide l’ancien : pensez à prévenir le client et à mettre à jour vos liens partagés.</Alert></div>
          )}
          {f.logo_url && (
            <div className="mt-5 flex items-center gap-4 rounded-xl bg-slate-950/60 p-4">
              <img src={f.logo_url} alt="Aperçu du logo" className="h-14 w-14 rounded-lg bg-white object-contain p-1" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              <span className="text-sm text-slate-400">Aperçu du logo</span>
            </div>
          )}
        </Panel>
      </div>
      <SaveBar modifie={modifie} enregistrement={enregistrement} onSave={enregistrer} />
    </>
  );
}

export default function Identite() {
  return <AtelierGuard>{(a) => <Formulaire atelier={a} />}</AtelierGuard>;
}
