# Données d'exemple à remplacer avant mise en production

Le cahier des charges indique explicitement plusieurs informations comme
"donnée d'exemple à remplacer" (section 30). Voici où elles se trouvent
dans le code :

## 1. Coordonnées de l'atelier

Fichier : `frontend/src/data/constants.js`

| Donnée | Valeur actuelle (exemple) |
|---|---|
| Nom de l'atelier | "Atelier de réparation électronique" (nom définitif à ajouter) |
| Adresse | Quartier Cadjehoun, près du carrefour Vedoko, Cotonou, Bénin |
| Téléphone | +229 90 12 34 56 |
| WhatsApp | +229 90 12 34 56 |
| Email | contact@atelier-maintenance.bj |
| Horaires | Lun-Ven 8h-18h, Sam 9h-13h, Dim fermé (déjà conformes aux règles métier, à confirmer) |

Remplacer ces valeurs, puis vérifier que `mapsQuery` (même fichier) pointe
vers la localisation réelle pour que la carte et l'itinéraire soient
corrects.

## 2. Photos

- Aucune photo réelle n'est incluse dans ce livrable (façade, accueil,
  établis, outils, équipements, réparations avant/après).
- La page Réalisations affiche un espace réservé neutre ("Photo à
  ajouter") tant qu'aucune image réelle n'est fournie — voir
  `frontend/src/components/BeforeAfterSlider.jsx`.
- Les champs `image_avant` / `image_apres` de la table `realisations`
  attendent une URL ou un chemin d'image ; à renseigner via un futur
  espace administrateur ou directement en base en attendant.

## 3. Logo

Le header (`frontend/src/components/Header.jsx`) utilise une icône
générique (clé à molette) en attendant un logo réel. Le cahier des
charges demande un logo "simple et lisible" (section 29).

## 4. Contenu éditorial

Les textes des pages À propos, Services, FAQ sont rédigés à partir des
informations du cahier des charges mais restent des propositions de
rédaction à valider par l'entreprise (section 24 : aucune distinction ou
reconnaissance inventée ne doit être publiée sans autorisation vérifiable).

## 5. EmailJS

`backend/.env` contient des variables `EMAILJS_*` vides. Aucune
notification email n'est réellement envoyée en V1 (les demandes sont
journalisées dans la table `notifications`). À configurer lors de
l'activation des notifications réelles.

## 6. Politique de confidentialité / Conditions d'utilisation

Contenu de base fourni (`frontend/src/pages/Confidentialite.jsx` et
`Conditions.jsx`) — à faire valider juridiquement avant mise en ligne,
notamment la durée de conservation des données (mentionnée comme "à
définir" dans le cahier des charges, section 18).
