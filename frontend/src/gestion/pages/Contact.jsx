import { Plus, Trash2 } from 'lucide-react';
import AtelierGuard from '../components/AtelierGuard';
import SaveBar from '../components/SaveBar';
import { useSettings } from '../hooks/useSettings';
import { Button, Field, Input, PageHeader, Panel, Spinner, Textarea } from '../components/ui';

const CLES = ['slogan', 'adresse', 'telephone', 'whatsapp', 'email', 'mapsQuery', 'horaires'];

function Page({ atelier }) {
  const { valeurs: v, setChamp, chargement, enregistrement, enregistrer, modifie } = useSettings(atelier.id, CLES);
  if (chargement) return <Spinner />;

  const horaires = Array.isArray(v.horaires) ? v.horaires : [];
  const majHoraire = (i, cle, val) => setChamp('horaires', horaires.map((h, k) => (k === i ? { ...h, [cle]: val } : h)));

  return (
    <>
      <PageHeader titre="Contact & horaires" description="Coordonnées affichées sur le site, dans le pied de page et sur la page contact." />
      <div className="space-y-6">
        <Panel titre="Coordonnées" delay={0}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field className="sm:col-span-2" label="Slogan"><Input value={v.slogan} onChange={(e) => setChamp('slogan', e.target.value)} /></Field>
            <Field label="Téléphone"><Input value={v.telephone} onChange={(e) => setChamp('telephone', e.target.value)} placeholder="+229 00 00 00 00" /></Field>
            <Field label="WhatsApp" hint="Format international, ex. +229…"><Input value={v.whatsapp} onChange={(e) => setChamp('whatsapp', e.target.value)} /></Field>
            <Field label="E-mail"><Input type="email" value={v.email} onChange={(e) => setChamp('email', e.target.value)} /></Field>
            <Field label="Recherche Google Maps" hint="Texte utilisé pour la carte, ex. « Carrefour Vedoko, Cotonou ».">
              <Input value={v.mapsQuery} onChange={(e) => setChamp('mapsQuery', e.target.value)} />
            </Field>
            <Field className="sm:col-span-2" label="Adresse"><Textarea value={v.adresse} onChange={(e) => setChamp('adresse', e.target.value)} /></Field>
          </div>
        </Panel>

        <Panel titre="Horaires d’ouverture" delay={80}>
          <div className="space-y-3">
            {horaires.map((h, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-3">
                <Input value={h.jours} onChange={(e) => majHoraire(i, 'jours', e.target.value)} placeholder="Lundi — Vendredi" />
                <Input value={h.heures} onChange={(e) => majHoraire(i, 'heures', e.target.value)} placeholder="8h00 — 18h00" />
                <Button type="button" variant="ghost" aria-label="Supprimer" onClick={() => setChamp('horaires', horaires.filter((_, k) => k !== i))} icon={Trash2} />
              </div>
            ))}
            <Button type="button" variant="secondary" icon={Plus} onClick={() => setChamp('horaires', [...horaires, { jours: '', heures: '' }])}>Ajouter une ligne</Button>
          </div>
        </Panel>
      </div>
      <SaveBar modifie={modifie} enregistrement={enregistrement} onSave={enregistrer} />
    </>
  );
}

export default function Contact() {
  return <AtelierGuard>{(a) => <Page atelier={a} />}</AtelierGuard>;
}
