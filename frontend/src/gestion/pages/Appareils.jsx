import AtelierGuard from '../components/AtelierGuard';
import ContenuEditor from '../components/ContenuEditor';

export default function Appareils() {
  return (
    <AtelierGuard>
      {(atelier) => (
        <ContenuEditor
          atelier={atelier}
          type="appareils"
          titre="Types d’appareils"
          description="Catégories d’appareils réparés, proposées dans le formulaire de demande."
          libelleItem="un type d’appareil"
          titreCarte="titre"
          sousTitreCarte="description"
          champs={[
            { cle: 'code', label: 'Code', requis: true, hint: 'Identifiant technique unique, en minuscules : telephone, ordinateur…' },
            { cle: 'titre', label: 'Titre', requis: true, placeholder: 'Téléphones' },
            { cle: 'description', label: 'Description', type: 'textarea' },
            { cle: 'icone', label: 'Icône', hint: 'smartphone, laptop, tablet, cpu…' },
          ]}
        />
      )}
    </AtelierGuard>
  );
}
