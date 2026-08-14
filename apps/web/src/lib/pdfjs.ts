// Import dynamique impératif : pdfjs-dist référence des API navigateur
// (DOMMatrix...) au chargement du module, ce qui casse le pré-rendu côté
// serveur si le module est importé de façon statique dans un composant
// client. Le chargement paresseux garantit qu'il n'est jamais évalué
// pendant le build/SSR, seulement au runtime dans le navigateur.
let promesse: Promise<typeof import("pdfjs-dist")> | null = null;

export function pdfjs() {
  if (!promesse) {
    promesse = import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return lib;
    });
  }
  return promesse;
}
