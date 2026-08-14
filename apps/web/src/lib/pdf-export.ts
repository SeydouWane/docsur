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
