function chargerImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Impossible de charger l'image"));
    img.src = src;
  });
}

const SEUIL_DIFFERENCE = 40;

export async function comparerPages(
  dataUrlA: string,
  dataUrlB: string,
): Promise<{ dataUrl: string; pourcentagePixelsDifferents: number }> {
  const [imgA, imgB] = await Promise.all([chargerImage(dataUrlA), chargerImage(dataUrlB)]);
  const largeur = Math.max(imgA.width, imgB.width);
  const hauteur = Math.max(imgA.height, imgB.height);

  const canvasA = document.createElement("canvas");
  canvasA.width = largeur;
  canvasA.height = hauteur;
  const ctxA = canvasA.getContext("2d")!;
  ctxA.fillStyle = "#ffffff";
  ctxA.fillRect(0, 0, largeur, hauteur);
  ctxA.drawImage(imgA, 0, 0);

  const canvasB = document.createElement("canvas");
  canvasB.width = largeur;
  canvasB.height = hauteur;
  const ctxB = canvasB.getContext("2d")!;
  ctxB.fillStyle = "#ffffff";
  ctxB.fillRect(0, 0, largeur, hauteur);
  ctxB.drawImage(imgB, 0, 0);

  const donneesA = ctxA.getImageData(0, 0, largeur, hauteur);
  const donneesB = ctxB.getImageData(0, 0, largeur, hauteur);
  const sortie = ctxA.createImageData(largeur, hauteur);

  let pixelsDifferents = 0;
  const totalPixels = largeur * hauteur;

  for (let i = 0; i < donneesA.data.length; i += 4) {
    const dr = Math.abs(donneesA.data[i] - donneesB.data[i]);
    const dg = Math.abs(donneesA.data[i + 1] - donneesB.data[i + 1]);
    const db = Math.abs(donneesA.data[i + 2] - donneesB.data[i + 2]);
    const diff = dr + dg + db;

    if (diff > SEUIL_DIFFERENCE) {
      pixelsDifferents++;
      sortie.data[i] = 220;
      sortie.data[i + 1] = 38;
      sortie.data[i + 2] = 38;
      sortie.data[i + 3] = 255;
    } else {
      // Estompe le contenu identique en niveaux de gris clairs pour que
      // les différences en rouge ressortent immédiatement.
      const gris = 200 + (donneesA.data[i] + donneesA.data[i + 1] + donneesA.data[i + 2]) / 3 / 255 * 55;
      sortie.data[i] = gris;
      sortie.data[i + 1] = gris;
      sortie.data[i + 2] = gris;
      sortie.data[i + 3] = 255;
    }
  }

  const canvasSortie = document.createElement("canvas");
  canvasSortie.width = largeur;
  canvasSortie.height = hauteur;
  canvasSortie.getContext("2d")!.putImageData(sortie, 0, 0);

  return {
    dataUrl: canvasSortie.toDataURL("image/png"),
    pourcentagePixelsDifferents: (pixelsDifferents / totalPixels) * 100,
  };
}
