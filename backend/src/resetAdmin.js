// Réinitialise (ou crée) un compte admin d'un atelier en ligne de commande.
// Alternative à l'espace développeur : « Liens & accès » → Réinitialiser.
//
// Usage : npm run admin:reset -- <slug> [technicien|assistant] [email] [mot_de_passe]
// Exemple : npm run admin:reset -- mon-client technicien gerant@client.com

require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./db-postgres');
const { genererMotDePasse } = require('./services/provisionAtelier');

async function run() {
  const [slug, role = 'technicien', emailArg, mdpArg] = process.argv.slice(2);

  if (!slug || !['technicien', 'assistant'].includes(role)) {
    console.error('Usage : npm run admin:reset -- <slug> [technicien|assistant] [email] [mot_de_passe]');
    process.exit(1);
  }

  const at = await db.query('SELECT id FROM ateliers WHERE slug = $1', [slug]);
  if (at.rowCount === 0) {
    console.error(`Aucun atelier avec le lien « ${slug} ».`);
    process.exit(1);
  }
  const atelierId = at.rows[0].id;

  const motDePasse = mdpArg || genererMotDePasse();
  if (motDePasse.length < 8) {
    console.error('Le mot de passe doit contenir au moins 8 caractères.');
    process.exit(1);
  }
  const hash = await bcrypt.hash(motDePasse, 10);

  const existant = await db.query(
    'SELECT id, email FROM admins WHERE atelier_id = $1 AND role = $2',
    [atelierId, role]
  );

  let email;
  if (existant.rowCount > 0) {
    email = (emailArg || existant.rows[0].email).toLowerCase();
    await db.query(
      'UPDATE admins SET email = $1, mot_de_passe_hash = $2, actif = 1 WHERE id = $3',
      [email, hash, existant.rows[0].id]
    );
  } else {
    if (!emailArg) {
      console.error('Ce compte n’existe pas : indiquez son e-mail en 3e argument.');
      process.exit(1);
    }
    email = emailArg.toLowerCase();
    await db.query(
      `INSERT INTO admins (atelier_id, nom, email, mot_de_passe_hash, role, actif)
       VALUES ($1,$2,$3,$4,$5,1)`,
      [atelierId, role === 'assistant' ? 'Assistant technicien' : 'Technicien', email, hash, role]
    );
  }

  console.log(`Compte ${role} de « ${slug} » : ${email} / ${motDePasse}`);
}

run()
  .then(() => db.end())
  .catch((err) => {
    console.error('Échec :', err.message);
    process.exit(1);
  });
