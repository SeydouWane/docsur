// Domaines email grand public : jamais utilisés comme identifiant d'une
// organisation partagée, sous peine de faire rejoindre la même "entreprise"
// à n'importe qui possédant une adresse chez le même fournisseur.
export const DOMAINES_EMAIL_PUBLICS = new Set([
  'gmail.com',
  'yahoo.com',
  'yahoo.fr',
  'outlook.com',
  'outlook.fr',
  'hotmail.com',
  'hotmail.fr',
  'live.com',
  'live.fr',
  'icloud.com',
  'me.com',
  'aol.com',
  'gmx.com',
  'protonmail.com',
  'proton.me',
  'laposte.net',
  'orange.fr',
  'wanadoo.fr',
  'free.fr',
]);

export function estDomainePublic(domaine: string): boolean {
  return DOMAINES_EMAIL_PUBLICS.has(domaine.toLowerCase());
}
