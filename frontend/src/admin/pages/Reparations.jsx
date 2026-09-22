import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { adminApi } from '../api';
import { AdminPageHeader, Badge, Card, EmptyState, LoadingState } from '../components/ui';

export default function Reparations() {
  const [q, setQ] = useState('');
  const [statuts, setStatuts] = useState([]);
  const [statutFiltre, setStatutFiltre] = useState('');
  const [liste, setListe] = useState(null);

  useEffect(() => {
    adminApi.statuts().then((res) => res.success && setStatuts(res.data));
  }, []);

  const charger = () => {
    setListe(null);
    adminApi.reparations({ ...(q ? { q } : {}), ...(statutFiltre ? { statut: statutFiltre } : {}) }).then((res) => res.success && setListe(res.data));
  };

  useEffect(charger, [statutFiltre]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <AdminPageHeader title="Fiches de réparation" description="Suivi complet des réparations en cours et terminées." />

      <div className="mb-6 flex flex-wrap gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            charger();
          }}
          className="flex flex-1 min-w-[220px] items-center gap-2"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher (numéro, nom, téléphone)"
            className="input-field"
          />
          <button type="submit" className="btn-secondary shrink-0 px-3 py-2.5">
            <Search size={16} aria-hidden="true" />
          </button>
        </form>
        <select value={statutFiltre} onChange={(e) => setStatutFiltre(e.target.value)} className="input-field w-auto">
          <option value="">Tous les statuts</option>
          {statuts.map((s) => (
            <option key={s.id} value={s.code}>
              {s.libelle}
            </option>
          ))}
        </select>
      </div>

      {!liste && <LoadingState />}
      {liste && liste.length === 0 && <EmptyState message="Aucune fiche ne correspond à cette recherche." />}

      <div className="space-y-3">
        {liste?.map((r) => (
          <Link key={r.id} to={`/admin/reparations/${r.id}`}>
            <Card className="flex flex-wrap items-center justify-between gap-3 transition-shadow hover:shadow-md">
              <div>
                <p className="font-titre font-semibold text-bleu-nuit">{r.numero_fiche}</p>
                <p className="text-sm text-gris-texte">
                  {r.nom_complet} — {r.appareil_marque} {r.appareil_modele}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {r.cout != null && <span className="text-sm text-gris-texte">{r.cout.toLocaleString('fr-FR')} FCFA</span>}
                <Badge tone="info">{r.statut_libelle}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
