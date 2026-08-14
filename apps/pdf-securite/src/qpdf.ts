import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DELAI_MAX_MS = 30_000;

export class QpdfError extends Error {
  constructor(
    message: string,
    public codeStatut: number = 422,
  ) {
    super(message);
  }
}

// qpdf peut sortir avec un code non-zero pour de simples avertissements
// (le fichier de sortie existe quand même) : on ignore volontairement le
// code de sortie et on juge du résultat par la présence du fichier produit
// (voir executerEtLire). stderr sert uniquement à composer un message
// d'erreur lisible si aucun fichier n'a été produit.
function executerQpdf(args: string[]): Promise<{ stderr: string }> {
  return new Promise((resolve) => {
    execFile("qpdf", args, { timeout: DELAI_MAX_MS, maxBuffer: 10 * 1024 * 1024 }, (_erreur, _stdout, stderr) => {
      resolve({ stderr: stderr?.toString() ?? "" });
    });
  });
}

async function avecFichiersTemporaires<T>(
  fn: (entree: string, sortie: string) => Promise<T>,
): Promise<T> {
  const dossier = join(tmpdir(), `pdf-securite-${randomUUID()}`);
  await mkdir(dossier, { recursive: true });
  const entree = join(dossier, "entree.pdf");
  const sortie = join(dossier, "sortie.pdf");
  try {
    return await fn(entree, sortie);
  } finally {
    await rm(dossier, { recursive: true, force: true });
  }
}

async function executerEtLire(args: (entree: string, sortie: string) => string[], donnees: Buffer): Promise<Buffer> {
  return avecFichiersTemporaires(async (entree, sortie) => {
    await writeFile(entree, donnees);
    const { stderr } = await executerQpdf(args(entree, sortie));

    const info = await stat(sortie).catch(() => null);
    if (!info || info.size === 0) {
      throw new QpdfError(nettoyerMessageQpdf(stderr) || "Le traitement du PDF a échoué");
    }
    return readFile(sortie);
  });
}

function nettoyerMessageQpdf(stderr: string): string {
  const premiereLigne = stderr.split("\n").find((l) => l.trim().length > 0) ?? "";
  if (/invalid password/i.test(stderr)) return "Mot de passe incorrect";
  if (/not a pdf|no pdf header/i.test(stderr)) return "Ce fichier n'est pas un PDF valide";
  return premiereLigne.replace(/^.*?:\s*/, "").slice(0, 200);
}

export async function proteger(donnees: Buffer, motDePasse: string): Promise<Buffer> {
  return executerEtLire(
    (entree, sortie) => ["--encrypt", motDePasse, motDePasse, "256", "--", entree, sortie],
    donnees,
  );
}

export async function deverrouiller(donnees: Buffer, motDePasse: string): Promise<Buffer> {
  return executerEtLire(
    (entree, sortie) => [`--password=${motDePasse}`, "--decrypt", entree, sortie],
    donnees,
  );
}

export async function reparer(donnees: Buffer): Promise<Buffer> {
  return executerEtLire((entree, sortie) => [entree, sortie], donnees);
}

export async function compresser(donnees: Buffer): Promise<Buffer> {
  return executerEtLire(
    (entree, sortie) => [
      "--optimize-images",
      "--compress-streams=y",
      "--recompress-flate",
      "--compression-level=9",
      "--object-streams=generate",
      "--",
      entree,
      sortie,
    ],
    donnees,
  );
}
