import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DELAI_MAX_MS = 180_000;
const LANGUES_AUTORISEES = new Set(["fra", "eng", "fra+eng"]);

export class OcrError extends Error {
  constructor(
    message: string,
    public codeStatut: number = 422,
  ) {
    super(message);
  }
}

export function langueValide(langue: unknown): langue is string {
  return typeof langue === "string" && LANGUES_AUTORISEES.has(langue);
}

function executerOcrmypdf(args: string[]): Promise<{ stderr: string }> {
  return new Promise((resolve) => {
    execFile(
      "ocrmypdf",
      args,
      { timeout: DELAI_MAX_MS, maxBuffer: 10 * 1024 * 1024 },
      (_erreur, _stdout, stderr) => {
        resolve({ stderr: stderr?.toString() ?? "" });
      },
    );
  });
}

async function avecFichiersTemporaires<T>(
  fn: (entree: string, sortie: string) => Promise<T>,
): Promise<T> {
  const dossier = join(tmpdir(), `pdf-ocr-${randomUUID()}`);
  await mkdir(dossier, { recursive: true });
  const entree = join(dossier, "entree.pdf");
  const sortie = join(dossier, "sortie.pdf");
  try {
    return await fn(entree, sortie);
  } finally {
    await rm(dossier, { recursive: true, force: true });
  }
}

function nettoyerMessageOcrmypdf(stderr: string): string {
  if (/priorocrfounderror|page already has text/i.test(stderr)) {
    return "Ce PDF contient déjà du texte sur toutes les pages — rien à reconnaître.";
  }
  if (/encrypted/i.test(stderr)) {
    return "Ce PDF est protégé par mot de passe — déverrouillez-le d'abord.";
  }
  if (/tagged pdf|digital signature/i.test(stderr)) {
    return "Ce PDF ne peut pas être traité par l'OCR (signature ou structure incompatible).";
  }
  const derniereLigneUtile = stderr
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .pop();
  return (derniereLigneUtile ?? "La reconnaissance de texte a échoué").replace(/^.*?:\s*/, "").slice(0, 200);
}

// ocrmypdf ajoute une couche de texte invisible par-dessus le rendu original
// des pages (aucune perte visuelle) ; --skip-text laisse intactes les pages
// qui contiennent déjà du texte plutôt que d'échouer sur tout le document.
export async function reconnaitreTexte(donnees: Buffer, langue: string): Promise<Buffer> {
  return avecFichiersTemporaires(async (entree, sortie) => {
    await writeFile(entree, donnees);
    const { stderr } = await executerOcrmypdf([
      "--language",
      langue,
      "--skip-text",
      "--output-type",
      "pdf",
      "--optimize",
      "0",
      entree,
      sortie,
    ]);

    const info = await stat(sortie).catch(() => null);
    if (!info || info.size === 0) {
      throw new OcrError(nettoyerMessageOcrmypdf(stderr));
    }
    return readFile(sortie);
  });
}
