"use client";

import { useEffect, useState } from "react";
import { pdfjs } from "@/lib/pdfjs";

export type PageRendue = {
  index: number;
  dataUrl: string;
  width: number;
  height: number;
  // Dimensions réelles de la page PDF en points (1/72 pouce) — indépendantes
  // de l'échelle d'affichage, nécessaires pour convertir une position à
  // l'écran vers l'espace de coordonnées PDF (ex. placement de signature).
  pageWidthPt: number;
  pageHeightPt: number;
};

// Rendu de pages PDF en images (canvas hors-écran) pour affichage direct
// dans l'interface — vignettes ou aperçu plein format selon targetWidth.
// pages: sous-ensemble d'indices 0-based à rendre (par défaut : toutes).
export function usePdfRender(
  fichier: File | null,
  options: { targetWidth: number; pages?: number[] },
) {
  const { targetWidth, pages } = options;
  const pagesKey = pages?.join(",");
  const [pagesRendues, setPagesRendues] = useState<PageRendue[]>([]);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!fichier) {
      // Réinitialise l'état dérivé quand le fichier externe disparaît (bouton
      // "changer de fichier") — pas une valeur calculable au rendu.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPagesRendues([]);
      setPageCount(null);
      return;
    }

    let annule = false;
    setChargement(true);
    setErreur(null);

    async function rendre() {
      try {
        const lib = await pdfjs();
        const bytes = await fichier!.arrayBuffer();
        const doc = await lib.getDocument({ data: bytes }).promise;
        if (annule) return;
        setPageCount(doc.numPages);

        const indices = pagesKey ? pagesKey.split(",").map(Number) : Array.from({ length: doc.numPages }, (_, i) => i);
        const rendues: PageRendue[] = [];

        for (const index of indices) {
          if (index < 0 || index >= doc.numPages) continue;
          const page = await doc.getPage(index + 1);
          const viewportBase = page.getViewport({ scale: 1 });
          const echelle = targetWidth / viewportBase.width;
          const viewport = page.getViewport({ scale: echelle });

          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const contexte = canvas.getContext("2d");
          if (!contexte) continue;

          await page.render({ canvas, canvasContext: contexte, viewport }).promise;
          if (annule) return;

          rendues.push({
            index,
            dataUrl: canvas.toDataURL("image/png"),
            width: viewport.width,
            height: viewport.height,
            pageWidthPt: viewportBase.width,
            pageHeightPt: viewportBase.height,
          });
        }

        if (!annule) setPagesRendues(rendues);
      } catch {
        if (!annule) setErreur("Impossible d'afficher ce PDF — fichier corrompu ou protégé");
      } finally {
        if (!annule) setChargement(false);
      }
    }

    rendre();

    return () => {
      annule = true;
    };
  }, [fichier, targetWidth, pagesKey]);

  return { pages: pagesRendues, pageCount, chargement, erreur };
}
