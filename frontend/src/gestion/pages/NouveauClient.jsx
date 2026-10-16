import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Copy, Dices, ExternalLink, Rocket } from 'lucide-react';
import { gestionApi } from '../api';
import { useAtelierGestion } from '../context/SelectedAtelierContext';
import { Alert, Button, CopyButton, Field, Input, PageHeader, Panel, Reveal, useToast } from '../components/ui';
import { slugify, genererMotDePasse } from '../lib/slug';
import { lienAdmin, lienSite, lienSiteParSlug } from '../lib/liens';

function Choix({ actif, onClick, titre, texte }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition-all ${
        actif ? 'border-sky-400 bg-sky-500/10 ring-1 ring-sky-400/40' : 'border-slate-700 hover:border-slate-500'
      }`}
    >
      <p className="text-sm font-semibold text-white">{titre}</p>
      <p className="mt-1 text-xs text-slate-400">{texte}</p>
    </button>
  );
}

export default function NouveauClient() {
  const toast = useToast();
  const navigate = useNavigate();
  const { ateliers, recharger, selectionnerAtelier } = useAtelierGestion();

  const [nom, setNom] = useState('');
  const [slug, setSlug] = useState('');
  const [slugManuel, setSlugManuel] = useState(false);
  const [domaine, setDomaine] = useState('');
  const [modeleId, setModeleId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [avecAssistant, setAvecAssistant] = useState(false);
  const [assistantEmail, setAssistantEmail] = useState('');
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState('');
  const [resultat, setResultat] = useState(null);

  const changerNom = (v) => {
    setNom(v);
    if (!slugManuel) setSlug(slugify(v));
  };

  const creer = async (e) => {
    e.preventDefault();
    setErreur('');
    setEnvoi(true);
    const res = await gestionApi.creerAtelier({
      nom, slug: slug || slugify(nom), domaine,
      modele_id: modeleId ? Number(modeleId) : null,
      admin_email: adminEmail,
      admin_mot_de_passe: motDePasse,
      avec_assistant: avecAssistant,
      assistant_email: assistantEmail,
    });
    setEnvoi(false);

    if (res.cancelled) return;
    if (!res.success) {
      setErreur(res.message || 'Création impossible.');
      return;
    }
    await recharger();
    selectionnerAtelier(res.data.atelier);
    setResultat(res.data);
    toast.succes('Client créé avec succès.');
  };

  // ------------------------------------------------------------------ Succès
  if (resultat) {
    const { atelier, comptes } = resultat;
    const lienSiteUrl = lienSite(atelier);
    const lienAdminUrl = lienAdmin(atelier);
    const message = [
      `Bonjour, votre site « ${atelier.nom} » est prêt.`,
      '',
      `Site : ${lienSiteUrl}`,
      `Espace de gestion : ${lienAdminUrl}`,
      '',
      ...comptes.map((c) => `Compte ${c.role} : ${c.email} / ${c.mot_de_passe}`),
    ].join('\n');

    return (
      <>
        <PageHeader titre="Client créé 🎉" description="Voici ses liens et identifiants. Les mots de passe ne seront plus affichés : copiez-les maintenant." />
        <div className="space-y-6">
          <Panel>
            <div className="mb-5 flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="h-6 w-6" /> <span className="font-semibold">{atelier.nom} est en ligne</span>
            </div>
            <dl className="space-y-4 text-sm">
              {[['Site vitrine', lienSiteUrl], ['Espace de gestion du client', lienAdminUrl]].map(([l, v]) => (
                <div key={l} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-950/60 p-4">
                  <div className="min-w-0"><dt className="text-xs text-slate-500">{l}</dt><dd className="truncate font-mono text-slate-100">{v}</dd></div>
                  <div className="flex gap-2">
                    <CopyButton valeur={v} />
                    <a href={v} target="_blank" rel="noreferrer"><Button variant="secondary" icon={ExternalLink}>Ouvrir</Button></a>
                  </div>
                </div>
              ))}
              {comptes.map((c) => (
                <div key={c.role} className="rounded-xl bg-slate-950/60 p-4">
                  <dt className="text-xs capitalize text-slate-500">Compte {c.role}</dt>
                  <dd className="font-mono text-slate-100">{c.email}</dd>
                  <dd className="font-mono text-amber-300">{c.mot_de_passe}</dd>
                </div>
              ))}
            </dl>
            {atelier.domaine && (
              <p className="mt-4 text-xs text-slate-400">
                Domaine personnalisé enregistré. Le lien <span className="font-mono">{lienSiteParSlug(atelier)}</span> fonctionne aussi tant que le DNS n’est pas configuré.
              </p>
            )}
          </Panel>

          <Panel titre="Message prêt à envoyer au client">
            <pre className="whitespace-pre-wrap rounded-xl bg-slate-950/60 p-4 text-sm text-slate-200">{message}</pre>
            <div className="mt-4"><CopyButton valeur={message} label="Copier le message" /></div>
          </Panel>

          <div className="flex flex-wrap gap-3">
            <Button icon={ArrowRight} onClick={() => navigate('/gestion/identite')}>Personnaliser ce client</Button>
            <Button variant="secondary" onClick={() => navigate('/gestion')}>Retour au tableau de bord</Button>
          </div>
        </div>
      </>
    );
  }

  // ---------------------------------------------------------------- Formulaire
  return (
    <>
      <PageHeader
        titre="Nouveau client"
        description="Un site vitrine et un espace de gestion indépendants sont créés en un clic, avec leur propre lien et leurs propres identifiants."
      />

      <form onSubmit={creer} className="space-y-6">
        {erreur && <Alert tone="error">{erreur}</Alert>}

        <Panel titre="1. Le client" delay={0}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nom de l’atelier *">
              <Input required value={nom} onChange={(e) => changerNom(e.target.value)} placeholder="Tech Plus Cotonou" />
            </Field>
            <Field label="Lien du site *" hint={`Adresse : ${window.location.origin}/s/${slug || '…'}`}>
              <Input required value={slug} onChange={(e) => { setSlugManuel(true); setSlug(slugify(e.target.value)); }} placeholder="tech-plus-cotonou" />
            </Field>
            <Field label="Domaine personnalisé (facultatif)" hint="Pourra être ajouté plus tard, dans « Domaine ».">
              <Input value={domaine} onChange={(e) => setDomaine(e.target.value)} placeholder="techplus.bj" />
            </Field>
          </div>
        </Panel>

        <Panel titre="2. Point de départ" description="Les coordonnées (téléphone, adresse…) ne sont jamais copiées : vous les saisissez pour chaque client." delay={80}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Choix actif={!modeleId} onClick={() => setModeleId('')} titre="Contenu standard" texte="Services, types d’appareils, FAQ et couleurs par défaut." />
            {ateliers.length > 0 && (
              <div className={`rounded-xl border p-4 transition-all ${modeleId ? 'border-sky-400 bg-sky-500/10 ring-1 ring-sky-400/40' : 'border-slate-700'}`}>
                <p className="text-sm font-semibold text-white">Dupliquer un client existant</p>
                <p className="mb-2 mt-1 text-xs text-slate-400">Reprend ses services, appareils, FAQ et son apparence.</p>
                <select value={modeleId} onChange={(e) => setModeleId(e.target.value)} className="dev-input py-2">
                  <option value="">— Choisir —</option>
                  {ateliers.map((a) => <option key={a.id} value={a.id}>{a.nom}</option>)}
                </select>
              </div>
            )}
          </div>
        </Panel>

        <Panel titre="3. Accès à l’espace de gestion du client" delay={160}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="E-mail du gérant (technicien) *">
              <Input required type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="gerant@client.com" />
            </Field>
            <Field label="Mot de passe" hint="Laissez vide pour en générer un automatiquement (8 caractères minimum).">
              <div className="flex gap-2">
                <Input value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} placeholder="Généré automatiquement" />
                <Button type="button" variant="secondary" icon={Dices} onClick={() => setMotDePasse(genererMotDePasse())} aria-label="Générer" />
              </div>
            </Field>
          </div>
          <label className="mt-5 flex items-center gap-3 text-sm text-slate-200">
            <input type="checkbox" checked={avecAssistant} onChange={(e) => setAvecAssistant(e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-900" />
            Créer aussi un compte assistant (accès limité)
          </label>
          {avecAssistant && (
            <Field className="mt-4 sm:max-w-sm" label="E-mail de l’assistant">
              <Input type="email" value={assistantEmail} onChange={(e) => setAssistantEmail(e.target.value)} placeholder="assistant@client.com" />
            </Field>
          )}
        </Panel>

        <Reveal delay={240}>
          <Button type="submit" loading={envoi} icon={Rocket} className="w-full sm:w-auto">Créer le site et la gestion</Button>
        </Reveal>
      </form>
    </>
  );
}
