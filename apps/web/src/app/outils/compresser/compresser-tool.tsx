"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, ShieldAlert, TrendingDown } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { api, ApiError } from "@/lib/api";
import { telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

export function CompresserTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ blob: Blob } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setResultat(null);
    setErreur(null);
  };

  const traiter = async () => {
    if (!fichier) return;
    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const blob = await api.compresserPdf(fichier);
      setResultat({ blob });
    } catch (err) {
      setErreur(err instanceof ApiError ? err.message : "La compression a échoué");
    } finally {
      setTraitement(false);
    }
  };

  const gainPct = fichier && resultat ? Math.max(0, (1 - resultat.blob.size / fichier.size) * 100) : null;

  return (
    <div>
      <div className="mb-4 flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft px-4 py-3 text-sm">
        <ShieldAlert size={16} className="mt-0.5 shrink-0 text-accent" />
        <p className="text-muted">
          Recompression sans perte du texte et des flux internes (qpdf) — le gain dépend
          beaucoup du fichier d&apos;origine : un PDF déjà optimisé peut peu ou pas se réduire.
        </p>
      </div>

      <SinglePdfDropzone
        fichier={fichier}
        pageCount={pageCount}
        onCharge={(f, p) => {
          setFichier(f);
          setPageCount(p);
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {erreur && <p className="mt-3 text-sm text-amber-700">{erreur}</p>}

      {fichier && !resultat && (
        <motion.button
          whileHover={{ scale: traitement ? 1 : 1.02 }}
          whileTap={{ scale: traitement ? 1 : 0.98 }}
          type="button"
          onClick={traiter}
          disabled={traitement}
          className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
        >
          {traitement ? "Compression en cours…" : "Compresser le PDF"}
        </motion.button>
      )}

      <AnimatePresence>
        {resultat && fichier && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 rounded-lg border border-good/30 bg-good-soft px-4 py-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-good" />
                <p className="text-sm font-medium text-good">
                  {formatTaille(fichier.size)} → {formatTaille(resultat.blob.size)}
                </p>
                {gainPct !== null && gainPct > 1 && (
                  <span className="flex items-center gap-1 rounded-full bg-good/15 px-2 py-0.5 text-xs font-medium text-good">
                    <TrendingDown size={12} /> -{gainPct.toFixed(0)}%
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => telechargerBlob(resultat.blob, "aegis-num-compresse.pdf")}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-ink"
              >
                Télécharger
              </button>
            </div>
            {gainPct !== null && gainPct <= 1 && (
              <p className="mt-2 text-xs text-muted">
                Ce fichier était déjà bien compressé — gain négligeable.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
