import AtelierGuard from '../components/AtelierGuard';
import ContenuEditor from '../components/ContenuEditor';

export default function Faq() {
  return (
    <AtelierGuard>
      {(atelier) => (
        <ContenuEditor
          atelier={atelier}
          type="faq"
          titre="FAQ"
          description="Questions fréquentes affichées sur le site du client."
          libelleItem="une question"
          titreCarte="question"
          sousTitreCarte="reponse"
          champs={[
            { cle: 'question', label: 'Question', requis: true },
            { cle: 'reponse', label: 'Réponse', type: 'textarea', requis: true },
          ]}
        />
      )}
    </AtelierGuard>
  );
}
