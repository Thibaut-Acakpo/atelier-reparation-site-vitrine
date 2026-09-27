require('dotenv').config();

const { Pool } = require('pg');

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || 'atelier_reparation',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD,
    };

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Connexion à PostgreSQL établie.');
});

pool.on('error', (err) => {
  console.error('Erreur PostgreSQL :', err);
});

module.exports = pool;