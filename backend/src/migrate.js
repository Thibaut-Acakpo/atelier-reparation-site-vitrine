// Prépare la base : crée/complète les tables (schema.sql), met à niveau une
// ancienne base mono-atelier et insère les statuts de réparation.
// Idempotent : peut être relancé à tout moment.
//
// Usage : npm run migrate

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const db = require('./db-postgres');
const { STATUTS, codeStatut } = require('./data/contenuParDefaut');

const TABLES_PAR_ATELIER = [
  'admins', 'services', 'categories_appareils', 'faq', 'realisations', 'avis',
  'contacts', 'clients', 'appareils', 'demandes_reparation', 'rendez_vous',
  'pieces', 'reparations', 'notifications',
];

async function existeColonne(client, table, colonne) {
  const r = await client.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
    [table, colonne]
  );
  return r.rowCount > 0;
}

async function migrer() {
  const client = await db.connect();

  try {
    const sql = fs.readFileSync(path.resolve(__dirname, '../schema.sql'), 'utf8');
    await client.query(sql);

    // --- Mise à niveau d'une ancienne base (avant le multi-ateliers) --------
    for (const table of TABLES_PAR_ATELIER) {
      await client.query(
        `ALTER TABLE ${table}
         ADD COLUMN IF NOT EXISTS atelier_id integer REFERENCES ateliers(id) ON DELETE CASCADE`
      );
    }

    if (!(await existeColonne(client, 'settings', 'atelier_id'))) {
      await client.query('ALTER TABLE settings ADD COLUMN atelier_id integer REFERENCES ateliers(id) ON DELETE CASCADE');
      await client.query('ALTER TABLE settings DROP CONSTRAINT IF EXISTS settings_pkey');
    }

    // Anciennes lignes sans atelier : rattachées à l'atelier historique.
    let orphelines = 0;
    for (const table of [...TABLES_PAR_ATELIER, 'settings']) {
      const r = await client.query(`SELECT COUNT(*)::int AS n FROM ${table} WHERE atelier_id IS NULL`);
      orphelines += r.rows[0].n;
    }

    if (orphelines > 0) {
      let at = await client.query(`SELECT id FROM ateliers ORDER BY id ASC LIMIT 1`);
      if (at.rowCount === 0) {
        at = await client.query(
          `INSERT INTO ateliers (nom, slug) VALUES ($1, $2) RETURNING id`,
          [process.env.ATELIER_NAME || 'Atelier de réparation électronique', 'atelier-reparation']
        );
      }
      const atelierId = at.rows[0].id;
      for (const table of [...TABLES_PAR_ATELIER, 'settings']) {
        await client.query(`UPDATE ${table} SET atelier_id = $1 WHERE atelier_id IS NULL`, [atelierId]);
      }
      console.log(`Anciennes données rattachées à l'atelier #${atelierId}.`);
    }

    await client.query('ALTER TABLE settings ALTER COLUMN atelier_id SET NOT NULL');
    await client.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS settings_atelier_cle_uidx ON settings (atelier_id, cle)`
    );

    // Le code d'une catégorie n'est unique que DANS un atelier.
    await client.query('ALTER TABLE categories_appareils DROP CONSTRAINT IF EXISTS categories_appareils_code_key');
    await client.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS categories_atelier_code_uidx ON categories_appareils (atelier_id, code)`
    );

    // Un seul compte par rôle et par atelier.
    try {
      await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS admins_atelier_role_uidx ON admins (atelier_id, role)`);
    } catch (e) {
      console.warn('Index admins(atelier_id, role) non créé (doublons existants) :', e.message);
    }

    for (const table of TABLES_PAR_ATELIER.filter((t) => t !== 'admins')) {
      await client.query(`CREATE INDEX IF NOT EXISTS ${table}_atelier_idx ON ${table} (atelier_id)`);
    }

    // --- Statuts de réparation (communs à tous les ateliers) ----------------
    for (let i = 0; i < STATUTS.length; i += 1) {
      await client.query(
        `INSERT INTO statuts_reparation (code, libelle, ordre)
         VALUES ($1, $2, $3) ON CONFLICT (code) DO NOTHING`,
        [codeStatut(STATUTS[i]), STATUTS[i], i + 1]
      );
    }

    console.log('Base de données prête.');
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrer()
    .then(() => db.end())
    .catch((err) => {
      console.error('Échec de la migration :', err);
      process.exit(1);
    });
}

module.exports = { migrer };
