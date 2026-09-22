import { useEffect, useState } from 'react';
import { CheckCircle2, Copy, ImageIcon } from 'lucide-react';
import { adminApi } from '../api';
import { AdminPageHeader, Badge, Card, EmptyState, LoadingState } from '../components/ui';

const ONGLETS = [
  { value: '', label: 'Toutes' },
  { value: 'nouvelle', label: 'Nouvelles' },
  { value: 'en_cours_examen', label: 'En cours' },
  { value: 'convertie', label: 'Converties' },
  { value: 'refusee', label: 'Refusées' },
];

const TONE_STATUT = { nouvelle: 'info', en_cours_examen: 'warning', convertie: 'success', refusee: 'danger' };

export default function Demandes() {
  const [onglet, setOnglet] = useState('');
  const [demandes, setDemandes] = useState(null);
  const [resultatConversion, setResultatConversion] = useState(null);

  const charger = () => {
    setDemandes(null);
    adminApi.demandes(onglet || undefined).then((res) => res.success && setDemandes(res.data));
  };

  useEffect(charger, [onglet]);

  const marquerEnCours = async (id) => {
    await adminApi.majDemande(id, { statut_traitement: 'en_cours_examen' });
    charger();
  };

  const refuser = async (id) => {
    if (!window.confirm('Refuser cette demande ?')) return;
    await adminApi.majDemande(id, { statut_traitement: 'refusee' });
    charger();
  };

  const convertir = async (id) => {
    const res = await adminApi.convertirDemande(id);
    if (res.success) {
      setResultatConversion(res.data);
      charger();
    } else {
      window.alert(res.message);
    }
  };

  return (
    <>
      <AdminPageHeader title="Demandes de réparation" description="Demandes envoyées depuis le site public." />

      {resultatConversion && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2 size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <p className="font-medium">Fiche créée : {resultatConversion.numero_fiche}</p>
            <p className="mt-1 flex items-center gap-2 text-sm">
              Code de suivi à communiquer au client : <code className="rounded bg-white px-2 py-0.5">{resultatConversion.code_public}</code>
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(resultatConversion.code_public)}
                className="text-emerald-700 hover:text-emerald-900"
                aria-label="Copier le code"
              >
                <Copy size={14} />
              </button>
            </p>
          </div>
          <button type="button" onClick={() => setResultatConversion(null)} className="text-emerald-700 hover:text-emerald-900">
            ✕
          </button>
        </div>
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

      {!demandes && <LoadingState />}
      {demandes && demandes.length === 0 && <EmptyState message="Aucune demande dans cette catégorie." />}

      <div className="space-y-4">
        {demandes?.map((d) => (
          <Card key={d.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-titre font-semibold text-bleu-nuit">{d.nom_complet}</p>
                  <Badge tone={TONE_STATUT[d.statut_traitement]}>{d.statut_traitement.replace('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-gris-texte">
                  {d.telephone} {d.email && `· ${d.email}`}
                </p>
              </div>
              <p className="text-xs text-gray-400">{d.created_at}</p>
            </div>

            <div className="mt-3 grid gap-1 text-sm text-gris-texte sm:grid-cols-2">
              <p>
                <strong className="text-bleu-nuit">Appareil :</strong> {d.type} — {d.marque} {d.modele}
              </p>
              <p>
                <strong className="text-bleu-nuit">Souhaité :</strong> {d.date_souhaitee} à {d.heure_souhaitee}
              </p>
            </div>
            <p className="mt-2 text-sm text-gris-texte">
              <strong className="text-bleu-nuit">Panne :</strong> {d.panne}
            </p>
            {d.photo_path && (
              <a
                href={d.photo_path}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-bleu-technique hover:text-bleu-nuit"
              >
                <ImageIcon size={16} aria-hidden="true" /> Voir la photo jointe
              </a>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {d.statut_traitement === 'nouvelle' && (
                <button type="button" onClick={() => marquerEnCours(d.id)} className="btn-secondary px-3 py-1.5 text-sm">
                  Marquer en cours d&apos;examen
                </button>
              )}
              {d.statut_traitement !== 'convertie' && (
                <button type="button" onClick={() => convertir(d.id)} className="btn-primary px-3 py-1.5 text-sm">
                  Convertir en fiche de réparation
                </button>
              )}
              {d.statut_traitement !== 'refusee' && d.statut_traitement !== 'convertie' && (
                <button type="button" onClick={() => refuser(d.id)} className="px-3 py-1.5 text-sm font-medium text-red-600 hover:underline">
                  Refuser
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
