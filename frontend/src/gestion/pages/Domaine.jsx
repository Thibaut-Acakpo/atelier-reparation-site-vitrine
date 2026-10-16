import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { gestionApi } from '../api';
import AtelierGuard from '../components/AtelierGuard';
import SaveBar from '../components/SaveBar';
import { useAtelierGestion } from '../context/SelectedAtelierContext';
import { Alert, CopyButton, Field, Input, PageHeader, Panel, useToast } from '../components/ui';
import { lienSiteParSlug } from '../lib/liens';

function Page({ atelier }) {
  const toast = useToast();
  const { recharger } = useAtelierGestion();
  const [domaine, setDomaine] = useState(atelier.domaine || '');
  const [enregistrement, setEnregistrement] = useState(false);
  const modifie = domaine.trim() !== (atelier.domaine || '');

  const enregistrer = async () => {
    setEnregistrement(true);
    const res = await gestionApi.majAtelier(atelier.id, { domaine });
    setEnregistrement(false);
    if (res.success) { toast.succes('Domaine enregistré.'); await recharger(); } else toast.erreur(res.message);
  };

  return (
    <>
      <PageHeader titre="Domaine" description="Associez le nom de domaine du client à son site. Facultatif : le lien /s/… fonctionne déjà sans domaine." />
      <div className="space-y-6">
        <Panel titre="Domaine personnalisé" delay={0}>
          <Field label="Nom de domaine" hint="Sans « https:// » ni « www », par exemple techplus.bj. Laissez vide pour le retirer.">
            <Input value={domaine} onChange={(e) => setDomaine(e.target.value)} placeholder="techplus.bj" />
          </Field>
          <p className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Lien actuel (toujours valable) :
            <span className="font-mono text-slate-200">{lienSiteParSlug(atelier)}</span>
            <CopyButton valeur={lienSiteParSlug(atelier)} />
          </p>
        </Panel>

        <Panel titre="Mise en service du domaine" delay={80}>
          <ol className="list-decimal space-y-3 pl-5 text-sm text-slate-300">
            <li>Enregistrez le domaine ci-dessus : le serveur reconnaîtra alors ce site.</li>
            <li>Chez l’hébergeur du <strong>frontend</strong> (Render, Netlify, Vercel…), ajoutez le domaine du client comme « domaine personnalisé » : il sert le <strong>même</strong> frontend que vos autres clients.</li>
            <li>Chez le registrar du client, créez l’enregistrement DNS indiqué par l’hébergeur (CNAME ou A).</li>
            <li>Attendez la propagation DNS et le certificat HTTPS (quelques minutes à quelques heures).</li>
          </ol>
          <div className="mt-5"><Alert tone="info">Aucune autre modification de code n’est nécessaire : l’autorisation CORS et la reconnaissance du site sont automatiques pour tout domaine enregistré ici.</Alert></div>
        </Panel>
      </div>
      <SaveBar modifie={modifie} enregistrement={enregistrement} onSave={enregistrer} />
    </>
  );
}

export default function Domaine() {
  return <AtelierGuard>{(a) => <Page atelier={a} />}</AtelierGuard>;
}
