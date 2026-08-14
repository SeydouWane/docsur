import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { OcrError, langueValide, reconnaitreTexte } from "./ocrmypdf";

const PORT = process.env.PORT ?? 3004;
const TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: TAILLE_MAX_OCTETS } });

const app = express();
app.use(express.json());

function estPdf(tampon: Buffer): boolean {
  return tampon.subarray(0, 5).toString("latin1") === "%PDF-";
}

function gestionnaireAsync(
  fn: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res).catch(next);
  };
}

app.get("/health", (_req, res) => {
  res.json({ status: "up" });
});

app.post(
  "/ocr",
  upload.single("fichier"),
  gestionnaireAsync(async (req, res) => {
    const fichier = req.file;
    if (!fichier || !estPdf(fichier.buffer)) {
      res.status(400).json({ message: "Fichier PDF manquant ou invalide" });
      return;
    }
    const langue = req.body?.langue ?? "fra+eng";
    if (!langueValide(langue)) {
      res.status(400).json({ message: "Langue non prise en charge" });
      return;
    }

    const sortie = await reconnaitreTexte(fichier.buffer, langue);
    res.set("Content-Type", "application/pdf").send(sortie);
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof OcrError) {
    res.status(err.codeStatut).json({ message: err.message });
    return;
  }
  if (err instanceof multer.MulterError) {
    res.status(400).json({ message: "Fichier trop volumineux ou requête invalide" });
    return;
  }
  console.error(err);
  res.status(500).json({ message: "Erreur interne du service" });
});

app.listen(PORT, () => {
  console.log(`pdf-ocr en écoute sur le port ${PORT}`);
});
