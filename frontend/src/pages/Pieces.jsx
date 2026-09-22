import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { adminApi } from '../api';
import { AdminPageHeader, Card, EmptyState, LoadingState } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function Pieces() {
  const { admin } = useAuth();
  const peutSupprimer = admin?.role === 'technicien';
  const [liste, setListe] = useState(null);
  const [nom, setNom] = useState('');
  const [reference, setReference] = useState('');

  const charger = () => {
    setListe(null);
    adminApi.pieces().then((res) => res.success && setListe(res.data));
  };

  useEffect(charger, []);

  const ajouter = async (e) => {
    e.preventDefault();
    if (!nom.trim()) return;
    await adminApi.creerPiece({ nom, reference });
    setNom('');
    setReference('');
    charger();
  };

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer cette pièce du catalogue ?')) return;
    await adminApi.supprimerPiece(id);
    charger();
  };

  return (
    <>
      <AdminPageHeader title="Catalogue de pièces" description="Pièces disponibles à associer aux fiches de réparation." />

      <Card className="mb-6">
        <form onSubmit={ajouter} className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-sm font-medium text-bleu-nuit">Nom de la pièce</label>
            <input required className="input-field" value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="flex-1 min-w-[160px]">
            <label className="mb-1 block text-sm font-medium text-bleu-nuit">Référence (facultatif)</label>
            <input className="input-field" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
          <button type="submit" className="btn-primary">
            <Plus size={18} aria-hidden="true" /> Ajouter
          </button>
        </form>
      </Card>

      {!liste && <LoadingState />}
      {liste && liste.length === 0 && <EmptyState message="Aucune pièce dans le catalogue." />}

      <Card className="p-0">
        <ul className="divide-y divide-gray-100">
          {liste?.map((p) => (
            <li key={p.id} className="flex items-center justify-between px-5 py-3">
              <span>
                {p.nom} {p.reference && <span className="text-gris-texte">({p.reference})</span>}
              </span>
              {peutSupprimer && (
                <button type="button" onClick={() => supprimer(p.id)} aria-label="Supprimer">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
