import { useCallback, useEffect, useState } from 'react';
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { gestionApi } from '../api';
import AtelierGuard from '../components/AtelierGuard';
import { Badge, Button, ConfirmModal, EmptyState, Field, Input, PageHeader, Reveal, Spinner, Textarea, useToast } from '../components/ui';
import { urlUpload } from '../../data/config';

const VIDE = { titre: '', type_appareil: '', marque: '', modele: '', probleme: '', intervention: '', publie: true };

function Page({ atelier }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [edition, setEdition] = useState(null);
  const [photos, setPhotos] = useState({ avant: null, apres: null });
  const [aSupprimer, setASupprimer] = useState(null);
  const [busy, setBusy] = useState(false);

  const charger = useCallback(async () => {
    const res = await gestionApi.realisations.liste(atelier.id);
    if (res.success) setItems(res.data); else { toast.erreur(res.message); setItems([]); }
  }, [atelier.id, toast]);
  useEffect(() => { charger(); }, [charger]);

  const ouvrir = (it) => { setPhotos({ avant: null, apres: null }); setEdition(it ? { ...VIDE, ...it, publie: !!it.publie } : { ...VIDE }); };
  const incomplet = edition && ['titre', 'type_appareil', 'probleme', 'intervention'].some((c) => !String(edition[c] || '').trim());

  const enregistrer = async () => {
    const fd = new FormData();
    ['titre', 'type_appareil', 'marque', 'modele', 'probleme', 'intervention'].forEach((c) => fd.append(c, edition[c] || ''));
    fd.append('publie', edition.publie ? 'true' : 'false');
    if (photos.avant) fd.append('photo_avant', photos.avant);
    if (photos.apres) fd.append('photo_apres', photos.apres);

    setBusy(true);
    const res = edition.id ? await gestionApi.realisations.maj(atelier.id, edition.id, fd) : await gestionApi.realisations.creer(atelier.id, fd);
    setBusy(false);
    if (res.success) { toast.succes('Réalisation enregistrée.'); setEdition(null); charger(); } else toast.erreur(res.message);
  };

  const supprimer = async () => {
    setBusy(true);
    const res = await gestionApi.realisations.supprimer(atelier.id, aSupprimer.id);
    setBusy(false);
    if (res.success) { toast.succes('Supprimée.'); setASupprimer(null); charger(); } else toast.erreur(res.message);
  };

  return (
    <>
      <PageHeader titre="Réalisations" description="Avant / après affichés sur la page Réalisations du site." actions={<Button icon={Plus} onClick={() => ouvrir(null)}>Ajouter</Button>} />

      {items === null ? <Spinner /> : items.length === 0 ? (
        <EmptyState titre="Aucune réalisation" description="Ajoutez des réparations marquantes avec leurs photos avant/après." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {items.map((it, i) => (
            <Reveal key={it.id} delay={Math.min(i, 8) * 50}>
              <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                <div className="grid h-36 grid-cols-2 bg-slate-950">
                  {[it.image_avant, it.image_apres].map((img, k) => (
                    img ? <img key={k} src={urlUpload(img)} alt={k ? 'Après' : 'Avant'} className="h-full w-full object-cover" /> : <div key={k} className="grid place-items-center text-xs text-slate-600">{k ? 'Après' : 'Avant'} : pas de photo</div>
                  ))}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-white">{it.titre}</p>
                    <Badge tone={it.publie ? 'green' : 'slate'}>{it.publie ? <><Eye className="h-3 w-3" />Publié</> : <><EyeOff className="h-3 w-3" />Masqué</>}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{[it.type_appareil, it.marque, it.modele].filter(Boolean).join(' · ')}</p>
                  <div className="mt-3 flex gap-1">
                    <Button variant="ghost" icon={Pencil} onClick={() => ouvrir(it)}>Modifier</Button>
                    <Button variant="ghost" icon={Trash2} onClick={() => setASupprimer(it)}>Supprimer</Button>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <ConfirmModal ouvert={!!edition} titre={edition?.id ? 'Modifier la réalisation' : 'Nouvelle réalisation'} confirmLabel="Enregistrer" loading={busy} disabled={incomplet} onConfirm={enregistrer} onCancel={() => setEdition(null)}>
        {edition && (
          <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-1">
            <Field label="Titre *"><Input value={edition.titre} onChange={(e) => setEdition({ ...edition, titre: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Type *"><Input value={edition.type_appareil} onChange={(e) => setEdition({ ...edition, type_appareil: e.target.value })} placeholder="telephone" /></Field>
              <Field label="Marque"><Input value={edition.marque || ''} onChange={(e) => setEdition({ ...edition, marque: e.target.value })} /></Field>
              <Field label="Modèle"><Input value={edition.modele || ''} onChange={(e) => setEdition({ ...edition, modele: e.target.value })} /></Field>
            </div>
            <Field label="Problème *"><Textarea value={edition.probleme} onChange={(e) => setEdition({ ...edition, probleme: e.target.value })} /></Field>
            <Field label="Intervention *"><Textarea value={edition.intervention} onChange={(e) => setEdition({ ...edition, intervention: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Photo avant"><input type="file" accept="image/*" onChange={(e) => setPhotos({ ...photos, avant: e.target.files[0] || null })} className="text-xs" /></Field>
              <Field label="Photo après"><input type="file" accept="image/*" onChange={(e) => setPhotos({ ...photos, apres: e.target.files[0] || null })} className="text-xs" /></Field>
            </div>
            <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={edition.publie} onChange={(e) => setEdition({ ...edition, publie: e.target.checked })} /> Publiée sur le site</label>
          </div>
        )}
      </ConfirmModal>

      <ConfirmModal ouvert={!!aSupprimer} danger titre="Supprimer cette réalisation ?" confirmLabel="Supprimer" loading={busy} onConfirm={supprimer} onCancel={() => setASupprimer(null)}>
        « {aSupprimer?.titre} » sera retirée du site.
      </ConfirmModal>
    </>
  );
}

export default function Realisations() {
  return <AtelierGuard>{(a) => <Page atelier={a} />}</AtelierGuard>;
}
