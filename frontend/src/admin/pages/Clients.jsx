import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { adminApi } from '../api';
import { AdminPageHeader, Card, EmptyState, LoadingState } from '../components/ui';

export default function Clients() {
  const [q, setQ] = useState('');
  const [liste, setListe] = useState(null);

  const charger = () => {
    setListe(null);
    adminApi.clients(q).then((res) => res.success && setListe(res.data));
  };

  useEffect(charger, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <AdminPageHeader title="Clients" description="Clients enregistrés à partir des demandes, rendez-vous et réparations." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          charger();
        }}
        className="mb-6 flex max-w-md items-center gap-2"
      >
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher par nom ou téléphone" className="input-field" />
        <button type="submit" className="btn-secondary shrink-0 px-3 py-2.5">
          <Search size={16} aria-hidden="true" />
        </button>
      </form>

      {!liste && <LoadingState />}
      {liste && liste.length === 0 && <EmptyState message="Aucun client trouvé." />}

      <div className="space-y-3">
        {liste?.map((c) => (
          <Link key={c.id} to={`/admin/clients/${c.id}`}>
            <Card className="flex items-center justify-between transition-shadow hover:shadow-md">
              <div>
                <p className="font-titre font-semibold text-bleu-nuit">{c.nom_complet}</p>
                <p className="text-sm text-gris-texte">
                  {c.telephone} {c.email && `· ${c.email}`}
                </p>
              </div>
              <p className="text-xs text-gray-400">Client depuis le {c.created_at}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
