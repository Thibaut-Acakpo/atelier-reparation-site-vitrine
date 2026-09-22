# Documentation API — V1

Toutes les réponses suivent le format défini section 20 du cahier des charges :

```json
{ "success": true, "message": "Opération réussie", "data": { }, "errors": [] }
```

```json
{ "success": false, "message": "Une erreur est survenue", "data": null, "errors": [] }
```

`errors` liste les noms des champs invalides lors d'une erreur de validation (HTTP 422).

Base URL en développement : `http://localhost:4000` (ou via le proxy Vite : `http://localhost:5173`).

## POST /api/demandes-reparation

Crée une demande de réparation. `multipart/form-data` (pour permettre l'envoi de la photo facultative).

| Champ | Type | Obligatoire | Règle |
|---|---|---|---|
| `nom_complet` | texte | oui | 2 caractères minimum |
| `telephone` | texte | oui | format contrôlé |
| `email` | texte | non | format contrôlé si renseigné |
| `type` | texte | oui | `telephone`, `ordinateur`, `tablette`, `autre` |
| `marque` | texte | oui | — |
| `modele` | texte | oui | — |
| `panne` | texte | oui | 1000 caractères max |
| `photo` | fichier | non | JPG/PNG/WebP, 5 Mo max |
| `date_souhaitee` | date (AAAA-MM-JJ) | oui | date future |
| `heure_souhaitee` | heure (HH:MM) | oui | dans les horaires de l'atelier |
| `confidentialite_acceptee` | booléen | oui | doit être vrai |

Limité à 10 requêtes / heure / IP.

## POST /api/rendez-vous

`application/json`. Champs : `nom_complet`, `telephone`, `email` (facultatif), `date_souhaitee`, `heure_souhaitee`, `motif` (facultatif). Mêmes règles de date/heure que ci-dessus. Limité à 10 requêtes / heure / IP.

## POST /api/contact

`application/json`. Champs : `nom`, `email`, `telephone` (facultatif), `sujet` (facultatif), `message` (2000 caractères max). Comporte un champ honeypot `site_web` (doit rester vide). Limité à 15 requêtes / heure / IP.

## POST /api/avis

`application/json`. Champs : `nom`, `note` (1 à 5), `commentaire` (800 caractères max). L'avis est toujours créé avec le statut `en_attente`. Limité à 5 requêtes / jour / IP.

## GET /api/reparations/:numero

`:numero` est le **code de suivi public** (non énumérable), pas le
numéro de fiche interne. Renvoie les informations publiques autorisées
(section 11) : statut, diagnostic si publiable, coût si défini, pièces
remplacées, date estimée de récupération, historique des changements de
statut.

- Un code inexistant renvoie **HTTP 404** avec un message neutre, sans
  fuite d'information (section 7.3 et 18.1).
- Limité à 20 requêtes / 15 min / IP pour limiter l'énumération.

## GET /api/realisations

Liste les réalisations publiées (galerie avant/après). Aucune donnée
personnelle des clients n'est incluse.

## GET /api/services

Liste les services proposés.

## GET /api/appareils

Liste les catégories d'appareils pris en charge.

## GET /api/faq

Liste les questions/réponses de la FAQ.

## GET /api/avis-valides

Liste les avis validés (statut `valide`) — utilisé pour l'accueil, qui
n'affiche jamais les avis en attente.

## GET /api/health

Vérification de disponibilité de l'API (utile pour la supervision).

---

## Espace administrateur — `/api/admin/*`

Toutes ces routes, à l'exception de `/api/admin/auth/login`, exigent un
en-tête `Authorization: Bearer <jeton>` obtenu à la connexion. Un jeton
invalide ou expiré renvoie **HTTP 401**.

### Authentification

- `POST /api/admin/auth/login` — `{ email, mot_de_passe }` → `{ token, admin }`. Limité à 10 tentatives / 15 min / IP. Message d'erreur identique en cas d'email inconnu ou de mot de passe erroné.
- `GET /api/admin/auth/me` — vérifie la validité du jeton, renvoie l'admin connecté.
- `POST /api/admin/auth/changer-mot-de-passe` — `{ mot_de_passe_actuel, nouveau_mot_de_passe }`.

### Tableau de bord

- `GET /api/admin/dashboard` — compteurs (demandes nouvelles, rendez-vous en attente, réparations en cours, avis en attente, contacts non traités, total clients) et les 5 dernières demandes.

### Demandes de réparation

- `GET /api/admin/demandes?statut=nouvelle|en_cours_examen|convertie|refusee`
- `GET /api/admin/demandes/:id`
- `PATCH /api/admin/demandes/:id` — `{ statut_traitement }`
- `POST /api/admin/demandes/:id/convertir` — crée automatiquement une fiche de réparation (numéro de fiche + code de suivi) à partir de la demande ; renvoie `{ id, numero_fiche, code_public }` à communiquer au client.

### Rendez-vous

- `GET /api/admin/rendez-vous?statut=en_attente|confirme|modifie|refuse`
- `PATCH /api/admin/rendez-vous/:id` — `{ statut }`, ou `{ statut: "modifie", date_souhaitee, heure_souhaitee }` pour proposer un autre créneau.

### Réparations

- `GET /api/admin/reparations?q=texte&statut=code_statut` — recherche par numéro de fiche, nom ou téléphone.
- `GET /api/admin/reparations/:id` — détail complet (historique, pièces).
- `PATCH /api/admin/reparations/:id` — `{ statut_id, description_statut, diagnostic, cout, date_estimee_recuperation, visible_publiquement, commentaire_historique }`. Un changement de `statut_id` ajoute automatiquement une entrée à l'historique.
- `PATCH /api/admin/reparations/:id/devis` — `{ devis_decision: "accepte"|"refuse"|"en_attente" }` — enregistre la décision du client transmise via WhatsApp (section 12).
- `POST /api/admin/reparations/:id/pieces` — `{ piece_id, quantite }`
- `DELETE /api/admin/reparations/:id/pieces/:reparationPieceId`

### Avis clients

- `GET /api/admin/avis?statut=en_attente|valide|refuse`
- `PATCH /api/admin/avis/:id` — `{ statut }`
- `DELETE /api/admin/avis/:id`

### Messages de contact

- `GET /api/admin/contacts?traite=0|1`
- `PATCH /api/admin/contacts/:id` — `{ traite: true|false }`

### Clients

- `GET /api/admin/clients?q=texte`
- `GET /api/admin/clients/:id` — fiche client + appareils + réparations + rendez-vous.

### Réalisations (galerie avant/après)

- `GET /api/admin/realisations` — inclut les réalisations non publiées.
- `POST /api/admin/realisations` — `multipart/form-data` : `titre, type_appareil, marque, modele, probleme, intervention, publie, photo_avant, photo_apres`.
- `PATCH /api/admin/realisations/:id` — mêmes champs, tous facultatifs.
- `DELETE /api/admin/realisations/:id`

### Catalogue de pièces

- `GET /api/admin/pieces`
- `POST /api/admin/pieces` — `{ nom, reference }`
- `DELETE /api/admin/pieces/:id`

### Référentiel des statuts

- `GET /api/admin/statuts` — liste ordonnée des statuts de réparation (section 11).

### Contenu du site

- `GET /api/admin/contenu/{services|appareils|faq}`
- `POST /api/admin/contenu/{services|appareils|faq}`
- `PATCH /api/admin/contenu/{services|appareils|faq}/:id`
- `DELETE /api/admin/contenu/{services|appareils|faq}/:id`

Champs attendus par type : `services` (`titre, description, icone, ordre`),
`appareils` (`code, titre, description, icone, ordre`), `faq`
(`question, reponse, ordre`).
