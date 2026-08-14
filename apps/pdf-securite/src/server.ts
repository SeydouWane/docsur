import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { QpdfError, compresser, deverrouiller, proteger, reparer } from "./qpdf";

const PORT = process.env.PORT ?? 3003;
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
  "/proteger",
  upload.single("fichier"),
  gestionnaireAsync(async (req, res) => {
    const fichier = req.file;
    const motDePasse = req.body?.motDePasse;
    if (!fichier || !estPdf(fichier.buffer)) {
      res.status(400).json({ message: "Fichier PDF manquant ou invalide" });
      return;
    }
    if (typeof motDePasse !== "string" || motDePasse.length < 4) {
      res.status(400).json({ message: "Mot de passe manquant ou trop court" });
      return;
    }

    const sortie = await proteger(fichier.buffer, motDePasse);
    res.set("Content-Type", "application/pdf").send(sortie);
  }),
);

app.post(
  "/deverrouiller",
  upload.single("fichier"),
  gestionnaireAsync(async (req, res) => {
    const fichier = req.file;
    const motDePasse = req.body?.motDePasse;
    if (!fichier || !estPdf(fichier.buffer)) {
      res.status(400).json({ message: "Fichier PDF manquant ou invalide" });
      return;
    }
    if (typeof motDePasse !== "string" || motDePasse.length === 0) {
      res.status(400).json({ message: "Mot de passe manquant" });
      return;
    }

    const sortie = await deverrouiller(fichier.buffer, motDePasse);
    res.set("Content-Type", "application/pdf").send(sortie);
  }),
);

app.post(
  "/reparer",
  upload.single("fichier"),
  gestionnaireAsync(async (req, res) => {
    const fichier = req.file;
    if (!fichier || !estPdf(fichier.buffer)) {
      res.status(400).json({ message: "Fichier PDF manquant ou invalide" });
      return;
    }

    const sortie = await reparer(fichier.buffer);
    res.set("Content-Type", "application/pdf").send(sortie);
  }),
);

app.post(
  "/compresser",
  upload.single("fichier"),
  gestionnaireAsync(async (req, res) => {
    const fichier = req.file;
    if (!fichier || !estPdf(fichier.buffer)) {
      res.status(400).json({ message: "Fichier PDF manquant ou invalide" });
      return;
    }

    const sortie = await compresser(fichier.buffer);
    res.set("Content-Type", "application/pdf").send(sortie);
  }),
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof QpdfError) {
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
  console.log(`pdf-securite en écoute sur le port ${PORT}`);
});
