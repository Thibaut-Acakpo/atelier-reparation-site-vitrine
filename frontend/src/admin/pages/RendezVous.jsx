import { useEffect, useState } from 'react';
import { adminApi } from '../api';
import { AdminPageHeader, Badge, Card, EmptyState, LoadingState } from '../components/ui';

const ONGLETS = [
  { value: '', label: 'Tous' },
  { value: 'en_attente', label: 'En attente' },
  { value: 'confirme', label: 'Confirmés' },
  { value: 'modifie', label: 'Modifiés' },
  { value: 'refuse', label: 'Refusés' },
];

const TONE = { en_attente: 'warning', confirme: 'success', modifie: 'info', refuse: 'danger' };

function FormulaireModification({ rdv, onAnnuler, onValider }) {
  const [date, setDate] = useState(rdv.date_souhaitee);
  const [heure, setHeure] = useState(rdv.heure_souhaitee);

  return (
    <div className="mt-3 flex flex-wrap items-end gap-3 rounded-lg bg-gris-clair p-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-bleu-nuit">Nouvelle date</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field py-1.5 text-sm" />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-bleu-nuit">Nouvelle heure</label>
        <input type="time" value={heure} onChange={(e) => setHeure(e.target.value)} className="input-field py-1.5 text-sm" />
      </div>
      <button type="button" onClick={() => onValider(date, heure)} className="btn-primary px-3 py-1.5 text-sm">
        Proposer ce créneau
      </button>
      <button type="button" onClick={onAnnuler} className="px-3 py-1.5 text-sm text-gris-texte hover:underline">
        Annuler
      </button>
    </div>
  );
}

export default function RendezVousAdmin() {
  const [onglet, setOnglet] = useState('');
  const [liste, setListe] = useState(null);
  const [editionId, setEditionId] = useState(null);

  const charger = () => {
    setListe(null);
    adminApi.rendezVous(onglet || undefined).then((res) => res.success && setListe(res.data));
  };

  useEffect(charger, [onglet]);

  const changerStatut = async (id, statut) => {
    await adminApi.majRendezVous(id, { statut });
    charger();
  };

  const proposerCreneau = async (id, date_souhaitee, heure_souhaitee) => {
    await adminApi.majRendezVous(id, { statut: 'modifie', date_souhaitee, heure_souhaitee });
    setEditionId(null);
    charger();
  };

  return (
    <>
      <AdminPageHeader title="Rendez-vous" description="Demandes de rendez-vous envoyées depuis le site." />

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
      {liste && liste.length === 0 && <EmptyState message="Aucun rendez-vous dans cette catégorie." />}

      <div className="space-y-4">
        {liste?.map((rdv) => (
          <Card key={rdv.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-titre font-semibold text-bleu-nuit">{rdv.nom_complet}</p>
                  <Badge tone={TONE[rdv.statut]}>{rdv.statut.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-gris-texte">
                  {rdv.telephone} {rdv.email && `· ${rdv.email}`}
                </p>
              </div>
              <p className="font-medium text-bleu-nuit">
                {rdv.date_souhaitee} à {rdv.heure_souhaitee}
              </p>
            </div>
            {rdv.motif && (
              <p className="mt-2 text-sm text-gris-texte">
                <strong className="text-bleu-nuit">Motif :</strong> {rdv.motif}
              </p>
            )}

            {editionId === rdv.id ? (
              <FormulaireModification
                rdv={rdv}
                onAnnuler={() => setEditionId(null)}
                onValider={(date, heure) => proposerCreneau(rdv.id, date, heure)}
              />
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {rdv.statut !== 'confirme' && (
                  <button type="button" onClick={() => changerStatut(rdv.id, 'confirme')} className="btn-primary px-3 py-1.5 text-sm">
                    Confirmer
                  </button>
                )}
                <button type="button" onClick={() => setEditionId(rdv.id)} className="btn-secondary px-3 py-1.5 text-sm">
                  Proposer un autre créneau
                </button>
                {rdv.statut !== 'refuse' && (
                  <button type="button" onClick={() => changerStatut(rdv.id, 'refuse')} className="px-3 py-1.5 text-sm font-medium text-red-600 hover:underline">
                    Refuser
                  </button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </>
  );
}
