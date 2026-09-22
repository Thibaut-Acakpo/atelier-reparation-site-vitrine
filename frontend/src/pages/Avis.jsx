import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { adminApi } from '../api';
import { AdminPageHeader, Badge, Card, EmptyState, LoadingState } from '../components/ui';
import StarRating from '../../components/StarRating';
import { useAuth } from '../context/AuthContext';

const ONGLETS = [
  { value: 'en_attente', label: 'En attente' },
  { value: 'valide', label: 'Validés' },
  { value: 'refuse', label: 'Refusés' },
];

const TONE = { en_attente: 'warning', valide: 'success', refuse: 'danger' };

export default function Avis() {
  const { admin } = useAuth();
  const peutModerer = admin?.role === 'technicien';
  const [onglet, setOnglet] = useState('en_attente');
  const [liste, setListe] = useState(null);

  const charger = () => {
    setListe(null);
    adminApi.avis(onglet).then((res) => res.success && setListe(res.data));
  };

  useEffect(charger, [onglet]);

  const changerStatut = async (id, statut) => {
    await adminApi.majAvis(id, statut);
    charger();
  };

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer définitivement cet avis ?')) return;
    await adminApi.supprimerAvis(id);
    charger();
  };

  return (
    <>
      <AdminPageHeader title="Avis clients" description="Seuls les avis validés apparaissent sur le site public." />

      {!peutModerer && (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
          Lecture seule — la modération (valider/refuser/supprimer) est réservée au compte &quot;Technicien&quot;.
        </p>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {ONGLETS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setOnglet(o.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              onglet === o.value ? 'bg-bleu-technique text-white' : 'bg-white text-gris-texte ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {!liste && <LoadingState />}
      {liste && liste.length === 0 && <EmptyState message="Aucun avis dans cette catégorie." />}

      <div className="space-y-4">
        {liste?.map((a) => (
          <Card key={a.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-titre font-semibold text-bleu-nuit">{a.nom}</p>
                  <Badge tone={TONE[a.statut]}>{a.statut.replace('_', ' ')}</Badge>
                </div>
                <StarRating note={a.note} />
              </div>
              <p className="text-xs text-gray-400">{a.created_at}</p>
            </div>
            <p className="mt-2 text-sm text-gris-texte">{a.commentaire}</p>
            {peutModerer && (
              <div className="mt-4 flex flex-wrap gap-2">
                {a.statut !== 'valide' && (
                  <button type="button" onClick={() => changerStatut(a.id, 'valide')} className="btn-primary px-3 py-1.5 text-sm">
                    Valider
                  </button>
                )}
                {a.statut !== 'refuse' && (
                  <button type="button" onClick={() => changerStatut(a.id, 'refuse')} className="btn-secondary px-3 py-1.5 text-sm">
                    Refuser
                  </button>
                )}
                <button type="button" onClick={() => supprimer(a.id)} className="ml-auto text-sm text-red-600 hover:underline">
                  <Trash2 size={14} className="mr-1 inline" /> Supprimer
                </button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
