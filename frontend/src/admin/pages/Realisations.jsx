import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { adminApi } from '../api';
import { AdminPageHeader, Badge, Card, EmptyState, LoadingState } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const VIDE = { titre: '', type_appareil: 'telephone', marque: '', modele: '', probleme: '', intervention: '', publie: true };

function Formulaire({ initial, onAnnuler, onEnregistre }) {
  const [champs, setChamps] = useState(initial);
  const [photoAvant, setPhotoAvant] = useState(null);
  const [photoApres, setPhotoApres] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  const update = (champ) => (e) => setChamps((c) => ({ ...c, [champ]: e.target.value }));

  const soumettre = async (e) => {
    e.preventDefault();
    setEnCours(true);
    setErreur('');
    const fd = new FormData();
    Object.entries(champs).forEach(([k, v]) => fd.append(k, v));
    if (photoAvant) fd.append('photo_avant', photoAvant);
    if (photoApres) fd.append('photo_apres', photoApres);

    const res = champs.id ? await adminApi.majRealisation(champs.id, fd) : await adminApi.creerRealisation(fd);
    setEnCours(false);
    if (res.success) onEnregistre();
    else setErreur(res.message);
  };

  return (
    <Card className="mb-6">
      <form onSubmit={soumettre} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-bleu-nuit">Titre</label>
            <input required className="input-field" value={champs.titre} onChange={update('titre')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-bleu-nuit">Type d&apos;appareil</label>
            <select className="input-field" value={champs.type_appareil} onChange={update('type_appareil')}>
              <option value="telephone">Téléphone</option>
              <option value="ordinateur">Ordinateur</option>
              <option value="tablette">Tablette</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-bleu-nuit">Marque</label>
            <input className="input-field" value={champs.marque} onChange={update('marque')} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-bleu-nuit">Modèle</label>
            <input className="input-field" value={champs.modele} onChange={update('modele')} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-bleu-nuit">Problème</label>
          <textarea required rows={2} className="input-field" value={champs.probleme} onChange={update('probleme')} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-bleu-nuit">Intervention</label>
          <textarea required rows={2} className="input-field" value={champs.intervention} onChange={update('intervention')} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-bleu-nuit">Photo avant</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhotoAvant(e.target.files[0])} className="text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-bleu-nuit">Photo après</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setPhotoApres(e.target.files[0])} className="text-sm" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-bleu-nuit">
          <input
            type="checkbox"
            checked={champs.publie}
            onChange={(e) => setChamps((c) => ({ ...c, publie: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-bleu-technique focus:ring-bleu-technique"
          />
          Publié sur le site
        </label>

        {erreur && <p className="text-sm text-red-600">{erreur}</p>}

        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={enCours}>
            {enCours ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button type="button" onClick={onAnnuler} className="btn-secondary">
            Annuler
          </button>
        </div>
      </form>
    </Card>
  );
}

export default function Realisations() {
  const { admin } = useAuth();
  const peutModifier = admin?.role === 'technicien';
  const [liste, setListe] = useState(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);

  const charger = () => {
    setListe(null);
    adminApi.realisations().then((res) => res.success && setListe(res.data));
  };

  useEffect(charger, []);

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer cette réalisation ?')) return;
    await adminApi.supprimerRealisation(id);
    charger();
  };

  const fermerFormulaire = () => {
    setFormulaireOuvert(false);
    setEnEdition(null);
  };

  return (
    <>
      <AdminPageHeader
        title="Réalisations"
        description="Galerie avant/après affichée sur le site public."
        action={
          !formulaireOuvert &&
          peutModifier && (
            <button type="button" onClick={() => setFormulaireOuvert(true)} className="btn-primary">
              <Plus size={18} aria-hidden="true" /> Ajouter
            </button>
          )
        }
      />

      {!peutModifier && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Lecture seule — la création, la modification et la suppression sont réservées au compte &quot;Technicien&quot;.
        </p>
      )}

      {formulaireOuvert && peutModifier && (
        <Formulaire
          initial={enEdition || VIDE}
          onAnnuler={fermerFormulaire}
          onEnregistre={() => {
            fermerFormulaire();
            charger();
          }}
        />
      )}

      {!liste && <LoadingState />}
      {liste && liste.length === 0 && <EmptyState message="Aucune réalisation pour le moment." />}

      <div className="space-y-3">
        {liste?.map((r) => (
          <Card key={r.id} className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-titre font-semibold text-bleu-nuit">{r.titre}</p>
                <Badge tone={r.publie ? 'success' : 'default'}>{r.publie ? 'Publié' : 'Brouillon'}</Badge>
              </div>
              <p className="text-sm text-gris-texte">
                {r.marque} {r.modele} — {r.probleme}
              </p>
            </div>
            <div className="flex gap-2">
              {peutModifier && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEnEdition(r);
                      setFormulaireOuvert(true);
                    }}
                    aria-label="Modifier"
                  >
                    <Pencil size={18} className="text-bleu-technique" />
                  </button>
                  <button type="button" onClick={() => supprimer(r.id)} aria-label="Supprimer">
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
