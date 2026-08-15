import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { LibreOfficeError, convertirDepuisPdf, type FormatCible } from "./libreoffice";

const PORT = process.env.PORT ?? 3005;
const TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: TAILLE_MAX_OCTETS } });

const app = express();
app.use(express.json());

const TYPES_MIME: Record<FormatCible, string> = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

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

function routeConversion(formatCible: FormatCible) {
  return gestionnaireAsync(async (req, res) => {
    const fichier = req.file;
    if (!fichier || !estPdf(fichier.buffer)) {
      res.status(400).json({ message: "Fichier PDF manquant ou invalide" });
      return;
    }

    const sortie = await convertirDepuisPdf(fichier.buffer, formatCible);
    res.set("Content-Type", TYPES_MIME[formatCible]).send(sortie);
  });
}

app.post("/vers-word", upload.single("fichier"), routeConversion("docx"));
app.post("/vers-powerpoint", upload.single("fichier"), routeConversion("pptx"));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof LibreOfficeError) {
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
  console.log(`pdf-office en écoute sur le port ${PORT}`);
});
