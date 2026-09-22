# Plan de tests (section 27 du cahier des charges)

Ce plan couvre les tests manuels à effectuer avant chaque mise en
production, et sert de base à une future suite de tests automatisés.

## 1. Formulaires

- [ ] Demande de réparation : soumission valide → confirmation affichée, entrée créée en base.
- [ ] Demande de réparation : champs obligatoires vides → erreurs affichées, aucune requête envoyée.
- [ ] Demande de réparation : téléphone mal formé → erreur affichée.
- [ ] Demande de réparation : case confidentialité non cochée → soumission bloquée.
- [ ] Rendez-vous : soumission valide → confirmation affichée.
- [ ] Rendez-vous : date passée → erreur affichée (client et serveur).
- [ ] Rendez-vous : heure hors horaires ou un dimanche → erreur affichée (client et serveur).
- [ ] Contact : message vide ou email invalide → erreur affichée.
- [ ] Avis : note hors de 1–5 impossible (menu déroulant fermé) ; commentaire vide bloqué.

## 2. Validation

- [ ] Toutes les validations du formulaire de demande sont revérifiées côté serveur, même si le client les a déjà validées (tester avec un appel API direct, ex. `curl`, en contournant le frontend).
- [ ] Une requête avec un champ manquant renvoie HTTP 422 et la liste des champs en erreur dans `errors`.

## 3. Uploads

- [ ] Envoi d'une photo JPG/PNG/WebP valide → acceptée, accessible via `/uploads/...`.
- [ ] Envoi d'un fichier renommé en `.jpg` mais dont le contenu n'est pas une image → rejeté (vérification des octets magiques).
- [ ] Envoi d'un fichier dépassant la taille maximale → rejeté avec message clair.
- [ ] Envoi d'un fichier d'un type non autorisé (ex. `.exe`, `.php`) → rejeté.

## 4. Suivi

- [ ] Code de suivi valide → informations correctes affichées (statut, historique, diagnostic si publiable).
- [ ] Code de suivi inexistant → message neutre, HTTP 404, aucune fuite d'information.
- [ ] Recherches répétées rapides depuis la même IP → limitation de débit déclenchée (HTTP 429) après le seuil.

## 5. Statuts

- [ ] Chaque statut de la section 11 est bien représenté dans `statuts_reparation` après `npm run seed`.
- [ ] La timeline de suivi (frontend) reflète correctement la progression pour un statut de la séquence normale.
- [ ] Un statut hors séquence ("Réparation impossible", "Réparation annulée") est affiché sans casser la timeline.

## 6. Responsive

- [ ] Navigation, formulaires et galerie avant/après utilisables sur mobile (360px), tablette (768px) et desktop (1440px).
- [ ] Le menu mobile s'ouvre/se ferme correctement et reste accessible au clavier.

## 7. Clavier / Accessibilité

- [ ] Toutes les actions (menu, formulaires, accordéon FAQ, curseur avant/après) sont utilisables au clavier seul (Tab, Entrée, flèches pour le curseur avant/après).
- [ ] Le focus visible est présent sur tous les éléments interactifs.
- [ ] `prefers-reduced-motion: reduce` supprime les animations (à tester via les outils développeur du navigateur).

## 8. Navigateurs modernes

- [ ] Chrome, Firefox, Safari (ou WebKit) récents : rendu et fonctionnalités identiques.

## 9. Sécurité des entrées

- [ ] Tentative d'injection HTML/JS dans les champs texte (ex. `<script>alert(1)</script>` dans un commentaire d'avis) → neutralisée côté serveur (`sanitize-html`).
- [ ] Tentative d'injection SQL dans un champ texte → sans effet (requêtes préparées via `node:sqlite`).

## 10. Performance

- [ ] Test sur connexion mobile simulée (throttling 3G rapide dans les outils développeur) : le site reste utilisable.
- [ ] Les images de la galerie sont chargées en lazy-load lorsque hors du premier écran.

## 11. Messages d'erreur

- [ ] Tous les messages d'erreur affichés sont compréhensibles par un public non technique (pas de message d'erreur brut de serveur affiché à l'utilisateur).

## 12. Espace administrateur

- [ ] Connexion avec des identifiants invalides → message d'erreur identique que l'email existe ou non (pas de fuite d'information).
- [ ] Accès à une route `/api/admin/*` sans jeton → HTTP 401.
- [ ] Conversion d'une demande en fiche → numéro de fiche et code de suivi générés, code de suivi utilisable immédiatement sur la page publique de suivi.
- [ ] Changement de statut d'une réparation → entrée ajoutée à l'historique automatiquement.
- [ ] Un avis validé dans l'espace admin apparaît sur l'accueil du site public ; un avis refusé ou en attente n'apparaît jamais.
- [ ] Upload de photo avant/après pour une réalisation → mêmes contrôles de sécurité que l'upload public (type, taille, contenu réel du fichier).
- [ ] Changement du mot de passe administrateur → l'ancien mot de passe ne fonctionne plus, le nouveau fonctionne.

## 13. Critères d'acceptation V1 (section 26) — check-list de sortie

- [ ] Responsive smartphone/tablette/ordinateur.
- [ ] Navigation fonctionnelle.
- [ ] Formulaires correctement validés (client + serveur).
- [ ] Upload d'image sécurisé.
- [ ] Demandes enregistrées en base.
- [ ] Rendez-vous enregistrés en base.
- [ ] Suivi réel d'une fiche fonctionnel.
- [ ] Gestion propre d'un numéro inexistant.
- [ ] Avis enregistrés avec modération (statut `en_attente` par défaut).
- [ ] Seuls les avis validés apparaissent sur l'accueil.
- [ ] Téléphone, email, WhatsApp et itinéraire fonctionnels.
- [ ] Animations non bloquantes, respectueuses de `prefers-reduced-motion`.
- [ ] Accessibilité de base respectée.
- [ ] Secrets absents du dépôt (`.env` dans `.gitignore`).
- [ ] HTTPS en production.
