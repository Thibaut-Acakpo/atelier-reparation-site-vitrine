import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { adminApi } from '../api';
import { Card, LoadingState } from '../components/ui';

export default function ClientDetail() {
  const { id } = useParams();
  const [client, setClient] = useState(null);

  useEffect(() => {
    adminApi.client(id).then((res) => res.success && setClient(res.data));
  }, [id]);

  if (!client) return <LoadingState />;

  return (
    <>
      <Link to="/admin/clients" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-bleu-technique hover:text-bleu-nuit">
        <ArrowLeft size={16} aria-hidden="true" /> Retour aux clients
      </Link>

      <h1 className="mb-6 font-titre text-2xl font-bold text-bleu-nuit">{client.nom_complet}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <p className="font-titre font-semibold text-bleu-nuit">Coordonnées</p>
          <p className="mt-2 text-sm text-gris-texte">{client.telephone}</p>
          {client.email && <p className="text-sm text-gris-texte">{client.email}</p>}
        </Card>

        <Card>
          <p className="font-titre font-semibold text-bleu-nuit">Appareils</p>
          <ul className="mt-2 space-y-1 text-sm text-gris-texte">
            {client.appareils.length === 0 && <li>Aucun appareil enregistré.</li>}
            {client.appareils.map((a) => (
              <li key={a.id}>
                {a.type} — {a.marque} {a.modele}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <p className="font-titre font-semibold text-bleu-nuit">Réparations</p>
          <ul className="mt-2 space-y-1 text-sm">
            {client.reparations.length === 0 && <li className="text-gris-texte">Aucune réparation.</li>}
            {client.reparations.map((r) => (
              <li key={r.id}>
                <Link to={`/admin/reparations/${r.id}`} className="text-bleu-technique hover:text-bleu-nuit">
                  {r.numero_fiche}
                </Link>{' '}
                <span className="text-gris-texte">— {r.statut}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}
