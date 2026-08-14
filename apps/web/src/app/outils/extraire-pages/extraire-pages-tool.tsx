"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { CheckCircle2 } from "lucide-react";
import { SinglePdfDropzone } from "@/components/single-pdf-dropzone";
import { parsePageRanges, telechargerBlob, formatTaille } from "@/lib/pdf-page-ranges";

export function ExtrairePagesTool() {
  const [fichier, setFichier] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [plages, setPlages] = useState("");
  const [traitement, setTraitement] = useState(false);
  const [resultat, setResultat] = useState<{ octets: Uint8Array } | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  const reinitialiser = () => {
    setFichier(null);
    setPageCount(null);
    setPlages("");
    setResultat(null);
    setErreur(null);
  };

  const traiter = async () => {
    if (!fichier || !pageCount) return;
    const aGarder = parsePageRanges(plages, pageCount);
    if (aGarder.length === 0) {
      setErreur("Indiquez au moins une page à extraire.");
      return;
    }

    setTraitement(true);
    setErreur(null);
    setResultat(null);
    try {
      const bytes = await fichier.arrayBuffer();
      const source = await PDFDocument.load(bytes, { ignoreEncryption: true });

      const nouveau = await PDFDocument.create();
      const pages = await nouveau.copyPages(source, aGarder);
      pages.forEach((p) => nouveau.addPage(p));
      const octets = await nouveau.save();
      setResultat({ octets });
    } catch {
      setErreur("L'extraction a échoué — vérifiez le fichier et les pages indiquées.");
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
          setResultat(null);
        }}
        onReinitialiser={reinitialiser}
      />

      {fichier && pageCount && (
        <div className="mt-6">
          <label className="text-sm font-medium">Pages à extraire</label>
          <input
            value={plages}
            onChange={(e) => setPlages(e.target.value)}
            placeholder="Ex. 1-3, 5"
            className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          />
          <p className="mt-1 text-xs text-muted">
            Document de {pageCount} pages. L&apos;ordre indiqué est conservé dans le résultat.
          </p>

          {erreur && <p className="mt-2 text-sm text-amber-700">{erreur}</p>}

          <motion.button
            whileHover={{ scale: traitement ? 1 : 1.02 }}
            whileTap={{ scale: traitement ? 1 : 0.98 }}
            type="button"
            onClick={traiter}
            disabled={traitement || !plages.trim()}
            className="mt-4 rounded-lg bg-accent px-5 py-3 text-sm font-medium text-accent-ink disabled:opacity-40"
          >
            {traitement ? "Extraction en cours…" : "Extraire les pages"}
          </motion.button>
        </div>
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
                  "aegis-num-extrait.pdf",
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
