"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { zipSync } from "fflate";
import { CheckCircle2 } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { PageThumbnail } from "@/components/page-thumbnail";
import { usePdfRender } from "@/hooks/use-pdf-render";
import { pageEnJpeg } from "@/lib/pdf-export";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

export function PdfVersJpgTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [selection, setSelection] = useState<Set<number>>(new Set());
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ tailleTotale: number; blob: Blob; nom: string } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const { pages: vignettes, chargement, erreur: erreurRendu } = usePdfRender(fichier, { targetWidth: 200 });

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setSelection(new Set());
    setResultat(null);
    setErreur(null);
  };

  const basculer = (index: number) => {
    setSelection((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
    setResultat(null);
  };

  const traiter = async () => {
    if (!fichier || selection.size === 0) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const indices = Array.from(selection).sort((a, b) => a - b);

      if (indices.length === 1) {
        const blob = await pageEnJpeg(fichier, indices[0]);
        setResultat({ blob, tailleTotale: blob.size, nom: `aegis-num-page-${indices[0] + 1}.jpg` });
        return;
      }

      const fichiers: Record<string, Uint8Array> = {};
      for (const index of indices) {
        const blob = await pageEnJpeg(fichier, index);
        const octets = new Uint8Array(await blob.arrayBuffer());
        fichiers[`page-${index + 1}.jpg`] = octets;
      }
      const zip = zipSync(fichiers);
      const zipBlob = new Blob([new Uint8Array(zip)], { type: "application/zip" });
      setResultat({ blob: zipBlob, tailleTotale: zipBlob.size, nom: "aegis-num-pages.zip" });
    } catch {
      setErreur("La conversion a échoué — vérifiez le fichier.");
    } finally {
      setTraitement(false);
    }
  };

  return (
    <div>
      <SinglePdfDropzone
        fichier={fichier}
        pageCount={pageCount}
        onCharge={(f, p) => {
          setFichier(f);
          setPageCount(p);
          setSelection(new Set(Array.from({ length: p }, (_, i) => i)));
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && pageCount && (
        <>
          <p className="mt-6 text-sm text-muted">
            Toutes les pages sont sélectionnées par défaut — cliquez pour en retirer.
            {chargement && " Aperçu en cours de génération…"}
          </p>
          {erreurRendu && <p className="mt-2 text-sm text-amber-700">{erreurRendu}</p>}

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: pageCount }, (_, i) => i).map((index) => (
              <PageThumbnail
                key={index}
                label={`Page ${index + 1}`}
                dataUrl={vignettes.find((v) => v.index === index)?.dataUrl}
                etat={selection.has(index) ? "selectionne" : "exclu"}
                onClick={() => basculer(index)}
              />
            ))}
          </div>

          {erreur && <p className="mt-3 text-sm text-amber-700">{erreur}</p>}

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={traiter}
            disabled={traitement || selection.size === 0}
            className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement
              ? "Conversion en cours…"
              : `Convertir ${selection.size || ""} page${selection.size > 1 ? "s" : ""} en JPG`}
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
                Terminé — {formatTaille(resultat.tailleTotale)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => telechargerBlob(resultat.blob, resultat.nom)}
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
