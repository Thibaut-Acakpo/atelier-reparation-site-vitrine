# Plateforme « Atelier de réparation » — site vitrine + gestion, multi-clients

Une seule application sert **plusieurs ateliers (vos clients)**. Chaque client
dispose de son propre site vitrine, de son propre espace de gestion, de ses
propres données et de ses propres identifiants. Depuis l'**espace développeur**
(`/gestion`), vous créez un nouveau client et son lien en quelques clics.

```
https://votre-site.com/s/tech-plus        → site vitrine du client « Tech Plus »
https://votre-site.com/s/tech-plus/admin  → espace de gestion de « Tech Plus »
https://www.techplus.bj                   → même site, avec un domaine personnalisé (facultatif)
https://votre-site.com/gestion            → VOTRE espace développeur
```

- **`backend/`** — API Node.js / Express / PostgreSQL
- **`frontend/`** — React + Vite + Tailwind CSS (site vitrine, espace admin client, espace développeur)
- **`docs/`** — installation, déploiement, API, fonctionnement multi-clients, plan de tests

## Démarrage rapide (local)

Prérequis : Node.js 22+, npm, PostgreSQL.

```bash
# 1. Backend
cd backend
cp .env.example .env          # renseigner PGPASSWORD, JWT_SECRET, TRACKING_SALT, DEVELOPER_*
npm install
npm run migrate               # crée / met à jour toutes les tables (rejouable sans risque)
npm run dev:create            # crée votre compte développeur (DEVELOPER_EMAIL / DEVELOPER_PASSWORD)
npm run seed                  # (facultatif) atelier de démonstration + identifiants affichés
npm run dev                   # API sur http://localhost:4000

# 2. Frontend (second terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173
```

Puis ouvrez **http://localhost:5173/gestion** et connectez-vous avec votre compte développeur.

## Créer un nouveau client

1. `/gestion` → **Nouveau client**.
2. Saisissez le nom (le lien se génère), l'e-mail du gérant, et choisissez le point de départ :
   contenu standard **ou duplication d'un client existant** (services, appareils, FAQ, apparence).
3. Le site, l'espace de gestion et les identifiants sont créés. Un message prêt à envoyer au client est généré.
4. Complétez ensuite son identité, ses coordonnées, ses couleurs… depuis le menu de gauche.

Détails : [`docs/MULTI_CLIENTS.md`](docs/MULTI_CLIENTS.md).

## Ce que contient l'espace développeur

| Page | Rôle |
|---|---|
| Tableau de bord | Tous vos clients, indicateurs (demandes, messages, avis), éléments à compléter |
| Nouveau client | Création complète : atelier + contenu + comptes + liens |
| Liens & accès | Liens du site/admin, comptes du client, nouveaux mots de passe, désactivation, suppression |
| Identité, Apparence, Contact & horaires | Nom, logo, couleurs (palettes), coordonnées, horaires |
| Services, Appareils, FAQ, Réalisations | Contenu du site du client (avec photos avant/après) |
| Réseaux sociaux, SEO, Domaine | Liens sociaux, titre/description Google, domaine personnalisé |

## Espace de gestion du client (`/s/<client>/admin`)

Tableau de bord, demandes de réparation, rendez-vous, réparations (statuts,
diagnostic, devis, pièces), avis (modération), messages, clients, réalisations,
contenu du site, catalogue de pièces. Aucune inscription publique : les comptes
sont créés par vous.

## Documentation

- [`docs/INSTALLATION.md`](docs/INSTALLATION.md) — installation et variables d'environnement
- [`docs/MULTI_CLIENTS.md`](docs/MULTI_CLIENTS.md) — fonctionnement multi-clients, liens, domaines
- [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md) — mise en production (Render ou VPS)
- [`docs/API.md`](docs/API.md) — endpoints publics, admin et développeur
- [`docs/PLAN_DE_TESTS.md`](docs/PLAN_DE_TESTS.md) — plan de tests
- [`docs/DONNEES_A_REMPLACER.md`](docs/DONNEES_A_REMPLACER.md) — données d'exemple à remplacer

## Points d'attention

- **Isolation des données** : chaque table métier porte un `atelier_id` et toutes les requêtes filtrent dessus.
- **Secrets** : en production, l'API refuse de démarrer si `JWT_SECRET` ou `TRACKING_SALT` ont la valeur d'exemple.
- **Fichiers uploadés** : stockés dans `UPLOAD_DIR`. Sur un hébergement à disque éphémère (Render gratuit), les photos disparaissent à chaque redéploiement : prévoir un disque persistant ou un stockage objet.
- **E-mails** : aucune notification n'est envoyée en V1 (elles sont enregistrées dans la table `notifications`).
- **Design public** : sobre par choix (cahier des charges, sections 15-16) ; l'espace développeur, lui, est animé.
