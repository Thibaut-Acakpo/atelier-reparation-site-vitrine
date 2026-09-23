import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Copy,
  ImageIcon,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
} from 'lucide-react';

import { adminApi } from '../api';
import {
  AdminPageHeader,
  Badge,
  Card,
  EmptyState,
  LoadingState,
} from '../components/ui';

const API_URL = import.meta.env.VITE_API_URL;

const ONGLETS = [
  { value: '', label: 'Toutes' },
  { value: 'nouvelle', label: 'Nouvelles' },
  { value: 'en_cours_examen', label: 'En cours' },
  { value: 'convertie', label: 'Converties' },
  { value: 'refusee', label: 'Refusées' },
];

const TONE_STATUT = {
  nouvelle: 'info',
  en_cours_examen: 'warning',
  convertie: 'success',
  refusee: 'danger',
};

export default function Demandes() {
  const [onglet, setOnglet] = useState('');
  const [demandes, setDemandes] = useState(null);
  const [resultatConversion, setResultatConversion] = useState(null);

  const [demandeASupprimer, setDemandeASupprimer] = useState(null);
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);
  const [erreurSuppression, setErreurSuppression] = useState('');

  const charger = () => {
    setDemandes(null);

    adminApi
      .demandes(onglet || undefined)
      .then((res) => {
        if (res.success) {
          setDemandes(res.data);
        }
      });
  };

  useEffect(() => {
    charger();
  }, [onglet]);

  // ============================================================
  // Construire l'URL complète d'une photo
  // ============================================================
  const obtenirUrlPhoto = (photoPath) => {
    if (!photoPath) {
      return '';
    }

    // Si le backend renvoie déjà une URL complète,
    // on la conserve telle quelle.
    if (
      photoPath.startsWith('http://') ||
      photoPath.startsWith('https://')
    ) {
      return photoPath;
    }

    // Sinon, on ajoute l'URL du backend.
    const chemin = photoPath.startsWith('/')
      ? photoPath
      : `/${photoPath}`;

    return `${API_URL}${chemin}`;
  };

  // ============================================================
  // Marquer en cours d'examen
  // ============================================================
  const marquerEnCours = async (id) => {
    const res = await adminApi.majDemande(id, {
      statut_traitement: 'en_cours_examen',
    });

    if (res.success) {
      charger();
    } else {
      window.alert(
        res.message || 'Impossible de modifier la demande.'
      );
    }
  };

  // ============================================================
  // Refuser
  // ============================================================
  const refuser = async (id) => {
    if (!window.confirm('Refuser cette demande ?')) {
      return;
    }

    const res = await adminApi.majDemande(id, {
      statut_traitement: 'refusee',
    });

    if (res.success) {
      charger();
    } else {
      window.alert(
        res.message || 'Impossible de refuser la demande.'
      );
    }
  };

  // ============================================================
  // Ouvrir la fenêtre de suppression
  // ============================================================
  const supprimer = (demande) => {
    setErreurSuppression('');
    setDemandeASupprimer(demande);
  };

  // ============================================================
  // Fermer la fenêtre de suppression
  // ============================================================
  const annulerSuppression = () => {
    if (suppressionEnCours) {
      return;
    }

    setDemandeASupprimer(null);
    setErreurSuppression('');
  };

  // ============================================================
  // Confirmer la suppression
  // ============================================================
  const confirmerSuppression = async () => {
    if (!demandeASupprimer || suppressionEnCours) {
      return;
    }

    setSuppressionEnCours(true);
    setErreurSuppression('');

    try {
      const res = await adminApi.supprimerDemande(
        demandeASupprimer.id
      );

      if (res.success) {
        setDemandeASupprimer(null);
        setErreurSuppression('');
        charger();
      } else {
        setErreurSuppression(
          res.message || 'Impossible de supprimer la demande.'
        );
      }
    } catch (error) {
      console.error(error);

      setErreurSuppression(
        'Une erreur est survenue lors de la suppression.'
      );
    } finally {
      setSuppressionEnCours(false);
    }
  };

  // ============================================================
  // Fermer la modale avec Échap
  // ============================================================
  useEffect(() => {
    const gererTouche = (event) => {
      if (event.key === 'Escape' && demandeASupprimer) {
        annulerSuppression();
      }
    };

    document.addEventListener('keydown', gererTouche);

    return () => {
      document.removeEventListener('keydown', gererTouche);
    };
  }, [demandeASupprimer, suppressionEnCours]);

  // ============================================================
  // Convertir
  // ============================================================
  const convertir = async (id) => {
    const res = await adminApi.convertirDemande(id);

    if (res.success) {
      setResultatConversion(res.data);
      charger();
    } else {
      window.alert(
        res.message || 'Impossible de convertir la demande.'
      );
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Demandes de réparation"
        description="Demandes envoyées depuis le site public."
      />

      {/* ======================================================
          MESSAGE APRÈS CONVERSION
      ======================================================= */}
      {resultatConversion && (
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900">
          <CheckCircle2
            size={20}
            className="mt-0.5 shrink-0"
            aria-hidden="true"
          />

          <div className="flex-1">
            <p className="font-medium">
              Fiche créée : {resultatConversion.numero_fiche}
            </p>

            <p className="mt-1 flex items-center gap-2 text-sm">
              Code de suivi à communiquer au client :

              <code className="rounded bg-white px-2 py-0.5">
                {resultatConversion.code_public}
              </code>

              <button
                type="button"
                onClick={() =>
                  navigator.clipboard.writeText(
                    resultatConversion.code_public
                  )
                }
                className="text-emerald-700 hover:text-emerald-900"
                aria-label="Copier le code"
              >
                <Copy size={14} />
              </button>
            </p>
          </div>

          <button
            type="button"
            onClick={() => setResultatConversion(null)}
            className="text-emerald-700 hover:text-emerald-900"
            aria-label="Fermer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      {/* ======================================================
          ONGLETS
      ======================================================= */}
      <div className="mb-6 flex flex-wrap gap-2">
        {ONGLETS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => setOnglet(o.value)}
            className={
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors ' +
              (onglet === o.value
                ? 'bg-bleu-technique text-white'
                : 'bg-white text-gris-texte ring-1 ring-gray-200 hover:bg-gray-50')
            }
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* ======================================================
          CHARGEMENT
      ======================================================= */}
      {!demandes && <LoadingState />}

      {/* ======================================================
          AUCUNE DEMANDE
      ======================================================= */}
      {demandes && demandes.length === 0 && (
        <EmptyState message="Aucune demande dans cette catégorie." />
      )}

      {/* ======================================================
          LISTE DES DEMANDES
      ======================================================= */}
      <div className="space-y-4">
        {demandes?.map((d) => (
          <Card key={d.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-titre font-semibold text-bleu-nuit">
                    {d.nom_complet}
                  </p>

                  <Badge tone={TONE_STATUT[d.statut_traitement]}>
                    {d.statut_traitement.replace('_', ' ')}
                  </Badge>
                </div>

                <p className="text-sm text-gris-texte">
                  {d.telephone}

                  {d.email && (
                    <>
                      {' '}
                      <span aria-hidden="true">-</span>{' '}
                      {d.email}
                    </>
                  )}
                </p>
              </div>

              <p className="text-xs text-gray-400">
                {d.created_at}
              </p>
            </div>

            {/* Informations appareil */}
            <div className="mt-3 grid gap-1 text-sm text-gris-texte sm:grid-cols-2">
              <p>
                <strong className="text-bleu-nuit">
                  Appareil :
                </strong>{' '}
                {d.type}{' '}
                <span aria-hidden="true">-</span>{' '}
                {d.marque} {d.modele}
              </p>

              <p>
                <strong className="text-bleu-nuit">
                  Souhaité :
                </strong>{' '}
                {d.date_souhaitee} à {d.heure_souhaitee}
              </p>
            </div>

            {/* Panne */}
            <p className="mt-2 text-sm text-gris-texte">
              <strong className="text-bleu-nuit">
                Panne :
              </strong>{' '}
              {d.panne}
            </p>

            {/* ==================================================
                PHOTO
            =================================================== */}
            {d.photo_path && (
              <a
                href={obtenirUrlPhoto(d.photo_path)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-bleu-technique hover:text-bleu-nuit"
              >
                <ImageIcon
                  size={16}
                  aria-hidden="true"
                />

                Voir la photo jointe
              </a>
            )}

            {/* ==================================================
                BOUTONS D'ACTION
            =================================================== */}
            <div className="mt-4 flex flex-wrap gap-2">
              {d.statut_traitement === 'nouvelle' && (
                <button
                  type="button"
                  onClick={() => marquerEnCours(d.id)}
                  className="btn-secondary px-3 py-1.5 text-sm"
                >
                  Marquer en cours d&apos;examen
                </button>
              )}

              {d.statut_traitement !== 'convertie' && (
                <button
                  type="button"
                  onClick={() => convertir(d.id)}
                  className="btn-primary px-3 py-1.5 text-sm"
                >
                  Convertir en fiche de réparation
                </button>
              )}

              {d.statut_traitement !== 'refusee' &&
                d.statut_traitement !== 'convertie' && (
                  <button
                    type="button"
                    onClick={() => refuser(d.id)}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:underline"
                  >
                    Refuser
                  </button>
                )}

              {/* Bouton supprimer */}
              <button
                type="button"
                onClick={() => supprimer(d)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
              >
                <Trash2
                  size={15}
                  aria-hidden="true"
                />

                Supprimer
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* ======================================================
          MODALE DE CONFIRMATION
      ======================================================= */}
      {demandeASupprimer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-suppression-titre"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !suppressionEnCours
            ) {
              annulerSuppression();
            }
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100">
                  <AlertTriangle
                    size={22}
                    className="text-red-600"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <h2
                    id="confirmation-suppression-titre"
                    className="font-titre text-lg font-semibold text-bleu-nuit"
                  >
                    Supprimer la demande ?
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-500">
                    Cette action est définitive.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={annulerSuppression}
                disabled={suppressionEnCours}
                className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenu */}
            <div className="px-6 py-5">
              <p className="text-sm leading-6 text-gray-600">
                Vous êtes sur le point de supprimer définitivement
                la demande de réparation de :
              </p>

              <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="font-semibold text-bleu-nuit">
                  {demandeASupprimer.nom_complet}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {demandeASupprimer.telephone}

                  {demandeASupprimer.email && (
                    <>
                      {' '}
                      <span aria-hidden="true">-</span>{' '}
                      {demandeASupprimer.email}
                    </>
                  )}
                </p>

                <p className="mt-2 text-sm text-gray-600">
                  {demandeASupprimer.type}{' '}
                  <span aria-hidden="true">-</span>{' '}
                  {demandeASupprimer.marque}{' '}
                  {demandeASupprimer.modele}
                </p>
              </div>

              {demandeASupprimer.statut_traitement ===
                'convertie' && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="text-sm leading-5 text-amber-800">
                    <strong>Attention :</strong> cette demande a
                    déjà été convertie en fiche de réparation.
                    La fiche associée sera également supprimée.
                  </p>
                </div>
              )}

              <p className="mt-4 text-sm font-medium text-gray-700">
                Voulez-vous vraiment continuer ?
              </p>

              {erreurSuppression && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {erreurSuppression}
                </div>
              )}
            </div>

            {/* Pied de la modale */}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={annulerSuppression}
                disabled={suppressionEnCours}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={confirmerSuppression}
                disabled={suppressionEnCours}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {suppressionEnCours ? (
                  <>
                    <Loader2
                      size={16}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2
                      size={16}
                      aria-hidden="true"
                    />
                    Supprimer définitivement
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}