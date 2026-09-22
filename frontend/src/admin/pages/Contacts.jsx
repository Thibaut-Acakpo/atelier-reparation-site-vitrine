import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { AdminPageHeader, Badge, Card, EmptyState, LoadingState } from '../components/ui';

export default function Contacts() {
  const [filtre, setFiltre] = useState('0');
  const [liste, setListe] = useState(null);

  const charger = () => {
    setListe(null);
    adminApi.contacts(filtre === '' ? undefined : filtre).then((res) => res.success && setListe(res.data));
  };

  useEffect(charger, [filtre]);

  const basculerTraite = async (id, traite) => {
    await adminApi.majContact(id, !traite);
    charger();
  };

  return (
    <>
      <AdminPageHeader title="Messages de contact" description="Messages envoyés depuis le formulaire de contact du site." />

      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { value: '0', label: 'Non traités' },
          { value: '1', label: 'Traités' },
          { value: '', label: 'Tous' },
        ].map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setFiltre(o.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filtre === o.value ? 'bg-bleu-technique text-white' : 'bg-white text-gris-texte ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>

      {!liste && <LoadingState />}
      {liste && liste.length === 0 && <EmptyState message="Aucun message ici." />}

      <div className="space-y-4">
        {liste?.map((c) => (
          <Card key={c.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-titre font-semibold text-bleu-nuit">{c.nom}</p>
                  <Badge tone={c.traite ? 'success' : 'warning'}>{c.traite ? 'Traité' : 'Non traité'}</Badge>
                </div>
                <p className="text-sm text-gris-texte">
                  {c.email} {c.telephone && `· ${c.telephone}`}
                </p>
                {c.sujet && <p className="mt-1 text-sm font-medium text-bleu-nuit">{c.sujet}</p>}
              </div>
              <p className="text-xs text-gray-400">{c.created_at}</p>
            </div>
            <p className="mt-2 text-sm text-gris-texte">{c.message}</p>
            <button
              type="button"
              onClick={() => basculerTraite(c.id, c.traite)}
              className="btn-secondary mt-4 px-3 py-1.5 text-sm"
            >
              Marquer comme {c.traite ? 'non traité' : 'traité'}
            </button>
          </Card>
        ))}
      </div>
    </>
  );
}
