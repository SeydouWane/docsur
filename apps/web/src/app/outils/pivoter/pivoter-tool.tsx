"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument, degrees } from "pdf-lib";
import { CheckCircle2, RotateCcw, RotateCw } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

function normaliser(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

export function PivoterTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [rotations, setRotations] = useState<number[]>([]);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const { pages: vignettes, chargement, erreur: erreurRendu } = usePdfRender(fichier, { targetWidth: 200 });

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setRotations([]);
    setResultat(null);
    setErreur(null);
  };

  const pivoterPage = (index: number, delta: number) => {
    setRotations((prev) => prev.map((r, i) => (i === index ? normaliser(r + delta) : r)));
    setResultat(null);
  };

  const pivoterTout = (delta: number) => {
    setRotations((prev) => prev.map((r) => normaliser(r + delta)));
    setResultat(null);
  };

  const traiter = async () => {
    if (!fichier) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const pdf = await PDFDocument.load(bytes, { ignoreEncryption: true });
      pdf.getPages().forEach((page, i) => {
        if (rotations[i]) {
          const actuelle = page.getRotation().angle;
          page.setRotation(degrees(normaliser(actuelle + rotations[i])));
        }
      });
      const octets = await pdf.save();
      setResultat({ octets });
    } catch {
      setErreur("La rotation a échoué — vérifiez le fichier.");
    } finally {
      setTraitement(false);
    }
  };

  const auMoinsUneRotation = rotations.some((r) => r !== 0);

  return (
    <div>
      <SinglePdfDropzone
        fichier={fichier}
        pageCount={pageCount}
        onCharge={(f, p) => {
          setFichier(f);
          setPageCount(p);
          setRotations(Array.from({ length: p }, () => 0));
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && pageCount && (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-muted">
              Pivotez chaque page individuellement, ou toutes à la fois.
              {chargement && " Aperçu en cours de génération…"}
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => pivoterTout(-90)}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-ink"
              >
                <RotateCcw size={13} /> Tout
              </button>
              <button
                type="button"
                onClick={() => pivoterTout(90)}
                className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs text-muted hover:text-ink"
              >
                <RotateCw size={13} /> Tout
              </button>
            </div>
          </div>
          {erreurRendu && <p className="mt-2 text-sm text-amber-700">{erreurRendu}</p>}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {rotations.map((angle, index) => {
              const vignette = vignettes.find((v) => v.index === index);
              return (
                <div key={index} className="overflow-hidden rounded-lg border border-border bg-surface">
                  <div className="flex h-[170px] items-center justify-center overflow-hidden bg-surface-2">
                    {vignette ? (
                      // eslint-disable-next-line @next/next/no-img-element -- aperçu genere localement (canvas)
                      <img
                        src={vignette.dataUrl}
                        alt={`Page ${index + 1}`}
                        className="max-h-[85%] max-w-[85%] transition-transform duration-200"
                        style={{ transform: `rotate(${angle}deg)` }}
                        draggable={false}
                      />
                    ) : (
                      <div className="h-6 w-6 animate-pulse rounded-full bg-border" />
                    )}
                  </div>
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="font-mono text-xs text-muted">
                      Page {index + 1}
                      {angle !== 0 && <span className="ml-1 text-accent">· {angle}°</span>}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        aria-label={`Pivoter la page ${index + 1} vers la gauche`}
                        onClick={() => pivoterPage(index, -90)}
                        className="rounded-md p-1 text-muted hover:text-ink"
                      >
                        <RotateCcw size={13} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Pivoter la page ${index + 1} vers la droite`}
                        onClick={() => pivoterPage(index, 90)}
                        className="rounded-md p-1 text-muted hover:text-ink"
                      >
                        <RotateCw size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {erreur && <p className="mt-3 text-sm text-amber-700">{erreur}</p>}

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={traiter}
            disabled={traitement || !auMoinsUneRotation}
            className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement ? "Application…" : "Appliquer la rotation"}
          </motion.button>
        </>
      )}

      <AnimatePresence>
        {resultat && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex items-center justify-between rounded-lg border border-good/30 bg-good-soft px-4 py-3"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-good" />
              <p className="text-sm font-medium text-good">
                Terminé — {formatTaille(resultat.octets.byteLength)}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                telechargerBlob(
                  new Blob([new Uint8Array(resultat.octets)], { type: "application/pdf" }),
                  "aegis-num-pivote.pdf",
                )
              }
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
            >
              Télécharger
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
