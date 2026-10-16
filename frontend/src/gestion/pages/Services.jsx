import AtelierGuard from '../components/AtelierGuard';
import ContenuEditor from '../components/ContenuEditor';

export default function Services() {
  return (
    <AtelierGuard>
      {(atelier) => (
        <ContenuEditor
          atelier={atelier}
          type="services"
          titre="Services"
          description="Les prestations proposées par l’atelier, affichées sur la page Services."
          libelleItem="un service"
          titreCarte="titre"
          sousTitreCarte="description"
          champs={[
            { cle: 'titre', label: 'Titre', requis: true, placeholder: 'Réparation matérielle' },
            { cle: 'description', label: 'Description', type: 'textarea' },
            { cle: 'icone', label: 'Icône', hint: 'Nom d’icône : wrench, search, cpu, settings, terminal-square, refresh-ccw…' },
          ]}
        />
      )}
    </AtelierGuard>
  );
}
