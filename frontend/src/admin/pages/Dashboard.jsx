import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Inbox, CalendarClock, Wrench, Star, Mail, Users } from 'lucide-react';
import { adminApi } from '../api';
import { AdminPageHeader, Card, LoadingState } from '../components/ui';

const CARTES = [
  { cle: 'demandes_nouvelles', label: 'Nouvelles demandes', icon: Inbox, to: '/admin/demandes' },
  { cle: 'rendez_vous_en_attente', label: 'Rendez-vous en attente', icon: CalendarClock, to: '/admin/rendez-vous' },
  { cle: 'reparations_en_cours', label: 'Réparations en cours', icon: Wrench, to: '/admin/reparations' },
  { cle: 'avis_en_attente', label: 'Avis à modérer', icon: Star, to: '/admin/avis' },
  { cle: 'contacts_non_traites', label: 'Messages non traités', icon: Mail, to: '/admin/contacts' },
  { cle: 'total_clients', label: 'Clients enregistrés', icon: Users, to: '/admin/clients' },
];

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminApi.dashboard().then((res) => res.success && setData(res.data));
  }, []);

  if (!data) return <LoadingState />;

  return (
    <>
      <AdminPageHeader title="Tableau de bord" description="Vue d'ensemble de l'activité de l'atelier." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARTES.map((carte) => (
          <Link key={carte.cle} to={carte.to}>
            <Card className="flex items-center gap-4 transition-shadow hover:shadow-md">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-bleu-technique/10 text-bleu-technique">
                <carte.icon size={20} aria-hidden="true" />
              </span>
              <div>
                <p className="font-titre text-2xl font-bold text-bleu-nuit">{data[carte.cle]}</p>
                <p className="text-sm text-gris-texte">{carte.label}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-titre text-lg font-semibold text-bleu-nuit">Dernières demandes reçues</h2>
        <Card className="p-0">
          {data.dernieres_demandes.length === 0 ? (
            <p className="p-6 text-sm text-gris-texte">Aucune demande pour le moment.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.dernieres_demandes.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div>
                    <p className="font-medium text-bleu-nuit">
                      {d.nom_complet} — {d.marque} {d.modele}
                    </p>
                    <p className="text-sm text-gris-texte">{d.panne}</p>
                  </div>
                  <Link to="/admin/demandes" className="shrink-0 text-sm font-semibold text-bleu-technique hover:text-bleu-nuit">
                    Voir →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
