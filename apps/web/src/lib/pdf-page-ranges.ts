// Analyse une chaîne « 1-3, 5, 7-9 » en indices de page 0-based, dans l'ordre
// donné (les doublons sont conservés : utile pour dupliquer une page).
export function parsePageRanges(input: string, pageCount: number): number[] {
  const indices: number[] = [];
  const morceaux = input
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  for (const morceau of morceaux) {
    const plage = morceau.match(/^(\d+)\s*-\s*(\d+)$/);
    if (plage) {
      let debut = parseInt(plage[1], 10);
      let fin = parseInt(plage[2], 10);
      if (debut > fin) [debut, fin] = [fin, debut];
      for (let n = debut; n <= fin; n++) {
        if (n >= 1 && n <= pageCount) indices.push(n - 1);
      }
      continue;
    }
    const page = parseInt(morceau, 10);
    if (!Number.isNaN(page) && page >= 1 && page <= pageCount) {
      indices.push(page - 1);
    }
  }

  return indices;
}

export function formatPageRanges(input: string): string {
  return input.replace(/[^\d,\-\s]/g, "");
}

export function telechargerBlob(blob: Blob, nomFichier: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomFichier;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatTaille(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
