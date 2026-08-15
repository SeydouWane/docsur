import { execFile } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const DELAI_MAX_MS = 120_000;

export type FormatCible = "docx" | "pptx";

export class LibreOfficeError extends Error {
  constructor(
    message: string,
    public codeStatut: number = 422,
  ) {
    super(message);
  }
}

// LibreOffice sait reconstruire un document Writer ou Impress à partir d'un
// PDF (filtres d'import dédiés), mais n'a aucun filtre d'import PDF vers
// Calc — reconstruire un tableur à partir d'un PDF quelconque est un
// problème différent (détection de tableaux), pas juste un format de sortie
// en plus. D'où l'absence de xlsx ici (voir README).
const FILTRES_IMPORT: Record<FormatCible, string> = {
  docx: "writer_pdf_import",
  pptx: "impress_pdf_import",
};

function executerSoffice(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    execFile(
      "soffice",
      args,
      { timeout: DELAI_MAX_MS, maxBuffer: 10 * 1024 * 1024 },
      (_erreur, stdout, stderr) => {
        resolve({ stdout: stdout?.toString() ?? "", stderr: stderr?.toString() ?? "" });
      },
    );
  });
}

// Chaque conversion tourne dans son propre dossier temporaire ET son propre
// profil utilisateur LibreOffice (-env:UserInstallation) : plusieurs
// instances de soffice ne peuvent pas partager un même profil sans se
// verrouiller mutuellement en cas de requêtes concurrentes.
export async function convertirDepuisPdf(donnees: Buffer, formatCible: FormatCible): Promise<Buffer> {
  const dossier = join(tmpdir(), `pdf-office-${randomUUID()}`);
  const profil = join(dossier, "profil");
  await mkdir(profil, { recursive: true });
  const entree = join(dossier, "entree.pdf");

  try {
    await writeFile(entree, donnees);

    const { stderr } = await executerSoffice([
      "--headless",
      "--norestore",
      `-env:UserInstallation=file://${profil.replace(/\\/g, "/")}`,
      `--infilter=${FILTRES_IMPORT[formatCible]}`,
      "--convert-to",
      formatCible,
      "--outdir",
      dossier,
      entree,
    ]);

    const fichiers = await readdir(dossier);
    const sortie = fichiers.find((f) => f.endsWith(`.${formatCible}`));
    if (!sortie) {
      throw new LibreOfficeError(nettoyerMessage(stderr) || "La conversion a échoué");
    }

    const contenu = await readFile(join(dossier, sortie));
    if (contenu.byteLength === 0) {
      throw new LibreOfficeError("Le fichier converti est vide — le PDF n'est probablement pas convertible dans ce format");
    }
    return contenu;
  } finally {
    await rm(dossier, { recursive: true, force: true });
  }
}

function nettoyerMessage(stderr: string): string {
  const derniereLigneUtile = stderr
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .pop();
  return (derniereLigneUtile ?? "").replace(/^.*?:\s*/, "").slice(0, 200);
}
