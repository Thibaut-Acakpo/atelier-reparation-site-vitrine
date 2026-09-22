# Site vitrine — Atelier de réparation électronique (V1)

Implémentation du site vitrine décrit dans le *Cahier des charges — Site
vitrine premium pour une entreprise de réparation électronique (V1.0)*.

Ce dépôt contient :

- **`backend/`** — API Node.js / Express / SQLite (section 20-21 du cahier des charges)
- **`frontend/`** — Site React + Tailwind CSS (section 21)
- **`docs/`** — Documentation d'installation, de déploiement, de l'API et plan de tests

## Aperçu des fonctionnalités livrées (V1)

| Fonctionnalité | Statut |
|---|---|
| Accueil, Services, Appareils, Réalisations, À propos | ✅ |
| Suivi réel d'une réparation par code de suivi | ✅ |
| Demande de réparation avec photo facultative | ✅ |
| Demande de rendez-vous (date/heure souhaitées) | ✅ |
| Contact (formulaire, carte, coordonnées) | ✅ |
| FAQ | ✅ |
| Avis clients (soumission + modération) | ✅ modération via l'espace admin |
| Politique de confidentialité / Conditions | ✅ (contenu de base à valider juridiquement) |
| Espace administrateur complet (section 25) | ✅ |
| Paiement en ligne / compte client | ❌ Hors périmètre V1 (conforme au cahier des charges) |

## Démarrage rapide (développement local)

Prérequis : Node.js 22.5+ et npm (le backend utilise le module SQLite
intégré à Node — aucune compilation native requise à l'installation).

```bash
# 1. Backend
cd backend
cp .env.example .env
npm install
npm run seed     # crée la base SQLite + données de démonstration
npm run dev       # démarre l'API sur http://localhost:4000

# 2. Frontend (dans un second terminal)
cd frontend
npm install
npm run dev       # démarre le site sur http://localhost:5173
```

Le frontend est configuré (`vite.config.js`) pour rediriger `/api` et
`/uploads` vers `http://localhost:4000` en développement — aucune
configuration supplémentaire n'est nécessaire en local.

`npm run seed` affiche dans la console un **code de suivi de démonstration**
à utiliser sur la page "Suivre ma réparation" pour tester la fonctionnalité
sans créer de nouvelle demande, ainsi qu'un **compte administrateur** (email
+ mot de passe généré) pour se connecter à l'espace admin.

## Espace administrateur

Accessible sur `http://localhost:5173/admin/connexion` (les identifiants
sont affichés dans la console par `npm run seed`, voir ci-dessus). Aucune
inscription publique n'est possible — c'est volontaire.

Fonctionnalités disponibles (section 25 du cahier des charges) :

- Tableau de bord (indicateurs clés)
- Demandes de réparation : suivi, conversion en fiche avec génération
  automatique du numéro de fiche et du code de suivi
- Rendez-vous : confirmation, refus, proposition d'un autre créneau
- Réparations : changement de statut avec historique automatique,
  diagnostic, coût, date estimée, pièces utilisées, décision du devis
  (accepté/refusé, communiqué par le client via WhatsApp)
- Avis clients : modération (seuls les avis validés sont publics)
- Messages de contact : suivi traité / non traité
- Clients : recherche et fiche détaillée
- Réalisations : création/édition avec upload des photos avant/après
- Contenu du site : services, catégories d'appareils, FAQ
- Catalogue de pièces

Voir [`docs/API.md`](docs/API.md) pour le détail des endpoints `/api/admin/*`.

Voir `docs/INSTALLATION.md` pour le détail des variables d'environnement,
et `docs/DEPLOIEMENT.md` pour la mise en production.

## Documentation

- [`docs/INSTALLATION.md`](docs/INSTALLATION.md) — installation détaillée, variables d'environnement
- [`docs/DEPLOIEMENT.md`](docs/DEPLOIEMENT.md) — déploiement en production, HTTPS, sauvegardes
- [`docs/API.md`](docs/API.md) — documentation des endpoints de l'API V1
- [`docs/PLAN_DE_TESTS.md`](docs/PLAN_DE_TESTS.md) — plan de tests (section 27 du cahier des charges)
- [`docs/DONNEES_A_REMPLACER.md`](docs/DONNEES_A_REMPLACER.md) — liste des données d'exemple à remplacer avant mise en ligne

## Points d'attention avant mise en production

Ces points sont volontairement laissés ouverts car ils dépendent de
décisions propres à l'entreprise (voir `docs/DONNEES_A_REMPLACER.md`) :

1. **Nom définitif de l'atelier**, coordonnées réelles (téléphone, WhatsApp,
   email, adresse) — actuellement des valeurs d'exemple dans
   `frontend/src/data/constants.js`.
2. **Photos réelles** de l'atelier et des réalisations (le cahier des
   charges demande explicitement d'éviter les banques d'images génériques).
3. **Choix définitif de la base de données pour la production** : ce projet
   utilise SQLite pour simplifier l'installation et la démonstration ; un
   portage vers MySQL/PostgreSQL est recommandé pour une charge de
   production plus importante (le schéma SQL est directement transposable,
   voir `docs/DEPLOIEMENT.md`).
4. **EmailJS** : les clés ne sont pas configurées (aucune notification
   n'est réellement envoyée en V1 ; les demandes sont enregistrées dans la
   table `notifications` pour une intégration ultérieure).
5. **Politique de confidentialité et conditions d'utilisation** : contenu
   de base fourni, à faire valider juridiquement.
6. **Mot de passe administrateur** : changez le mot de passe généré au
   premier lancement (`npm run seed`) dès la première connexion, via
   l'espace admin (ou en renseignant `ADMIN_PASSWORD` dans `.env` avant
   le tout premier `npm run seed`).

## Choix techniques notables

- **Design** : palette et typographie conformes à la section 15 du cahier
  des charges (bleu nuit, bleu technique, bleu clair, or discret en accent
  uniquement). Animations limitées à des apparitions au scroll, des
  micro-interactions et une galerie avant/après interactive — les effets
  3D lourds et les animations permanentes sont volontairement évités,
  conformément à la section 16 du cahier des charges ("éviter les effets
  3D lourds et tout effet qui gêne la lecture").
- **Sécurité** : validation client + serveur, limitation de débit
  (rate limiting) sur les formulaires et le suivi, vérification du
  contenu réel des fichiers uploadés (pas seulement l'extension),
  renommage aléatoire des fichiers stockés, code de suivi non énumérable
  distinct du numéro de fiche interne (section 18.1).
- **Accessibilité** : navigation clavier, focus visible, libellés
  explicites, respect de `prefers-reduced-motion`, zones tactiles adaptées
  au mobile.
