# Installation

## Prérequis

- Node.js **22.5 ou supérieur** (le backend utilise le module SQLite intégré à Node, `node:sqlite`, pour éviter toute compilation native lors de l'installation — pas de Visual Studio Build Tools ni Xcode nécessaires)
- npm

## Backend

```bash
cd backend
cp .env.example .env
npm install
```

### Variables d'environnement (`backend/.env`)

| Variable | Description | Défaut |
|---|---|---|
| `PORT` | Port d'écoute de l'API | `4000` |
| `FRONTEND_URL` | Origine autorisée pour le CORS | `http://localhost:5173` |
| `DATABASE_FILE` | Chemin du fichier SQLite | `./data/atelier.sqlite` |
| `UPLOAD_DIR` | Dossier de stockage des photos uploadées | `./uploads` |
| `MAX_UPLOAD_SIZE` | Taille max d'upload (octets) | `5242880` (5 Mo) |
| `TRACKING_SALT` | Réservé à une évolution future (signature de jetons) | — |
| `EMAILJS_*` | Clés EmailJS (optionnel, non utilisées en V1) | vide |
| `ATELIER_NAME` | Nom de l'atelier | valeur d'exemple |

### Initialiser la base de données

```bash
npm run seed
```

Ce script :
- crée le schéma de base (tables listées section 19 du cahier des charges),
- insère les statuts de réparation, services, catégories d'appareils, FAQ, réalisations et avis de démonstration,
- crée **une fiche de réparation de démonstration** et affiche son *code de suivi* dans la console — à utiliser sur la page "Suivre ma réparation" du site,
- crée **un compte administrateur** (si aucun n'existe déjà) et affiche son email et son mot de passe dans la console — à utiliser sur `/admin/connexion`. Renseigner `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `.env` avant ce premier lancement pour choisir des identifiants précis ; sinon un mot de passe aléatoire est généré et affiché une seule fois.

Le script peut être relancé sans dupliquer les données de référence
(services, FAQ, catégories, avis, réalisations) grâce à des vérifications
`INSERT OR IGNORE` / comptage préalable.

### Démarrer l'API

```bash
npm run dev     # avec rechargement automatique (nodemon)
# ou
npm start       # démarrage simple
```

L'API écoute par défaut sur `http://localhost:4000`. Vérifier avec :

```bash
curl http://localhost:4000/api/health
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Le site est servi sur `http://localhost:5173`. En développement, Vite
redirige automatiquement les appels `/api/*` et `/uploads/*` vers
`http://localhost:4000` (voir `frontend/vite.config.js`) : aucune
configuration CORS supplémentaire n'est nécessaire en local.

### Construire le site pour la production

```bash
npm run build
```

Génère un dossier `frontend/dist/` prêt à être servi par un serveur web
statique (voir `docs/DEPLOIEMENT.md`).

### Variable d'environnement frontend (optionnelle)

Si le backend n'est pas servi sur le même domaine que le frontend en
production, créer un fichier `frontend/.env` avec :

```
VITE_API_URL=https://api.votre-domaine.bj
```
