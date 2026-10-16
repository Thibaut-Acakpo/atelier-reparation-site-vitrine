export function slugify(texte) {
  return String(texte || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export function genererMotDePasse(longueur = 14) {
  const alphabet = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const valeurs = crypto.getRandomValues(new Uint32Array(longueur));
  return Array.from(valeurs, (v) => alphabet[v % alphabet.length]).join('');
}
