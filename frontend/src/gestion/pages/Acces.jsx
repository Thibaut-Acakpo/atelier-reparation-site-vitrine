import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, KeyRound, Power, Trash2 } from 'lucide-react';
import { gestionApi } from '../api';
import AtelierGuard from '../components/AtelierGuard';
import { useAtelierGestion } from '../context/SelectedAtelierContext';
import { Alert, Badge, Button, ConfirmModal, CopyButton, Field, Input, PageHeader, Panel, Spinner, useToast } from '../components/ui';
import { lienAdmin, lienSite, lienSiteParSlug } from '../lib/liens';

function LigneLien({ label, valeur }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-950/60 p-4">
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="truncate font-mono text-sm text-slate-100">{valeur}</p>
      </div>
      <div className="flex gap-2">
        <CopyButton valeur={valeur} />
        <a href={valeur} target="_blank" rel="noreferrer"><Button variant="secondary" icon={ExternalLink}>Ouvrir</Button></a>
      </div>
    </div>
  );
}

function Contenu({ atelier }) {
  const toast = useToast();
  const navigate = useNavigate();
  const { recharger } = useAtelierGestion();
  const [comptes, setComptes] = useState(null);
  const [nouveauMdp, setNouveauMdp] = useState(null);
  const [reinit, setReinit] = useState(null);
  const [emailReinit, setEmailReinit] = useState('');
  const [suppression, setSuppression] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);

  const charger = useCallback(async () => {
    const res = await gestionApi.comptes(atelier.id);
    if (res.success) setComptes(res.data);
  }, [atelier.id]);

  useEffect(() => { charger(); }, [charger]);

  const basculerStatut = async () => {
    setBusy(true);
    const res = await gestionApi.statutAtelier(atelier.id, !atelier.actif);
    setBusy(false);
    if (res.success) { toast.succes(res.message); recharger(); } else toast.erreur(res.message);
  };

  const reinitialiser = async () => {
    setBusy(true);
    const res = await gestionApi.reinitialiserCompte(atelier.id, reinit.role, emailReinit ? { email: emailReinit } : {});
    setBusy(false);
    if (res.success) { setNouveauMdp(res.data); setReinit(null); charger(); } else toast.erreur(res.message);
  };

  const basculerCompte = async (c) => {
    const res = await gestionApi.statutCompte(atelier.id, c.role, !c.actif);
    if (res.success) { toast.succes(res.message); charger(); } else toast.erreur(res.message);
  };

  const supprimer = async () => {
    setBusy(true);
    const res = await gestionApi.supprimerAtelier(atelier.id, confirmation);
    setBusy(false);
    if (res.success) { toast.succes(res.message); await recharger(); navigate('/gestion'); } else toast.erreur(res.message);
  };

  return (
    <>
      <PageHeader titre="Liens & accès" description={`Tout ce qu’il faut transmettre à « ${atelier.nom} ».`} />

      <div className="space-y-6">
        <Panel titre="Liens" description="Le lien du site fonctionne immédiatement, sans configuration. Le domaine personnalisé se configure dans « Domaine ».">
          <div className="space-y-3">
            <LigneLien label="Site vitrine" valeur={lienSite(atelier)} />
            {atelier.domaine && <LigneLien label="Lien de secours (sans domaine)" valeur={lienSiteParSlug(atelier)} />}
            <LigneLien label="Espace de gestion (pour le client)" valeur={lienAdmin(atelier)} />
          </div>
        </Panel>

        <Panel titre="Comptes du client" description="Les mots de passe sont chiffrés : seuls de nouveaux mots de passe peuvent être générés.">
          {!comptes ? <Spinner /> : comptes.length === 0 ? (
            <Alert tone="warn">Aucun compte. Définissez l’e-mail du gérant ci-dessous pour en créer un.</Alert>
          ) : (
            <ul className="divide-y divide-slate-800">
              {comptes.map((c) => (
                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-medium capitalize text-white">{c.role} <Badge tone={c.actif ? 'green' : 'slate'}>{c.actif ? 'Actif' : 'Désactivé'}</Badge></p>
                    <p className="text-sm text-slate-400">{c.email}</p>
                    <p className="text-xs text-slate-500">
                      {c.derniere_connexion ? `Dernière connexion : ${new Date(c.derniere_connexion).toLocaleString('fr-FR')}` : 'Jamais connecté'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" icon={KeyRound} onClick={() => { setReinit(c); setEmailReinit(c.email); }}>Nouveau mot de passe</Button>
                    <Button variant="ghost" onClick={() => basculerCompte(c)}>{c.actif ? 'Désactiver' : 'Activer'}</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel titre="Mise en ligne">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-lg text-sm text-slate-300">
              {atelier.actif
                ? 'Le site est en ligne. Le désactiver (impayé, maintenance…) le rend inaccessible et bloque la connexion du client ; aucune donnée n’est perdue.'
                : 'Le site est désactivé : inaccessible au public et au client.'}
            </p>
            <Button variant={atelier.actif ? 'danger' : 'primary'} icon={Power} loading={busy} onClick={basculerStatut}>
              {atelier.actif ? 'Désactiver le site' : 'Réactiver le site'}
            </Button>
          </div>
          {!atelier.actif && (
            <div className="mt-6 border-t border-slate-800 pt-5">
              <Button variant="danger" icon={Trash2} onClick={() => { setConfirmation(''); setSuppression(true); }}>Supprimer définitivement ce client</Button>
            </div>
          )}
        </Panel>
      </div>

      <ConfirmModal
        ouvert={!!reinit}
        titre={`Nouveau mot de passe — ${reinit?.role}`}
        confirmLabel="Générer"
        loading={busy}
        onConfirm={reinitialiser}
        onCancel={() => setReinit(null)}
      >
        <p className="mb-3">Un mot de passe sécurisé sera généré et affiché une seule fois. Vous pouvez aussi corriger l’e-mail du compte.</p>
        <Field label="E-mail du compte"><Input type="email" value={emailReinit} onChange={(e) => setEmailReinit(e.target.value)} /></Field>
      </ConfirmModal>

      <ConfirmModal ouvert={!!nouveauMdp} titre="Mot de passe défini" confirmLabel="J’ai noté" onConfirm={() => setNouveauMdp(null)} onCancel={() => setNouveauMdp(null)}>
        <p className="mb-3">À transmettre au client (il ne sera plus affiché) :</p>
        <div className="rounded-xl bg-slate-950 p-4 font-mono text-sm">
          <p>{nouveauMdp?.email}</p><p className="text-amber-300">{nouveauMdp?.mot_de_passe}</p>
        </div>
        <div className="mt-3"><CopyButton valeur={`${nouveauMdp?.email} / ${nouveauMdp?.mot_de_passe}`} /></div>
      </ConfirmModal>

      <ConfirmModal
        ouvert={suppression} danger titre="Supprimer définitivement ?" confirmLabel="Supprimer"
        loading={busy} disabled={confirmation !== atelier.slug}
        onConfirm={supprimer} onCancel={() => setSuppression(false)}
      >
        <p className="mb-3">Toutes les données de « {atelier.nom} » (demandes, réparations, clients, contenu) seront effacées sans retour possible. Saisissez <strong className="font-mono text-white">{atelier.slug}</strong> pour confirmer.</p>
        <Input value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder={atelier.slug} />
      </ConfirmModal>
    </>
  );
}

export default function Acces() {
  return <AtelierGuard>{(atelier) => <Contenu atelier={atelier} />}</AtelierGuard>;
}
