const { spawnSync } = require('child_process');

console.log('Initialisation de la base de données...');

const seed = spawnSync(process.execPath, ['src/seed.js'], {
  stdio: 'inherit',
  env: process.env,
});

if (seed.status !== 0) {
  console.error('Échec de l’initialisation de la base de données.');
  process.exit(seed.status || 1);
}

console.log('Initialisation terminée. Démarrage de l’API...');

require('./src/server.js');