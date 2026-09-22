# Déploiement en production

## Principes (section 21 et 23 du cahier des charges)

- HTTPS obligatoire.
- Base de données avec sauvegardes régulières.
- Secrets uniquement via variables d'environnement (jamais dans le dépôt).
- Compression et cache activés.

## 1. Backend

1. Provisionner un serveur (VPS ou hébergement Node.js).
2. Copier le dossier `backend/`, installer les dépendances (`npm ci --omit=dev`).
3. Créer un `.env` de production à partir de `.env.example` avec de
   vraies valeurs, en particulier :
   - `FRONTEND_URL` pointant vers le domaine réel du site,
   - `TRACKING_SALT` généré aléatoirement (`openssl rand -hex 32`),
   - `JWT_SECRET` généré aléatoirement (`openssl rand -hex 32`) — ne
     jamais réutiliser la valeur d'exemple en production,
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` : identifiants du premier compte
     administrateur, créé au premier `npm run seed`. Changer ce mot de
     passe dès la première connexion à `/admin/connexion`.
   - `UPLOAD_DIR` pointant vers un dossier **hors de la racine servie
     directement par le serveur web**, pour éviter toute exécution de
     fichier uploadé (section 18).
4. Lancer l'API derrière un gestionnaire de process (`pm2`, `systemd`, ou
   équivalent) plutôt qu'en premier plan.
5. Placer un reverse proxy (nginx, Caddy) devant l'API pour gérer HTTPS
   (Let's Encrypt) et rediriger `/api` et `/uploads` vers le port Node.
6. Sauvegarder régulièrement le fichier SQLite (`backend/data/*.sqlite`)
   ou le dossier de données de la base choisie.

### Portage vers MySQL / PostgreSQL (recommandé à l'échelle)

Le schéma dans `backend/src/db.js` utilise une syntaxe SQLite volontairement
proche du SQL standard. Pour porter vers MySQL/PostgreSQL :

- Remplacer `INTEGER PRIMARY KEY AUTOINCREMENT` par `SERIAL PRIMARY KEY`
  (PostgreSQL) ou `INT AUTO_INCREMENT PRIMARY KEY` (MySQL).
- Remplacer `datetime('now')` par `NOW()` / `CURRENT_TIMESTAMP`.
- Remplacer le module `node:sqlite` par `pg` ou `mysql2`, et adapter
  `backend/src/db.js` (la logique des routes, elle, ne change pas car
  elle passe par des requêtes préparées simples).
- Vérifier les contraintes `CHECK` (supportées nativement par PostgreSQL ;
  à adapter en triggers ou validation applicative sous MySQL < 8.0.16).

## 2. Frontend

1. `npm run build` dans `frontend/` génère `frontend/dist/`.
2. Servir ce dossier via un serveur statique (nginx, Netlify, Vercel,
   ou le même serveur nginx que le backend).
3. Configurer les routes pour rediriger toute URL inconnue vers
   `index.html` (routage côté client avec React Router) — par exemple,
   avec nginx :

   ```nginx
   location / {
     try_files $uri /index.html;
   }
   ```

4. Si le frontend et l'API ne partagent pas le même domaine, définir
   `VITE_API_URL` avant le build, ou configurer un reverse proxy pour que
   `/api` et `/uploads` pointent vers le backend depuis le même domaine
   (recommandé, évite tout souci de CORS).

## 3. Nom de domaine et HTTPS

- Pointer le domaine vers le serveur.
- Générer un certificat TLS (Let's Encrypt via Certbot, ou intégré à
  l'hébergeur).
- Forcer la redirection HTTP → HTTPS.

## 4. Vérifications avant mise en ligne (section 26)

Voir la checklist complète dans `docs/PLAN_DE_TESTS.md`. Points essentiels :

- [ ] Le site est bien servi en HTTPS, sans contenu mixte.
- [ ] Les variables `.env` de production sont renseignées et absentes du dépôt.
- [ ] Les données d'exemple ont été remplacées (voir `docs/DONNEES_A_REMPLACER.md`).
- [ ] Une sauvegarde de la base de données est planifiée.
- [ ] Le formulaire de demande, de rendez-vous, de contact et d'avis
      fonctionnent en production (test réel, pas seulement en local).
- [ ] La page de suivi renvoie un message neutre pour un code inexistant.
