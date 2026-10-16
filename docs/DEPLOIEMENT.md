# Déploiement en production

## Principes

- HTTPS obligatoire.
- Sauvegardes régulières de la base PostgreSQL (elle contient les données de **tous** vos clients).
- Secrets uniquement par variables d'environnement, jamais dans le dépôt.
- Le même frontend et la même API servent tous les clients : ajouter un client ne demande **aucun redéploiement**.

## Option A — Render (fichier `render.yaml` fourni)

1. Pousser le dépôt sur GitHub, puis **New → Blueprint** sur Render. Il crée la base PostgreSQL, l'API et le frontend statique.
2. Renseigner les variables marquées « à saisir » :
   - API : `FRONTEND_URL` (URL du frontend), `DEVELOPER_EMAIL`, `DEVELOPER_PASSWORD`.
   - Frontend : `VITE_API_URL` (URL de l'API), puis relancer le build du frontend.
3. Au premier démarrage, l'API crée les tables et votre compte développeur automatiquement.
4. Ouvrir `https://<frontend>/gestion` et créer vos clients.

`JWT_SECRET` et `TRACKING_SALT` sont générés par Render. L'API refuse de démarrer en production avec des secrets par défaut.

> ⚠️ **Photos** : le disque d'un service Render gratuit est éphémère ; les photos uploadées (réalisations, photos de pannes) sont perdues à chaque redéploiement. Utiliser un disque persistant Render (offre payante) monté sur `UPLOAD_DIR`, ou migrer vers un stockage objet.

## Option B — VPS

1. Installer Node 22+ et PostgreSQL, copier `backend/`, puis `npm ci --omit=dev`.
2. Créer `.env` (voir `INSTALLATION.md`) avec `NODE_ENV=production`, des secrets aléatoires (`openssl rand -hex 32`),
   `FRONTEND_URL`, `DATABASE_URL`, `DEVELOPER_EMAIL`, `DEVELOPER_PASSWORD`.
3. Lancer avec `npm start` derrière `pm2` ou `systemd`.
4. Reverse proxy (nginx/Caddy) avec HTTPS devant l'API : rediriger `/api` et `/uploads` vers le port Node.
5. Frontend : `VITE_API_URL=https://api.exemple.com npm run build`, servir `frontend/dist/` avec redirection vers `index.html` :

   ```nginx
   location / { try_files $uri /index.html; }
   ```

`UPLOAD_DIR` doit pointer hors de la racine servie directement par le serveur web.

## Domaines personnalisés des clients

Voir `docs/MULTI_CLIENTS.md`. Ajouter le domaine chez l'hébergeur du frontend (même frontend pour tous),
l'enregistrer dans `/gestion → Domaine`, puis configurer le DNS. Les liens `/s/<slug>` restent toujours valables.

## Sauvegardes

`pg_dump "$DATABASE_URL" > sauvegarde.sql` (à planifier), et sauvegarde du dossier `UPLOAD_DIR`.
