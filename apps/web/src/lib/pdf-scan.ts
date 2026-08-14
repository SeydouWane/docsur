export type ModeAmelioration = "couleur" | "ameliore" | "noir-blanc";

function chargerImage(fichier: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(fichier);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image illisible"));
    };
    img.src = url;
  });
}

// Amélioration simple façon « scanner mobile » : niveaux de gris puis
// étirement d'histogramme (auto-contraste), avec un mode seuillage pour un
// rendu noir et blanc franc, adapté aux documents texte.
export async function ameliorerImage(fichier: File, mode: ModeAmelioration): Promise<Blob> {
  if (mode === "couleur") return fichier;

  const img = await chargerImage(fichier);
  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Contexte canvas indisponible");
  ctx.drawImage(img, 0, 0);

  const donnees = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let min = 255;
  let max = 0;

  for (let i = 0; i < donnees.data.length; i += 4) {
    const gris = 0.299 * donnees.data[i] + 0.587 * donnees.data[i + 1] + 0.114 * donnees.data[i + 2];
    donnees.data[i] = donnees.data[i + 1] = donnees.data[i + 2] = gris;
    if (gris < min) min = gris;
    if (gris > max) max = gris;
  }

  const plage = Math.max(1, max - min);
  for (let i = 0; i < donnees.data.length; i += 4) {
    let valeur = ((donnees.data[i] - min) / plage) * 255;
    if (mode === "noir-blanc") valeur = valeur > 150 ? 255 : 0;
    donnees.data[i] = donnees.data[i + 1] = donnees.data[i + 2] = valeur;
  }

  ctx.putImageData(donnees, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Échec du traitement de l'image"))), "image/jpeg", 0.9);
  });
}
