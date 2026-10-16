import { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { gestionApi } from '../api';
import { Button, ConfirmModal, EmptyState, Field, Input, PageHeader, Panel, Reveal, Spinner, Textarea, useToast } from './ui';

// Éditeur générique (liste + création + modification + suppression) pour les
// contenus simples d'un client : services, types d'appareils, FAQ.
//   champs : [{ cle, label, type: 'text' | 'textarea', requis, placeholder }]
export default function ContenuEditor({ atelier, type, titre, description, champs, libelleItem, titreCarte, sousTitreCarte }) {
  const toast = useToast();
  const [items, setItems] = useState(null);
  const [edition, setEdition] = useState(null); // { id?, ...valeurs }
  const [aSupprimer, setASupprimer] = useState(null);
  const [busy, setBusy] = useState(false);

  const charger = useCallback(async () => {
    const res = await gestionApi.contenu.liste(atelier.id, type);
    if (res.success) setItems(res.data); else { toast.erreur(res.message); setItems([]); }
  }, [atelier.id, type, toast]);

  useEffect(() => { charger(); }, [charger]);

  const vide = () => Object.fromEntries(champs.map((c) => [c.cle, '']));
  const manquant = edition && champs.some((c) => c.requis && !String(edition[c.cle] || '').trim());

  const enregistrer = async () => {
    setBusy(true);
    const { id, ...valeurs } = edition;
    const res = id
      ? await gestionApi.contenu.maj(atelier.id, type, id, valeurs)
      : await gestionApi.contenu.creer(atelier.id, type, valeurs);
    setBusy(false);
    if (res.success) { toast.succes(id ? 'Modifié.' : 'Ajouté.'); setEdition(null); charger(); } else toast.erreur(res.message);
  };

  const supprimer = async () => {
    setBusy(true);
    const res = await gestionApi.contenu.supprimer(atelier.id, type, aSupprimer.id);
    setBusy(false);
    if (res.success) { toast.succes('Supprimé.'); setASupprimer(null); charger(); } else toast.erreur(res.message);
  };

  return (
    <>
      <PageHeader
        titre={titre}
        description={description}
        actions={<Button icon={Plus} onClick={() => setEdition(vide())}>Ajouter {libelleItem}</Button>}
      />

      {items === null ? <Spinner /> : items.length === 0 ? (
        <EmptyState titre="Rien pour l’instant" description={`Ajoutez ${libelleItem} : il apparaîtra sur le site du client.`} />
      ) : (
        <div className="space-y-3">
          {items.map((it, i) => (
            <Reveal key={it.id} delay={Math.min(i, 8) * 40}>
              <div className="flex items-start justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition hover:border-slate-600">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{it[titreCarte]}</p>
                  {it[sousTitreCarte] && <p className="mt-1 text-sm text-slate-400">{it[sousTitreCarte]}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" icon={Pencil} aria-label="Modifier" onClick={() => setEdition({ ...vide(), ...Object.fromEntries(champs.map((c) => [c.cle, it[c.cle] || ''])), id: it.id })} />
                  <Button variant="ghost" icon={Trash2} aria-label="Supprimer" onClick={() => setASupprimer(it)} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      )}

      <ConfirmModal
        ouvert={!!edition}
        titre={edition?.id ? 'Modifier' : `Ajouter ${libelleItem}`}
        confirmLabel="Enregistrer"
        loading={busy}
        disabled={manquant}
        onConfirm={enregistrer}
        onCancel={() => setEdition(null)}
      >
        <div className="space-y-4">
          {edition && champs.map((c) => (
            <Field key={c.cle} label={`${c.label}${c.requis ? ' *' : ''}`} hint={c.hint}>
              {c.type === 'textarea'
                ? <Textarea value={edition[c.cle]} onChange={(e) => setEdition({ ...edition, [c.cle]: e.target.value })} placeholder={c.placeholder} />
                : <Input value={edition[c.cle]} onChange={(e) => setEdition({ ...edition, [c.cle]: e.target.value })} placeholder={c.placeholder} />}
            </Field>
          ))}
        </div>
      </ConfirmModal>

      <ConfirmModal ouvert={!!aSupprimer} danger titre="Supprimer cet élément ?" confirmLabel="Supprimer" loading={busy} onConfirm={supprimer} onCancel={() => setASupprimer(null)}>
        « {aSupprimer?.[titreCarte]} » sera retiré du site du client.
      </ConfirmModal>
    </>
  );
}
