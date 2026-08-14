import { pdfjs } from "./pdfjs";

// Rendu haute résolution d'une page en JPEG — distinct de usePdfRender
// (qui produit des vignettes PNG légères) : ici on veut la meilleure
// qualité d'export, pas un aperçu rapide.
export async function pageEnJpeg(fichier: File, pageIndex: number, echelle = 2, qualite = 0.92): Promise<Blob> {
  const lib = await pdfjs();
  const bytes = await fichier.arrayBuffer();
  const doc = await lib.getDocument({ data: bytes }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale: echelle });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const contexte = canvas.getContext("2d");
  if (!contexte) throw new Error("Contexte canvas indisponible");

  // Fond blanc : un PDF avec zones transparentes donnerait un JPEG noir sinon.
  contexte.fillStyle = "#ffffff";
  contexte.fillRect(0, 0, canvas.width, canvas.height);

  await page.render({ canvas, canvasContext: contexte, viewport }).promise;

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Échec de l'encodage JPEG"))),
      "image/jpeg",
      qualite,
    );
  });
}

export type ZoneCensure = { xPct: number; yPct: number; largeurPct: number; hauteurPct: number };

// Rédaction réelle : la page est rasterisée en image puis les zones sont
// noircies sur ce raster, avant d'être ré-insérée à la place de la page
// vectorielle d'origine. Contrairement à un simple rectangle dessiné
// par-dessus un texte sélectionnable, il n'existe ensuite plus aucun
// contenu texte/vecteur sous-jacent à extraire dans les zones couvertes.
export async function rasteriserPageAvecCensure(
  fichier: File,
  pageIndex: number,
  zones: ZoneCensure[],
  echelle = 3,
): Promise<Uint8Array> {
  const lib = await pdfjs();
  const bytes = await fichier.arrayBuffer();
  const doc = await lib.getDocument({ data: bytes }).promise;
  const page = await doc.getPage(pageIndex + 1);
  const viewport = page.getViewport({ scale: echelle });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const contexte = canvas.getContext("2d");
  if (!contexte) throw new Error("Contexte canvas indisponible");

  contexte.fillStyle = "#ffffff";
  contexte.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: contexte, viewport }).promise;

  contexte.fillStyle = "#000000";
  for (const zone of zones) {
    contexte.fillRect(
      (zone.xPct / 100) * canvas.width,
      (zone.yPct / 100) * canvas.height,
      (zone.largeurPct / 100) * canvas.width,
      (zone.hauteurPct / 100) * canvas.height,
    );
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(async (blob) => {
      if (!blob) {
        reject(new Error("Échec du rendu de la page"));
        return;
      }
      resolve(new Uint8Array(await blob.arrayBuffer()));
    }, "image/png");
  });
}
