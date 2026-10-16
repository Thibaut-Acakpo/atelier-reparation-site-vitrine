# Fonctionnement multi-clients

## Principe

Un **atelier** = un client. Chaque atelier a :

- un **slug** (ex. `tech-plus`) → lien `https://votre-site.com/s/tech-plus` ;
- éventuellement un **domaine personnalisé** (ex. `techplus.bj`) ;
- ses propres paramètres, contenu, demandes, réparations, clients, avis, messages ;
- ses propres comptes de gestion (technicien, et assistant facultatif).

Les données sont séparées par la colonne `atelier_id`, présente sur toutes les tables métier.
Un compte de gestion n'accède qu'aux données de son atelier (l'`atelier_id` est inscrit dans son jeton).

## Comment le site sait quel client afficher

Dans l'ordre :

1. **Lien `/s/<slug>`** : le frontend lit le slug dans l'URL, l'utilise comme préfixe des routes
   et l'envoie à l'API dans l'en-tête `X-Atelier-Slug`. Aucune configuration DNS : c'est le moyen
   le plus simple de mettre un client en ligne immédiatement.
2. **Sous-domaine local** `xxx.localhost` (développement).
3. **Domaine personnalisé** : l'API compare le domaine de la requête à ceux enregistrés dans `ateliers.domaine`.
4. En local uniquement (`localhost`) : premier atelier actif.

Un lien inconnu ou un site désactivé affiche « Site introuvable ».

## Procédure : nouveau client

1. `/gestion` → **Nouveau client** → saisir nom, e-mail du gérant, point de départ → **Créer**.
2. Copier le message généré (liens + identifiants) et l'envoyer au client. Le mot de passe n'est affiché qu'une fois ;
   en cas de perte : **Liens & accès → Nouveau mot de passe**.
3. Compléter : Identité (nom, logo), Contact & horaires, Apparence, Services/Appareils/FAQ, Réalisations, Réseaux sociaux, SEO.
4. (Facultatif) **Domaine** : enregistrer le domaine du client, l'ajouter chez l'hébergeur du frontend, puis créer l'enregistrement DNS.

Le tableau de bord signale les clients dont les coordonnées (téléphone, WhatsApp, e-mail, adresse, logo) sont encore vides.

## Dupliquer un client

À la création, « Dupliquer un client existant » copie services, types d'appareils, FAQ, horaires et apparence.
Les coordonnées (téléphone, adresse, e-mail) ne sont **jamais** copiées, pour éviter d'afficher les infos d'un autre client.

## Désactiver / supprimer

- **Désactiver** : le site devient inaccessible et le client ne peut plus se connecter ; aucune donnée n'est perdue.
- **Supprimer** : possible uniquement sur un client désactivé, après saisie de son slug. Toutes ses données sont effacées
  (les photos déjà envoyées restent sur le disque).

## Ajouter un domaine personnalisé

1. `/gestion` → **Domaine** → saisir `techplus.bj` → Enregistrer.
2. Chez l'hébergeur du **frontend** (Render, Netlify, Vercel…), ajouter `techplus.bj` comme domaine personnalisé.
3. Chez le registrar, créer l'enregistrement DNS demandé (CNAME / A).

Le CORS de l'API autorise automatiquement tout domaine enregistré ; aucun redéploiement n'est nécessaire.
