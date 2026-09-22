import Seo from '../components/Seo';
import { ATELIER } from '../data/constants';

function Section({ titre, children }) {
  return (
    <div className="mb-8">
      <h2 className="font-titre text-xl font-bold text-bleu-nuit sm:text-2xl">{titre}</h2>
      <div className="mt-2 space-y-3 leading-relaxed text-gris-texte">{children}</div>
    </div>
  );
}

export default function Conditions() {
  return (
    <>
      <Seo title="Conditions d'utilisation" description="Conditions d'utilisation du site de l'atelier de réparation électronique." />

      <section className="py-14 sm:py-20">
        <div className="container-site mx-auto max-w-3xl">
          <h1 className="font-titre text-4xl font-extrabold text-bleu-nuit sm:text-5xl">Conditions d&apos;utilisation</h1>

          <div className="mt-10">
            <Section titre="Objet du site">
              <p>
                Ce site présente les services de {ATELIER.nom} et permet de déposer une demande de réparation, de
                demander un rendez-vous, de suivre une réparation en cours et de contacter l&apos;atelier. L&apos;utilisation
                du site implique l&apos;acceptation pleine et entière des présentes conditions.
              </p>
            </Section>

            <Section titre="Diagnostic et devis">
              <p>
                Le diagnostic est gratuit et réalisé exclusivement à l&apos;atelier. Aucune estimation de prix
                n&apos;est communiquée en ligne. Toute réparation est soumise à votre accord préalable, donné après
                réception du diagnostic et du devis, généralement par WhatsApp ou téléphone.
              </p>
            </Section>

            <Section titre="Suivi de réparation">
              <p>
                Le code de suivi communiqué lors du dépôt de votre appareil est strictement personnel. Il permet de
                consulter l&apos;état d&apos;avancement de votre réparation sur la page « Suivre ma réparation ». Ne le
                partagez pas si vous ne souhaitez pas que ces informations soient consultées par un tiers.
              </p>
            </Section>

            <Section titre="Rendez-vous">
              <p>
                Une demande de rendez-vous ou de dépôt n&apos;est confirmée qu&apos;après validation par l&apos;atelier. La
                date et l&apos;heure indiquées lors de votre demande sont des souhaits, pas une confirmation
                automatique.
              </p>
            </Section>

            <Section titre="Avis clients">
              <p>
                Les avis soumis via le site sont modérés avant publication. L&apos;atelier se réserve le droit de
                refuser ou de retirer un avis ne respectant pas les règles élémentaires de courtoisie, ou dont
                l&apos;authenticité ne peut être vérifiée.
              </p>
            </Section>

            <Section titre="Responsabilité">
              <p>
                L&apos;atelier ne peut être tenu responsable des conséquences liées à des informations erronées ou
                incomplètes transmises par le client via les formulaires du site (coordonnées, description de la
                panne, disponibilité de l&apos;appareil, etc.).
              </p>
            </Section>

            <Section titre="Propriété intellectuelle">
              <p>
                Les textes, photos de réalisations et éléments graphiques de ce site sont la propriété de{' '}
                {ATELIER.nom} et ne peuvent être réutilisés sans autorisation préalable.
              </p>
            </Section>

            <Section titre="Modification des conditions">
              <p>
                Ces conditions peuvent être modifiées à tout moment pour refléter une évolution du site ou de la
                réglementation. La version en vigueur est celle publiée sur cette page.
              </p>
            </Section>

            <Section titre="Contact">
              <p>
                Pour toute question relative à ces conditions d&apos;utilisation, contactez-nous à{' '}
                <a href={`mailto:${ATELIER.email}`} className="text-bleu-technique underline hover:text-bleu-nuit">
                  {ATELIER.email}
                </a>{' '}
                ou au {ATELIER.telephone}.
              </p>
            </Section>
          </div>
        </div>
      </section>
    </>
  );
}
