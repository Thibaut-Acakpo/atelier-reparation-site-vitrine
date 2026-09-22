// Connexion et migrations de la base de données (SQLite).
// En production, ce même schéma s'adapte facilement à MySQL/PostgreSQL
// (voir docs/DEPLOIEMENT.md pour les notes de portage).

const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const DATABASE_FILE = process.env.DATABASE_FILE || './data/atelier.sqlite';
const resolvedPath = path.resolve(__dirname, '..', DATABASE_FILE);
const dataDir = path.dirname(resolvedPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Utilise le module SQLite intégré à Node.js (disponible sans compilation
// native depuis Node 22.5+) plutôt qu'un paquet tiers, pour éviter tout
// besoin d'outils de compilation (Visual Studio Build Tools sur Windows,
// Xcode sur macOS) lors de l'installation.
const db = new DatabaseSync(resolvedPath);
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

// ---------------------------------------------------------------------------
// Schéma (correspond à la section 19 du cahier des charges)
// ---------------------------------------------------------------------------
db.exec(`
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom_complet TEXT NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS appareils (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('telephone','ordinateur','tablette','autre')),
  marque TEXT NOT NULL,
  modele TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS demandes_reparation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appareil_id INTEGER NOT NULL REFERENCES appareils(id) ON DELETE CASCADE,
  panne TEXT NOT NULL,
  photo_path TEXT,
  date_souhaitee TEXT NOT NULL,
  heure_souhaitee TEXT NOT NULL,
  confidentialite_acceptee INTEGER NOT NULL DEFAULT 0,
  statut_traitement TEXT NOT NULL DEFAULT 'nouvelle',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS statuts_reparation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  libelle TEXT NOT NULL,
  ordre INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS reparations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numero_fiche TEXT NOT NULL UNIQUE,
  code_public TEXT NOT NULL UNIQUE,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appareil_id INTEGER NOT NULL REFERENCES appareils(id) ON DELETE CASCADE,
  demande_id INTEGER REFERENCES demandes_reparation(id) ON DELETE SET NULL,
  statut_id INTEGER NOT NULL REFERENCES statuts_reparation(id),
  description_statut TEXT,
  diagnostic TEXT,
  cout REAL,
  date_estimee_recuperation TEXT,
  visible_publiquement INTEGER NOT NULL DEFAULT 1,
  devis_decision TEXT NOT NULL DEFAULT 'en_attente' CHECK (devis_decision IN ('en_attente','accepte','refuse')),
  devis_decision_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pieces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  reference TEXT
);

CREATE TABLE IF NOT EXISTS reparation_pieces (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reparation_id INTEGER NOT NULL REFERENCES reparations(id) ON DELETE CASCADE,
  piece_id INTEGER NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  quantite INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS historique_reparation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reparation_id INTEGER NOT NULL REFERENCES reparations(id) ON DELETE CASCADE,
  statut_id INTEGER NOT NULL REFERENCES statuts_reparation(id),
  commentaire TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rendez_vous (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date_souhaitee TEXT NOT NULL,
  heure_souhaitee TEXT NOT NULL,
  motif TEXT,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente','confirme','modifie','refuse')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS avis (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  note INTEGER NOT NULL CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT NOT NULL,
  statut TEXT NOT NULL DEFAULT 'en_attente' CHECK (statut IN ('en_attente','valide','refuse')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS realisations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  type_appareil TEXT NOT NULL,
  marque TEXT,
  modele TEXT,
  probleme TEXT NOT NULL,
  intervention TEXT NOT NULL,
  image_avant TEXT,
  image_apres TEXT,
  publie INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL,
  destinataire TEXT,
  contenu_resume TEXT,
  statut TEXT NOT NULL DEFAULT 'a_envoyer',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  email TEXT,
  telephone TEXT,
  sujet TEXT,
  message TEXT NOT NULL,
  traite INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  cle TEXT PRIMARY KEY,
  valeur TEXT
);

CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  icone TEXT,
  ordre INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categories_appareils (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  titre TEXT NOT NULL,
  description TEXT NOT NULL,
  icone TEXT,
  ordre INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS faq (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  question TEXT NOT NULL,
  reponse TEXT NOT NULL,
  ordre INTEGER NOT NULL DEFAULT 0
);

-- Espace administrateur (section 25 du cahier des charges)
-- role "technicien" : gérant de l'atelier, accès complet
-- role "assistant"  : "Assistant technicien" — compte partagé par les
--                      apprentis, accès opérationnel restreint
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  mot_de_passe_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'technicien',
  actif INTEGER NOT NULL DEFAULT 1,
  derniere_connexion TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
`);

// ---------------------------------------------------------------------------
// Petites migrations additives (pour les bases déjà initialisées avant
// l'ajout d'une colonne). SQLite n'a pas de "ADD COLUMN IF NOT EXISTS" :
// on tente l'ajout et on ignore l'erreur si la colonne existe déjà.
// ---------------------------------------------------------------------------
function addColumnIfMissing(table, columnDefinitionSql, columnName) {
  const columns = db.prepare(`PRAGMA table_info(${table})`).all();
  const exists = columns.some((c) => c.name === columnName);
  if (!exists) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnDefinitionSql}`);
  }
}

addColumnIfMissing('reparations', `devis_decision TEXT NOT NULL DEFAULT 'en_attente'`, 'devis_decision');
addColumnIfMissing('reparations', `devis_decision_date TEXT`, 'devis_decision_date');
addColumnIfMissing('admins', `role TEXT NOT NULL DEFAULT 'technicien'`, 'role');

module.exports = db;
