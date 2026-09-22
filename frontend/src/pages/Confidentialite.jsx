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

export default function Confidentialite() {
  return (
    <>
      <Seo title="Politique de confidentialité" description="Politique de confidentialité de l'atelier : données collectées, utilisation, conservation et vos droits." />

      <section className="py-14 sm:py-20">
        <div className="container-site mx-auto max-w-3xl">
          <h1 className="font-titre text-4xl font-extrabold text-bleu-nuit sm:text-5xl">Politique de confidentialité</h1>

          <div className="mt-10">
            <Section titre="Quelles données nous collectons">
              <p>
                Lorsque vous déposez un appareil ou nous contactez, nous collectons : votre nom, votre numéro de
                téléphone, éventuellement votre email et adresse, ainsi que les informations liées à l&apos;appareil
                déposé (marque, modèle, panne déclarée). Un code de déverrouillage n&apos;est demandé que si le
                diagnostic l&apos;exige.
              </p>
            </Section>

            <Section titre="Pourquoi nous les utilisons">
              <p>
                Ces informations servent uniquement au suivi de votre réparation (diagnostic, devis, notifications
                SMS/email) et à vous recontacter si nécessaire. Nous ne vendons ni ne partageons vos données à des
                fins commerciales.
              </p>
            </Section>

            <Section titre="Accès aux données personnelles sur l'appareil">
              <p>
                Nos techniciens n&apos;accèdent aux données présentes sur un appareil (photos, messages, contacts)
                que si cela est nécessaire au diagnostic, et uniquement avec votre consentement.
              </p>
            </Section>

            <Section titre="Durée de conservation">
              <p>
                Les informations sont conservées le temps du suivi de votre dossier, puis archivées pour
                l&apos;historique. Vous pouvez demander leur suppression à tout moment (voir « Vos droits »
                ci-dessous), sous réserve des obligations légales de conservation qui s&apos;appliqueraient.
              </p>
            </Section>

            <Section titre="Sécurité des données">
              <p>
                Les échanges avec le site sont chiffrés (HTTPS) en production. Les photos que vous transmettez sont
                vérifiées et stockées de façon à ne jamais pouvoir être exécutées comme un programme. L&apos;accès à
                votre dossier de réparation en ligne se fait uniquement via un code de suivi personnel, non
                devinable.
              </p>
            </Section>

            <Section titre="Partage avec des tiers">
              <p>
                Vos données ne sont jamais vendues. Elles peuvent être transmises à un fournisseur de pièces
                détachées uniquement lorsque cela est strictement nécessaire à la réparation, et jamais à des fins
                publicitaires.
              </p>
            </Section>

            <Section titre="Vos droits">
              <p>
                Vous pouvez demander l&apos;accès, la correction ou la suppression de vos données, ainsi que
                connaître leur usage précis, en contactant l&apos;atelier à l&apos;adresse{' '}
                <a href={`mailto:${ATELIER.email}`} className="text-bleu-technique underline hover:text-bleu-nuit">
                  {ATELIER.email}
                </a>{' '}
                ou par téléphone au {ATELIER.telephone}.
              </p>
            </Section>

            <Section titre="Contact">
              <p>
                Pour toute question relative à cette politique de confidentialité, vous pouvez nous écrire via la
                page Contact du site ou directement à {ATELIER.email}.
              </p>
            </Section>
          </div>
        </div>
      </section>
    </>
  );
}
