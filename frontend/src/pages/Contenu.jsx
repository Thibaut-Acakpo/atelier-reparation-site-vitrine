import { useEffect, useState } from 'react';
import { Plus, Trash2, Pencil } from 'lucide-react';
import { adminApi } from '../api';
import { AdminPageHeader, Card, EmptyState, LoadingState, AccesRefuse } from '../components/ui';
import { useAuth } from '../context/AuthContext';

const TYPES = {
  services: {
    label: 'Services',
    champs: [
      { name: 'titre', label: 'Titre', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icone', label: "Icône (nom Lucide, ex. wrench)", type: 'text' },
      { name: 'ordre', label: 'Ordre', type: 'number' },
    ],
    titreAffiche: (item) => item.titre,
  },
  appareils: {
    label: "Catégories d'appareils",
    champs: [
      { name: 'code', label: 'Code (ex. telephone)', type: 'text' },
      { name: 'titre', label: 'Titre', type: 'text' },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'icone', label: 'Icône (nom Lucide)', type: 'text' },
      { name: 'ordre', label: 'Ordre', type: 'number' },
    ],
    titreAffiche: (item) => item.titre,
  },
  faq: {
    label: 'FAQ',
    champs: [
      { name: 'question', label: 'Question', type: 'text' },
      { name: 'reponse', label: 'Réponse', type: 'textarea' },
      { name: 'ordre', label: 'Ordre', type: 'number' },
    ],
    titreAffiche: (item) => item.question,
  },
};

function Formulaire({ type, initial, onAnnuler, onEnregistre }) {
  const config = TYPES[type];
  const [champs, setChamps] = useState(initial);
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState('');

  const update = (nomChamp) => (e) => setChamps((c) => ({ ...c, [nomChamp]: e.target.value }));

  const soumettre = async (e) => {
    e.preventDefault();
    setEnCours(true);
    setErreur('');
    const res = champs.id ? await adminApi.contenu.maj(type, champs.id, champs) : await adminApi.contenu.creer(type, champs);
    setEnCours(false);
    if (res.success) onEnregistre();
    else setErreur(res.message);
  };

  return (
    <Card className="mb-6">
      <form onSubmit={soumettre} className="space-y-4">
        {config.champs.map((champ) => (
          <div key={champ.name}>
            <label className="mb-1 block text-sm font-medium text-bleu-nuit">{champ.label}</label>
            {champ.type === 'textarea' ? (
              <textarea rows={2} className="input-field" value={champs[champ.name] || ''} onChange={update(champ.name)} required />
            ) : (
              <input
                type={champ.type}
                className="input-field"
                value={champs[champ.name] ?? ''}
                onChange={update(champ.name)}
                required={champ.name !== 'ordre'}
              />
            )}
          </div>
        ))}
        {erreur && <p className="text-sm text-red-600">{erreur}</p>}
        <div className="flex gap-2">
          <button type="submit" className="btn-primary" disabled={enCours}>
            {enCours ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <button type="button" onClick={onAnnuler} className="btn-secondary">
            Annuler
          </button>
        </div>
      </form>
    </Card>
  );
}

export default function Contenu() {
  const { admin } = useAuth();
  const [type, setType] = useState('services');
  const [liste, setListe] = useState(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [enEdition, setEnEdition] = useState(null);

  const charger = () => {
    setListe(null);
    adminApi.contenu.liste(type).then((res) => res.success && setListe(res.data));
  };

  useEffect(() => {
    setFormulaireOuvert(false);
    setEnEdition(null);
    charger();
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const supprimer = async (id) => {
    if (!window.confirm('Supprimer cet élément ?')) return;
    await adminApi.contenu.supprimer(type, id);
    charger();
  };

  const config = TYPES[type];

  if (admin?.role !== 'technicien') {
    return (
      <>
        <AdminPageHeader title="Contenu du site" />
        <AccesRefuse />
      </>
    );
  }

  return (
    <>
      <AdminPageHeader
        title="Contenu du site"
        description="Services, catégories d'appareils et questions fréquentes affichés sur le site public."
        action={
          !formulaireOuvert && (
            <button type="button" onClick={() => setFormulaireOuvert(true)} className="btn-primary">
              <Plus size={18} aria-hidden="true" /> Ajouter
            </button>
          )
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {Object.entries(TYPES).map(([cle, cfg]) => (
          <button
            key={cle}
            type="button"
            onClick={() => setType(cle)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              type === cle ? 'bg-bleu-technique text-white' : 'bg-white text-gris-texte ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {formulaireOuvert && (
        <Formulaire
          type={type}
          initial={enEdition || {}}
          onAnnuler={() => {
            setFormulaireOuvert(false);
            setEnEdition(null);
          }}
          onEnregistre={() => {
            setFormulaireOuvert(false);
            setEnEdition(null);
            charger();
          }}
        />
      )}

      {!liste && <LoadingState />}
      {liste && liste.length === 0 && <EmptyState message="Aucun élément pour le moment." />}

      <Card className="p-0">
        <ul className="divide-y divide-gray-100">
          {liste?.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <span className="font-medium text-bleu-nuit">{config.titreAffiche(item)}</span>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEnEdition(item);
                    setFormulaireOuvert(true);
                  }}
                  aria-label="Modifier"
                >
                  <Pencil size={16} className="text-bleu-technique" />
                </button>
                <button type="button" onClick={() => supprimer(item.id)} aria-label="Supprimer">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
