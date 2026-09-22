import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Copy, Plus, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { adminApi } from '../api';
import { Badge, Card, LoadingState } from '../components/ui';
import { useAuth } from '../context/AuthContext';

export default function ReparationDetail() {
  const { id } = useParams();
  const { admin } = useAuth();
  const peutVoirFinances = admin?.role === 'technicien';
  const [reparation, setReparation] = useState(null);
  const [statuts, setStatuts] = useState([]);
  const [pieces, setPieces] = useState([]);
  const [enregistrement, setEnregistrement] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState(null);
  const [commentaireHistorique, setCommentaireHistorique] = useState('');
  const [pieceSelectionnee, setPieceSelectionnee] = useState('');
  const [quantitePiece, setQuantitePiece] = useState(1);

  const charger = () => {
    adminApi.reparation(id).then((res) => {
      if (res.success) {
        setReparation(res.data);
        setForm({
          statut_id: res.data.statut_id,
          description_statut: res.data.description_statut || '',
          diagnostic: res.data.diagnostic || '',
          cout: res.data.cout ?? '',
          date_estimee_recuperation: res.data.date_estimee_recuperation || '',
          visible_publiquement: !!res.data.visible_publiquement,
        });
      }
    });
  };

  useEffect(() => {
    charger();
    adminApi.statuts().then((res) => res.success && setStatuts(res.data));
    adminApi.pieces().then((res) => res.success && setPieces(res.data));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!reparation || !form) return <LoadingState />;

  const enregistrer = async () => {
    setEnregistrement(true);
    setMessage('');
    const donnees = {
      statut_id: form.statut_id,
      description_statut: form.description_statut,
      diagnostic: form.diagnostic,
      date_estimee_recuperation: form.date_estimee_recuperation,
      commentaire_historique: commentaireHistorique || undefined,
    };
    // Le compte "Assistant technicien" ne peut pas modifier le coût ni la
    // visibilité publique — ces champs ne sont même pas envoyés pour lui
    // (le serveur les ignorerait de toute façon, mais autant être explicite).
    if (peutVoirFinances) {
      donnees.cout = form.cout === '' ? null : Number(form.cout);
      donnees.visible_publiquement = form.visible_publiquement;
    }
    const res = await adminApi.majReparation(id, donnees);
    setEnregistrement(false);
    if (res.success) {
      setMessage('Fiche mise à jour avec succès.');
      setCommentaireHistorique('');
      charger();
    } else {
      setMessage(res.message);
    }
  };

  const enregistrerDevis = async (decision) => {
    await adminApi.majDevis(id, decision);
    charger();
  };

  const ajouterPiece = async () => {
    if (!pieceSelectionnee) return;
    await adminApi.ajouterPiece(id, { piece_id: pieceSelectionnee, quantite: quantitePiece });
    setPieceSelectionnee('');
    setQuantitePiece(1);
    charger();
  };

  const retirerPiece = async (reparationPieceId) => {
    await adminApi.retirerPiece(id, reparationPieceId);
    charger();
  };

  return (
    <>
      <Link to="/admin/reparations" className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-bleu-technique hover:text-bleu-nuit">
        <ArrowLeft size={16} aria-hidden="true" /> Retour aux fiches
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-titre text-2xl font-bold text-bleu-nuit">{reparation.numero_fiche}</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-gris-texte">
            Code de suivi client : <code className="rounded bg-gris-clair px-2 py-0.5">{reparation.code_public}</code>
            <button type="button" onClick={() => navigator.clipboard.writeText(reparation.code_public)} aria-label="Copier le code">
              <Copy size={14} className="text-bleu-technique" />
            </button>
          </p>
        </div>
        <Badge tone="info">{reparation.statut_libelle}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <p className="font-titre font-semibold text-bleu-nuit">Statut et diagnostic</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-bleu-nuit">Statut</label>
                <select
                  className="input-field"
                  value={form.statut_id}
                  onChange={(e) => setForm((f) => ({ ...f, statut_id: Number(e.target.value) }))}
                >
                  {statuts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.libelle}
                    </option>
                  ))}
                </select>
              </div>
              {peutVoirFinances && (
                <div>
                  <label className="mb-1 block text-sm font-medium text-bleu-nuit">Coût (FCFA)</label>
                  <input
                    type="number"
                    min="0"
                    className="input-field"
                    value={form.cout}
                    onChange={(e) => setForm((f) => ({ ...f, cout: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-bleu-nuit">Description du statut (visible du client)</label>
              <textarea
                rows={2}
                className="input-field"
                value={form.description_statut}
                onChange={(e) => setForm((f) => ({ ...f, description_statut: e.target.value }))}
              />
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-bleu-nuit">Diagnostic</label>
              <textarea
                rows={3}
                className="input-field"
                value={form.diagnostic}
                onChange={(e) => setForm((f) => ({ ...f, diagnostic: e.target.value }))}
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-bleu-nuit">Date estimée de récupération</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date_estimee_recuperation || ''}
                  onChange={(e) => setForm((f) => ({ ...f, date_estimee_recuperation: e.target.value }))}
                />
              </div>
              {peutVoirFinances && (
                <div className="flex items-end">
                  <label className="flex items-center gap-2 text-sm text-bleu-nuit">
                    <input
                      type="checkbox"
                      checked={form.visible_publiquement}
                      onChange={(e) => setForm((f) => ({ ...f, visible_publiquement: e.target.checked }))}
                      className="h-4 w-4 rounded border-gray-300 text-bleu-technique focus:ring-bleu-technique"
                    />
                    Visible sur la page de suivi publique
                  </label>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-bleu-nuit">Commentaire pour l&apos;historique (si changement de statut)</label>
              <input
                className="input-field"
                value={commentaireHistorique}
                onChange={(e) => setCommentaireHistorique(e.target.value)}
                placeholder="Ex. Devis envoyé au client par WhatsApp."
              />
            </div>

            {message && <p className="mt-3 text-sm text-bleu-technique">{message}</p>}

            <button type="button" onClick={enregistrer} className="btn-primary mt-5" disabled={enregistrement}>
              {enregistrement ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          </Card>

          {peutVoirFinances && (
            <Card>
              <p className="font-titre font-semibold text-bleu-nuit">Devis — acceptation du client (via WhatsApp)</p>
              <p className="mt-1 text-sm text-gris-texte">
                Statut actuel :{' '}
                <Badge tone={reparation.devis_decision === 'accepte' ? 'success' : reparation.devis_decision === 'refuse' ? 'danger' : 'default'}>
                  {reparation.devis_decision.replace('_', ' ')}
                </Badge>
              </p>
              <div className="mt-3 flex gap-2">
                <button type="button" onClick={() => enregistrerDevis('accepte')} className="btn-secondary px-3 py-1.5 text-sm text-emerald-700">
                  <ThumbsUp size={16} aria-hidden="true" /> Accepté
                </button>
                <button type="button" onClick={() => enregistrerDevis('refuse')} className="btn-secondary px-3 py-1.5 text-sm text-red-600">
                  <ThumbsDown size={16} aria-hidden="true" /> Refusé
                </button>
              </div>
            </Card>
          )}

          <Card>
            <p className="font-titre font-semibold text-bleu-nuit">Pièces utilisées</p>
            <ul className="mt-3 divide-y divide-gray-100">
              {reparation.pieces.length === 0 && <p className="py-2 text-sm text-gris-texte">Aucune pièce enregistrée.</p>}
              {reparation.pieces.map((p) => (
                <li key={p.reparation_piece_id} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {p.nom} {p.reference && `(${p.reference})`} — quantité : {p.quantite}
                  </span>
                  <button type="button" onClick={() => retirerPiece(p.reparation_piece_id)} aria-label="Retirer la pièce">
                    <Trash2 size={16} className="text-red-500" />
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <select value={pieceSelectionnee} onChange={(e) => setPieceSelectionnee(e.target.value)} className="input-field w-auto">
                <option value="">Choisir une pièce…</option>
                {pieces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nom}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={quantitePiece}
                onChange={(e) => setQuantitePiece(Number(e.target.value))}
                className="input-field w-20"
              />
              <button type="button" onClick={ajouterPiece} className="btn-secondary px-3 py-2 text-sm">
                <Plus size={16} aria-hidden="true" /> Ajouter
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <p className="font-titre font-semibold text-bleu-nuit">Client</p>
            <p className="mt-2 text-sm text-gris-texte">{reparation.nom_complet}</p>
            <p className="text-sm text-gris-texte">{reparation.telephone}</p>
            {reparation.email && <p className="text-sm text-gris-texte">{reparation.email}</p>}
          </Card>

          <Card>
            <p className="font-titre font-semibold text-bleu-nuit">Appareil</p>
            <p className="mt-2 text-sm text-gris-texte">{reparation.appareil_type}</p>
            <p className="text-sm text-gris-texte">
              {reparation.appareil_marque} {reparation.appareil_modele}
            </p>
          </Card>

          <Card>
            <p className="font-titre font-semibold text-bleu-nuit">Historique</p>
            <ol className="mt-3 space-y-3 border-l-2 border-gray-200 pl-4">
              {reparation.historique.map((h) => (
                <li key={h.id}>
                  <p className="text-sm font-semibold text-bleu-nuit">{h.statut}</p>
                  {h.commentaire && <p className="text-sm text-gris-texte">{h.commentaire}</p>}
                  <p className="text-xs text-gray-400">{h.created_at}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
