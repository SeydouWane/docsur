"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { comparerPages } from "@/lib/pdf-compare";

export function ComparerTool() {
  const [fichierA, setFichierA] = useState<File | null>(null);
  const [pagesA, setPagesA] = useState<number | null>(null);
  const [fichierB, setFichierB] = useState<File | null>(null);
  const [pagesB, setPagesB] = useState<number | null>(null);
  const [pageActuelle, setPageActuelle] = useState(0);
  const [diff, setDiff] = useState<{ dataUrl: string; pourcentagePixelsDifferents: number } | null>(null);
  const [calcul, setCalcul] = useState(false);

  const { pages: renduA } = usePdfRender(fichierA, { targetWidth: 480, pages: [pageActuelle] });
  const { pages: renduB } = usePdfRender(fichierB, { targetWidth: 480, pages: [pageActuelle] });
  const imgA = renduA[0];
  const imgB = renduB[0];

  const pageCountMin = pagesA && pagesB ? Math.min(pagesA, pagesB) : null;

  useEffect(() => {
    if (!imgA || !imgB) {
      // Un des deux rendus a disparu (changement de fichier) : la diff
      // précédente n'est plus valide, pas une valeur dérivable au rendu.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDiff(null);
      return;
    }
    let annule = false;
    setCalcul(true);
    comparerPages(imgA.dataUrl, imgB.dataUrl).then((resultat) => {
      if (!annule) {
        setDiff(resultat);
        setCalcul(false);
      }
    });
    return () => {
      annule = true;
    };
  }, [imgA, imgB]);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-sm font-medium">Version originale</p>
          <SinglePdfDropzone
            fichier={fichierA}
            pageCount={pagesA}
            onCharge={(f, p) => {
              setFichierA(f);
              setPagesA(p);
              setPageActuelle(0);
            }}
            onReinitialiser={() => {
              setFichierA(null);
              setPagesA(null);
            }}
            texte="Glissez la version originale"
          />
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Nouvelle version</p>
          <SinglePdfDropzone
            fichier={fichierB}
            pageCount={pagesB}
            onCharge={(f, p) => {
              setFichierB(f);
              setPagesB(p);
              setPageActuelle(0);
            }}
            onReinitialiser={() => {
              setFichierB(null);
              setPagesB(null);
            }}
            texte="Glissez la nouvelle version"
          />
        </div>
      </div>

      {pageCountMin && (
        <div className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPageActuelle((p) => Math.max(0, p - 1))}
                disabled={pageActuelle === 0}
                className="rounded-md border border-border p-1.5 text-muted hover:text-ink disabled:opacity-30"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-mono text-xs text-muted">
                Page {pageActuelle + 1} / {pageCountMin}
              </span>
              <button
                type="button"
                onClick={() => setPageActuelle((p) => Math.min(pageCountMin - 1, p + 1))}
                disabled={pageActuelle === pageCountMin - 1}
                className="rounded-md border border-border p-1.5 text-muted hover:text-ink disabled:opacity-30"
              >
                <ChevronRight size={14} />
              </button>
            </div>
            {pagesA !== pagesB && (
              <p className="text-xs text-amber-700">
                {pagesA} page{pagesA! > 1 ? "s" : ""} contre {pagesB} — comparaison limitée aux pages communes.
              </p>
            )}
          </div>

          <div className="flex items-center justify-center overflow-auto rounded-lg border border-border bg-surface-2 p-4">
            {calcul || !diff ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element -- image générée localement (canvas de diff)
              <img src={diff.dataUrl} alt={`Différences page ${pageActuelle + 1}`} className="max-w-full" />
            )}
          </div>

          {diff && !calcul && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-center text-sm"
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-red-600" /> Zones différentes
              </span>
              <span className="ml-3 text-muted">
                {diff.pourcentagePixelsDifferents < 0.1
                  ? "Pages visuellement identiques"
                  : `${diff.pourcentagePixelsDifferents.toFixed(1)}% de la page a changé`}
              </span>
            </motion.p>
          )}
        </div>
      )}
    </div>
  );
}
