import { useState } from 'react';
import { Search, Phone, MessageCircle, AlertCircle } from 'lucide-react';
import Seo from '../components/Seo';
import PageHero from '../components/PageHero';
import ScrollReveal from '../components/ScrollReveal';
import TrackingTimeline from '../components/TrackingTimeline';
import { api } from '../data/api';
import { ATELIER, whatsappLink } from '../data/constants';

export default function Suivi() {
  const [numero, setNumero] = useState('');
  const [statutRequete, setStatutRequete] = useState('idle'); // idle | loading | success | notfound | error
  const [fiche, setFiche] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valeur = numero.trim();
    if (!valeur) return;

    setStatutRequete('loading');
    setFiche(null);

    try {
      const res = await api.suivreReparation(valeur);
      if (res.success) {
        setFiche(res.data);
        setStatutRequete('success');
      } else if (res.httpStatus === 404) {
        setStatutRequete('notfound');
      } else if (res.httpStatus === 429) {
        setStatutRequete('rate_limited');
      } else {
        setStatutRequete('error');
      }
    } catch {
      setStatutRequete('error');
    }
  };

  return (
    <>
      <Seo title="Suivre ma réparation" description="Suivez en temps réel l'état de votre réparation à partir de votre numéro de fiche." />
      <PageHero
        eyebrow="Suivi"
        title="Suivre ma réparation"
        description="Saisissez le code de suivi communiqué par l'atelier pour consulter l'état de votre appareil."
      />

      <section className="py-16 sm:py-20">
        <div className="container-site mx-auto max-w-2xl">
          <ScrollReveal>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row" role="search">
              <label htmlFor="numero-fiche" className="sr-only">
                Numéro de fiche ou code de suivi
              </label>
              <input
                id="numero-fiche"
                type="text"
                required
                value={numero}
                onChange={(e) => setNumero(e.target.value)}
                placeholder="Ex. REP-2026-0184 ou votre code de suivi"
                className="input-field flex-1"
                autoComplete="off"
              />
              <button type="submit" className="btn-primary shrink-0" disabled={statutRequete === 'loading'}>
                <Search size={18} aria-hidden="true" />
                {statutRequete === 'loading' ? 'Recherche…' : 'Rechercher'}
              </button>
            </form>
          </ScrollReveal>

          {/* Indicateur discret pendant la recherche */}
          {statutRequete === 'loading' && (
            <div className="mt-8 animate-pulse space-y-3" aria-live="polite" aria-busy="true">
              <div className="h-4 w-1/3 rounded bg-gray-200" />
              <div className="h-24 rounded-xl bg-gray-100" />
            </div>
          )}

          {(statutRequete === 'notfound' || statutRequete === 'error' || statutRequete === 'rate_limited') && (
            <div className="mt-8 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900" role="alert">
              <AlertCircle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                {statutRequete === 'notfound' && (
                  <p>Aucune réparation ne correspond à ce numéro. Vérifiez votre saisie ou contactez l&apos;atelier.</p>
                )}
                {statutRequete === 'rate_limited' && <p>Trop de recherches. Réessayez dans quelques minutes.</p>}
                {statutRequete === 'error' && <p>Une erreur est survenue. Réessayez dans un instant.</p>}
              </div>
            </div>
          )}

          {statutRequete === 'success' && fiche && (
            <div className="mt-10 animate-fade-up">
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-bleu-nuit/5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-gris-texte">Fiche</p>
                    <p className="font-titre text-xl font-bold text-bleu-nuit">{fiche.numero_fiche}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gris-texte">Appareil</p>
                    <p className="font-medium text-bleu-nuit">
                      {fiche.appareil.marque} {fiche.appareil.modele}
                    </p>
                  </div>
                </div>

                {fiche.description_statut && (
                  <p className="mt-4 rounded-lg bg-gris-clair p-3 text-sm text-gris-texte">{fiche.description_statut}</p>
                )}

                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {fiche.diagnostic && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gris-texte">Diagnostic</p>
                      <p className="mt-1 text-bleu-nuit">{fiche.diagnostic}</p>
                    </div>
                  )}
                  {fiche.cout != null && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gris-texte">Coût</p>
                      <p className="mt-1 text-bleu-nuit">{fiche.cout.toLocaleString('fr-FR')} FCFA</p>
                    </div>
                  )}
                  {fiche.pieces_remplacees?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gris-texte">Pièces remplacées</p>
                      <p className="mt-1 text-bleu-nuit">{fiche.pieces_remplacees.map((p) => p.nom).join(', ')}</p>
                    </div>
                  )}
                  {fiche.date_estimee_recuperation && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-gris-texte">Date estimée de récupération</p>
                      <p className="mt-1 text-bleu-nuit">{fiche.date_estimee_recuperation}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <p className="mb-4 font-titre font-semibold text-bleu-nuit">Historique</p>
                <TrackingTimeline statutActuel={fiche.statut} historique={fiche.historique} />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href={`tel:${ATELIER.telephone.replace(/\s/g, '')}`} className="btn-secondary">
                  <Phone size={18} aria-hidden="true" /> Appeler l&apos;atelier
                </a>
                <a
                  href={whatsappLink(`Bonjour, je vous contacte au sujet de la fiche ${fiche.numero_fiche}.`)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                >
                  <MessageCircle size={18} aria-hidden="true" /> Contacter sur WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
