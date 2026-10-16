# Installation

## Prérequis

- Node.js **22 ou supérieur** et npm
- PostgreSQL 14 ou supérieur

## Backend

```bash
cd backend
cp .env.example .env
npm install
```

### Variables d'environnement (`backend/.env`)

| Variable | Description | Défaut |
|---|---|---|
| `PORT` | Port de l'API | `4000` |
| `NODE_ENV` | `production` active la vérification des secrets | `development` |
| `FRONTEND_URL` | Origine du frontend (CORS) | `http://localhost:5173` |
| `DATABASE_URL` | URL PostgreSQL complète (prioritaire) | — |
| `PGHOST` `PGPORT` `PGDATABASE` `PGUSER` `PGPASSWORD` | Connexion PostgreSQL classique | `localhost` / `5432` / `atelier_reparation` / `postgres` / — |
| `UPLOAD_DIR` | Dossier des photos uploadées | `./uploads` |
| `MAX_UPLOAD_SIZE` | Taille max d'upload (octets) | `5242880` |
| `JWT_SECRET` | Secret des jetons admin (obligatoire en production) | — |
| `JWT_EXPIRES_IN` | Durée des jetons | `8h` |
| `TRACKING_SALT` | Sel des codes de suivi (obligatoire en production) | — |
| `DEVELOPER_JWT_SECRET` | Secret distinct pour l'espace développeur (facultatif) | `JWT_SECRET` |
| `DEVELOPER_EMAIL` `DEVELOPER_PASSWORD` `DEVELOPER_NAME` | Votre compte développeur | — |
| `ATELIER_NAME` `ADMIN_EMAIL` `ADMIN_PASSWORD` `ASSISTANT_EMAIL` | Atelier de démonstration (`npm run seed` uniquement) | exemples |

Créer la base : `createdb atelier_reparation` (ou via pgAdmin).

### Préparer la base

```bash
npm run migrate        # tables + statuts ; rejouable sans risque ; met aussi à niveau une ancienne base mono-atelier
npm run dev:create     # crée/met à jour le compte développeur (DEVELOPER_EMAIL / DEVELOPER_PASSWORD)
npm run seed           # facultatif : atelier de démonstration « atelier-reparation »
```

`npm run seed` affiche les identifiants du gérant et de l'assistant de démonstration, ainsi qu'un code de suivi d'exemple.

### Scripts utiles

| Commande | Effet |
|---|---|
| `npm run dev` | API avec rechargement automatique |
| `npm start` | Migration + création du compte développeur (si variables définies) + API |
| `npm run admin:reset -- <slug> [technicien\|assistant] [email] [mot_de_passe]` | Réinitialise un compte de gestion en ligne de commande |

### Vérifier

```bash
curl http://localhost:4000/api/health
```

## Frontend

```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
```

Vite redirige `/api` et `/uploads` vers `http://localhost:4000` : rien à configurer en local.
En production, définir `VITE_API_URL` (URL de l'API) avant `npm run build`.

## Adresses utiles en local

| Adresse | Contenu |
|---|---|
| `http://localhost:5173/gestion` | Espace développeur |
| `http://localhost:5173/s/<slug>` | Site d'un client |
| `http://localhost:5173/s/<slug>/admin/connexion` | Gestion d'un client |
| `http://localhost:5173/` | Premier atelier actif (local uniquement) |
